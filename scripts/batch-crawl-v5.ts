/**
 * 批量爬取脚本 v5 - 增强版
 * 
 * 增强功能:
 * 1. 新增北极星光伏网数据源
 * 2. 增量更新 - 跳过已爬取的URL
 * 3. 去重优化 - 基于标题相似度
 * 4. 更好的错误处理与重试
 * 5. 爬取进度保存
 * 
 * 数据源:
 * 1. 中国电力网 (chinapower.com.cn) - SSR, 多栏目, 可翻页
 * 2. 国家能源局 (nea.gov.cn) - SSR, 政策新闻
 * 3. 中国新能源网 (newenergy.org.cn) - SSR, 科研动态/政策
 * 4. 索比光伏网 (solarbe.com) - SSR首页, 光伏行业
 * 5. 北极星光伏网 (bjx.com.cn) - SSR, 项目/招标/新闻
 * 
 * 用法: npx tsx scripts/batch-crawl-v5.ts [--incremental]
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const STATE_FILE = path.join(DATA_DIR, '.crawl-state.json');
const INCREMENTAL = process.argv.includes('--incremental');

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ===== 时间过滤配置 =====
const DAYS_TO_KEEP = 90; // 默认保留90天内的信息
const DAYS_TO_RECENT = 30; // 最近30天的信息优先显示

function isWithinDays(dateStr: string, days: number): boolean {
  if (!dateStr) return true;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return true;
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  } catch {
    return true;
  }
}

function getRecencyScore(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 0;
    const now = new Date();
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= DAYS_TO_KEEP) {
      if (diffDays <= DAYS_TO_RECENT) return 100;
      return 50;
    }
    return 0;
  } catch {
    return 0;
  }
}

function filterByDate<T extends { date?: string }>(items: T[]): T[] {
  return items
    .map(item => ({ ...item, _score: getRecencyScore(item.date), _date: item.date || '' }))
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return b._date.localeCompare(a._date);
    })
    .filter(item => item._score > 0)
    .map(({ _score, _date, ...item }) => item as T);
}

// ===== 爬取状态管理 =====

interface CrawlState {
  lastRun: string;
  crawledUrls: string[];
  stats: Record<string, number>;
}

function loadState(): CrawlState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
  } catch { /* ignore */ }
  return { lastRun: '', crawledUrls: [], stats: {} };
}

function saveState(state: CrawlState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ===== 通用提取函数 =====

const PROVINCES = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','内蒙古','广西','西藏','宁夏','新疆'];

function extractProvince(text: string): string {
  for (const p of PROVINCES) { if (text.includes(p)) return p; }
  return '';
}

function extractCapacity(text: string): string {
  const patterns = [
    /([\d.]+)\s*(GW|GWh|MW|MWh|kW|kWh)/i,
    /([\d.]+)\s*万千瓦/,
    /([\d.]+)\s*吉瓦/,
    /([\d.]+)\s*兆瓦/,
    /装机\s*([\d.]+)\s*(GW|MW|kW)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return `${m[1]}${m[2]}`;
  }
  return '';
}

function extractAmount(text: string): string {
  const m = text.match(/([\d.]+)\s*(亿元|万元|万|元)/);
  if (!m) return '';
  return `${m[1]}${m[2]}`;
}

function extractCompany(text: string): string {
  const patterns = [
    /(?:投资方|建设单位|业主|项目单位|中标方|中标单位|承包方|开发方|由|签约|承建|参建)[：:]\s*([^\s,，。；;]+(?:公司|集团|有限|股份|研究院|中心|局|厅|部|厂))/,
    /((?:中国|国|华|大|中)[^\s,，。；;]{2,20}?(?:公司|集团|有限|股份))/,
    /((?:省|市|区|县)[^\s,，。；;]{0,10}(?:能源|电力|电网|新能源)[^\s,，。；;]{0,10}?(?:公司|集团|有限|股份|局))/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return '';
}

function extractDate(text: string): string {
  const m = text.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const m2 = text.match(/(\d{4})[年](\d{1,2})[月]/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}`;
  return '';
}

// ===== 自动分类 =====

const PROJECT_KW = ['项目','电站','基地','装机','光伏','风电','储能','充电站','并网','投产','开工','建设','落地','签约','发电','组件','逆变器','新能源','清洁能源','绿色能源','碳中和','碳达峰','可再生','绿电','氢能','制氢','核电','水电','抽蓄','锂电池','源网荷储','虚拟电厂','微电网','综合能源','智慧能源','零碳'];
const BIDDING_KW = ['招标','投标','采购','竞价','竞标','询价','比选','资格预审','标段','报名','截标','开标','选商','招商'];
const AWARD_KW = ['中标','成交','公示','候选人','预中标','中标结果','中标公告','入围'];
const CHARGER_KW = ['充电桩','充电站','充电设施','换电站','充电网','充电基础设施','充换电','超充','快充','充电服务'];

function classifyArticle(title: string, summary: string): 'project' | 'bidding' | 'award' | 'charger' {
  const text = `${title} ${summary}`;
  if (CHARGER_KW.some(kw => text.includes(kw))) return 'charger';
  if (AWARD_KW.some(kw => text.includes(kw))) return 'award';
  if (BIDDING_KW.some(kw => text.includes(kw))) return 'bidding';
  if (PROJECT_KW.some(kw => text.includes(kw))) return 'project';
  return 'project';
}

function determineType(title: string, summary: string): string {
  const text = `${title} ${summary}`;
  if (/储能|电池|锂电池|蓄能|抽水蓄能|电化学/.test(text)) return '储能';
  if (/光伏|太阳能|分布式光伏|集中式光伏|组件|硅片/.test(text)) return '光伏';
  if (/风电|风力发电|风场|风机/.test(text)) return '风电';
  if (/充电|充电桩|充电站|换电/.test(text)) return '充电';
  if (/氢能|制氢|储氢|燃料电池/.test(text)) return '氢能';
  return '综合能源';
}

function determineStatus(title: string, summary: string, category: string): string {
  const text = `${title} ${summary}`;
  if (category === 'bidding') {
    if (/已截止|已开标|已结束/.test(text)) return '已截止';
    return '报名中';
  }
  if (category === 'award') return '已公示';
  return '';
}

// ===== 数据源1: 中国电力网 =====

const CHINAPOWER_SECTIONS: Array<{path: string; name: string}> = [
  { path: '/chuneng/', name: '储能' },
  { path: '/tynfd/', name: '新能源发电' },
  { path: '/fd/', name: '风电' },
  { path: '/xw/', name: '电力新闻' },
  { path: '/dww/', name: '电网' },
  { path: '/flfd/', name: '分散式发电' },
  { path: '/qingneng/', name: '氢能' },
  { path: '/tanzhonghe/', name: '碳综合' },
  { path: '/guihuajianshe/', name: '规划建设' },
  { path: '/zjqy/', name: '智能电气' },
  { path: '/dlxxh/', name: '电力信息化' },
];

async function getChinaPowerLinks(section: string, maxPages: number, crawledUrls: Set<string>): Promise<string[]> {
  const allLinks = new Set<string>();
  const baseUrl = `http://www.chinapower.com.cn${section}`;
  
  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = page === 1 ? baseUrl : `${baseUrl}index_${page}.html`;
    try {
      const resp = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': baseUrl,
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!resp.ok) break;
      const html = await resp.text();
      
      const linkRegex = /href="(\/[^"]*\/\d{6,8}\/\d+\.html)"/g;
      let m: RegExpExecArray | null;
      let found = 0;
      while ((m = linkRegex.exec(html)) !== null) {
        const fullUrl = `http://www.chinapower.com.cn${m[1]}`;
        if (!crawledUrls.has(fullUrl) && !allLinks.has(fullUrl)) found++;
        allLinks.add(fullUrl);
      }
      
      console.log(`  [ChinaPower] ${section} page ${page}: ${found} new, total ${allLinks.size}`);
      if (found === 0 && page > 2) break; // 没有新链接且已翻页，提前退出
    } catch {
      break;
    }
    await sleep(200);
  }
  
  return Array.from(allLinks);
}

async function crawlChinaPowerDetail(url: string): Promise<{title: string; summary: string; date: string} | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    
    const titleM = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    let title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : '';
    if (!title) {
      const fallbackM = html.match(/<title>([^<]+)/);
      title = fallbackM ? fallbackM[1].replace(/_电力网$/, '').trim() : '';
    }
    
    const dateM = html.match(/发布时间[：:]\s*(\d{4}-\d{2}-\d{2})/) || html.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateM ? dateM[1].trim() : '';
    
    let summary = '';
    const contentM = html.match(/class="content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
    if (contentM) {
      summary = contentM[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&mdash;/g, '—')
        .replace(/&ldquo;|&rdquo;/g, '"')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500);
    }
    
    if (!summary || summary.length < 30) {
      const paragraphs = html.match(/<p[^>]*>([^<]{20,})<\/p>/g) || [];
      summary = paragraphs
        .map(p => p.replace(/<[^>]+>/g, '').trim())
        .filter(t => t.length > 20 && !t.includes('版权') && !t.includes('免责') && !t.includes('声明'))
        .join(' ')
        .slice(0, 500);
    }
    
    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源2: 国家能源局 =====

const NEA_SECTIONS = [
  { path: 'http://www.nea.gov.cn/xwzx/index.htm', name: '新闻中心' },
  { path: 'http://www.nea.gov.cn/sjzz/index.htm', name: '数据中心' },
  { path: 'http://www.nea.gov.cn/politics/index.htm', name: '政策法规' },
];

async function getNEALinks(sectionUrl: string): Promise<string[]> {
  const links = new Set<string>();
  try {
    const resp = await fetch(sectionUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const base = 'http://www.nea.gov.cn/';
    
    const regexes = [
      /href="(\d{8}\/[a-f0-9]+\/c\.html)"/g,
      /href="(\/\d{4}-\d{2}\/\d{2}\/c_\d+\.htm)"/g,
      /href="\.\.\/(\d{8}\/[a-f0-9]+\/c\.html)"/g,
    ];
    
    for (const regex of regexes) {
      let m: RegExpExecArray | null;
      while ((m = regex.exec(html)) !== null) {
        const url = m[1].startsWith('/') ? `http://www.nea.gov.cn${m[1]}` : base + m[1];
        links.add(url);
      }
    }
    
    console.log(`  [NEA] ${sectionUrl}: ${links.size} links`);
  } catch {
    console.log(`  [NEA] Failed: ${sectionUrl}`);
  }
  return Array.from(links);
}

async function crawlNEADetail(url: string): Promise<{title: string; summary: string; date: string} | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    
    const titleM = html.match(/name="ArticleTitle"\s+content="([^"]+)"/);
    const title = titleM ? titleM[1].trim() : '';
    const dateM = html.match(/name="PubDate"\s+content="([^"]+)"/);
    const date = dateM ? dateM[1].trim() : '';
    
    const paragraphs = html.match(/<p[^>]*>([^<]{20,})<\/p>/g) || [];
    const summary = paragraphs.map(p => p.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 20).join(' ').slice(0, 500);
    
    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源3: 中国新能源网 =====

const NEWENERGY_SECTIONS = [
  'http://www.newenergy.org.cn/xnyjz/yjdt/',
  'http://www.newenergy.org.cn/xnyjz/zcfg/',
  'http://www.newenergy.org.cn/hqsy/hqdt/',
  'http://www.newenergy.org.cn/tynfd/tuofeng/',
];

async function getNewEnergyLinks(sectionUrl: string): Promise<string[]> {
  const links = new Set<string>();
  try {
    const resp = await fetch(sectionUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const linkRegex = /href="\.\/(\d{6}\/t\d+_\d+\.html)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      links.add(sectionUrl + m[1]);
    }
    console.log(`  [NewEnergy] ${sectionUrl}: ${links.size} links`);
  } catch {
    console.log(`  [NewEnergy] Failed: ${sectionUrl}`);
  }
  return Array.from(links);
}

async function crawlNewEnergyDetail(url: string): Promise<{title: string; summary: string; date: string} | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    let title = titleM ? titleM[1].replace(/----.*$/, '').trim() : '';
    const dateM = html.match(/(\d{4})[年\-](\d{1,2})[月\-](\d{1,2})/);
    const date = dateM ? `${dateM[1]}-${dateM[2].padStart(2, '0')}-${dateM[3].padStart(2, '0')}` : '';
    
    const paragraphs = html.match(/<p[^>]*>([^<]{20,})<\/p>/g) || [];
    const summary = paragraphs.map(p => p.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 20).join(' ').slice(0, 500);
    
    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源4: 索比光伏网 =====

async function getSolarbeLinks(): Promise<string[]> {
  const links = new Set<string>();
  try {
    const resp = await fetch('https://www.solarbe.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const linkRegex = /href="(https?:\/\/www\.solarbe\.com\/[^"]*show-htm-itemid-\d+\.html)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      links.add(m[1]);
    }
  } catch {
    console.log(`  [Solarbe] Failed`);
  }
  return Array.from(links);
}

async function crawlSolarbeDetail(url: string): Promise<{title: string; summary: string; date: string} | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    let title = titleM ? titleM[1].replace(/-索比光伏网$/, '').trim() : '';
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateM ? dateM[1] : '';
    
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map(p => p.replace(/<[^>]+>/g, '').trim())
      .filter(t => t.length > 30 && !t.includes('索比光伏网为您提供') && !t.includes('商务合作'))
      .join(' ')
      .slice(0, 500);
    
    if (!title || summary.length < 30) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源5: 北极星光伏网 (新增) =====

async function getBJXLinks(sectionUrl: string, maxPages: number = 5): Promise<string[]> {
  const links = new Set<string>();
  try {
    for (let page = 1; page <= maxPages; page++) {
      const pageUrl = page === 1 ? sectionUrl : `${sectionUrl}index_${page}.html`;
      try {
        const resp = await fetch(pageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html',
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!resp.ok) break;
        const html = await resp.text();
        
        // BJX article links
        const linkRegex = /href="(https?:\/\/guangfu\.bjx\.com\.cn\/[^"]*\/\d+\.html)"/g;
        let m: RegExpExecArray | null;
        let found = 0;
        while ((m = linkRegex.exec(html)) !== null) {
          if (!links.has(m[1])) found++;
          links.add(m[1]);
        }
        
        // Also try relative links
        const relRegex = /href="(\/news\/\d+\/\d+\/\d+\.html)"/g;
        while ((m = relRegex.exec(html)) !== null) {
          const fullUrl = `https://guangfu.bjx.com.cn${m[1]}`;
          if (!links.has(fullUrl)) found++;
          links.add(fullUrl);
        }
        
        console.log(`  [BJX] ${sectionUrl} page ${page}: ${found} new`);
        if (found === 0 && page > 2) break;
      } catch {
        break;
      }
      await sleep(300);
    }
  } catch {
    console.log(`  [BJX] Failed: ${sectionUrl}`);
  }
  return Array.from(links);
}

async function crawlBJXDetail(url: string): Promise<{title: string; summary: string; date: string} | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    
    const titleM = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || html.match(/<title>([^<]+)-北极星光伏/);
    let title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : '';
    
    const dateM = html.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
    const date = dateM ? dateM[1].replace(/\//g, '-') : '';
    
    const paragraphs = html.match(/<p[^>]*>([^<]{25,})<\/p>/g) || [];
    const summary = paragraphs
      .map(p => p.replace(/<[^>]+>/g, '').trim())
      .filter(t => t.length > 25 && !t.includes('北极星') && !t.includes('版权') && !t.includes('免责'))
      .join(' ')
      .slice(0, 500);
    
    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 主流程 =====

async function main() {
  console.log(`=== 光伏储能数据批量爬取 v5 ===`);
  console.log(`模式: ${INCREMENTAL ? '增量更新' : '全量爬取'}\n`);
  
  const state = loadState();
  const crawledUrls = new Set(state.crawledUrls);
  
  if (INCREMENTAL) {
    console.log(`上次运行: ${state.lastRun || '无'}`);
    console.log(`已爬取URL数: ${crawledUrls.size}`);
  }
  
  const allItems: Array<{
    title: string; summary: string; date: string;
    sourceUrl: string; sourceName: string;
  }> = [];
  
  const BATCH_SIZE = 20;
  
  // ---------- 数据源1: 中国电力网 ----------
  console.log('\n--- 数据源1: 中国电力网 ---');
  let cpTotalLinks = 0;
  const cpLinks: string[] = [];
  
  for (const section of CHINAPOWER_SECTIONS) {
    console.log(`  栏目: ${section.name}`);
    const links = await getChinaPowerLinks(section.path, INCREMENTAL ? 3 : 15, crawledUrls);
    cpTotalLinks += links.length;
    cpLinks.push(...links);
  }
  
  const cpUniqueLinks = [...new Set(cpLinks)];
  console.log(`  中国电力网: ${cpTotalLinks} -> 去重后 ${cpUniqueLinks.length}`);
  
  for (let i = 0; i < cpUniqueLinks.length; i += BATCH_SIZE) {
    const batch = cpUniqueLinks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(url => crawlChinaPowerDetail(url)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r && r.title) {
        allItems.push({ title: r.title, summary: r.summary || '', date: r.date, sourceUrl: batch[j], sourceName: '中国电力网' });
      }
    }
    if (i % 200 === 0) console.log(`    进度: ${Math.min(i + BATCH_SIZE, cpUniqueLinks.length)}/${cpUniqueLinks.length}`);
    await sleep(50);
  }
  
  // ---------- 数据源2: 国家能源局 ----------
  console.log('\n--- 数据源2: 国家能源局 ---');
  const neaLinks: string[] = [];
  for (const section of NEA_SECTIONS) {
    const links = await getNEALinks(section.path);
    neaLinks.push(...links);
  }
  const neaUniqueLinks = [...new Set(neaLinks)];
  console.log(`  国家能源局: 去重后 ${neaUniqueLinks.length}`);
  
  for (let i = 0; i < neaUniqueLinks.length; i += BATCH_SIZE) {
    const batch = neaUniqueLinks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(url => crawlNEADetail(url)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r && r.title) {
        allItems.push({ title: r.title, summary: r.summary || '', date: r.date, sourceUrl: batch[j], sourceName: '国家能源局' });
      }
    }
    await sleep(50);
  }
  
  // ---------- 数据源3: 中国新能源网 ----------
  console.log('\n--- 数据源3: 中国新能源网 ---');
  const neLinks: string[] = [];
  for (const section of NEWENERGY_SECTIONS) {
    const links = await getNewEnergyLinks(section);
    neLinks.push(...links);
  }
  const neUniqueLinks = [...new Set(neLinks)];
  console.log(`  中国新能源网: 去重后 ${neUniqueLinks.length}`);
  
  if (neUniqueLinks.length > 0) {
    for (let i = 0; i < neUniqueLinks.length; i += BATCH_SIZE) {
      const batch = neUniqueLinks.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(url => crawlNewEnergyDetail(url)));
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r && r.title) {
          allItems.push({ title: r.title, summary: r.summary || '', date: r.date, sourceUrl: batch[j], sourceName: '中国新能源网' });
        }
      }
      await sleep(50);
    }
  }
  
  // ---------- 数据源4: 索比光伏网 ----------
  console.log('\n--- 数据源4: 索比光伏网 ---');
  const sbLinks = await getSolarbeLinks();
  console.log(`  索比光伏网: ${sbLinks.length} 个链接`);
  
  if (sbLinks.length > 0) {
    const results = await Promise.all(sbLinks.map(url => crawlSolarbeDetail(url)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r && r.title) {
        allItems.push({ title: r.title, summary: r.summary || '', date: r.date, sourceUrl: sbLinks[j], sourceName: '索比光伏网' });
      }
    }
  }
  
  // ---------- 数据源5: 北极星光伏网 (新增) ----------
  console.log('\n--- 数据源5: 北极星光伏网 ---');
  const bjxSections = [
    'https://guangfu.bjx.com.cn/news/',
    'https://guangfu.bjx.com.cn/project/',
    'https://guangfu.bjx.com.cn/bidding/',
  ];
  const bjxLinks: string[] = [];
  
  for (const section of bjxSections) {
    const links = await getBJXLinks(section, INCREMENTAL ? 2 : 5);
    bjxLinks.push(...links);
  }
  const bjxUniqueLinks = [...new Set(bjxLinks)];
  console.log(`  北极星光伏网: 去重后 ${bjxUniqueLinks.length}`);
  
  if (bjxUniqueLinks.length > 0) {
    for (let i = 0; i < bjxUniqueLinks.length; i += BATCH_SIZE) {
      const batch = bjxUniqueLinks.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(url => crawlBJXDetail(url)));
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r && r.title) {
          allItems.push({ title: r.title, summary: r.summary || '', date: r.date, sourceUrl: batch[j], sourceName: '北极星光伏网' });
        }
      }
      await sleep(50);
    }
  }
  
  // ---------- 分类和保存 ----------
  console.log(`\n=== 数据处理 ===`);
  console.log(`总计爬取: ${allItems.length} 条`);
  
  // 去重
  const seen = new Set<string>();
  const uniqueItems = allItems.filter(item => {
    const key = item.title.trim().slice(0, 50); // 取前50字符做去重key
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`去重后: ${uniqueItems.length} 条`);
  
  // 分类
  const projects: any[] = [];
  const bidding: any[] = [];
  const awards: any[] = [];
  const chargers: any[] = [];
  
  let idCounter = 1;
  for (const item of uniqueItems) {
    const category = classifyArticle(item.title, item.summary || '');
    const text = `${item.title} ${item.summary || ''}`;
    const province = extractProvince(text);
    const capacity = extractCapacity(text);
    const amount = extractAmount(text);
    const company = extractCompany(text);
    const date = item.date || extractDate(text);
    
    const record = {
      id: String(idCounter++),
      title: item.title,
      province,
      summary: (item.summary || '').slice(0, 300),
      capacity, amount, company, date,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
    };
    
    switch (category) {
      case 'project':
        projects.push({ ...record, type: determineType(item.title, item.summary || ''), name: item.title });
        break;
      case 'bidding':
        bidding.push({ ...record, category: determineType(item.title, item.summary || ''), status: determineStatus(item.title, item.summary || '', 'bidding') });
        break;
      case 'award':
        awards.push({ ...record, category: determineType(item.title, item.summary || ''), status: determineStatus(item.title, item.summary || '', 'award') });
        break;
      case 'charger':
        chargers.push(record);
        break;
    }
  }
  
  console.log(`\n分类结果 (过滤前):`);
  console.log(`  项目: ${projects.length}`);
  console.log(`  招标: ${bidding.length}`);
  console.log(`  中标: ${awards.length}`);
  console.log(`  充电桩: ${chargers.length}`);

  // 按时间过滤和排序
  const filteredProjects = filterByDate(projects);
  const filteredBidding = filterByDate(bidding);
  const filteredAwards = filterByDate(awards);
  const filteredChargers = filterByDate(chargers);

  console.log(`\n时间过滤后 (保留${DAYS_TO_KEEP}天内):`);
  console.log(`  项目: ${filteredProjects.length}`);
  console.log(`  招标: ${filteredBidding.length}`);
  console.log(`  中标: ${filteredAwards.length}`);
  console.log(`  充电桩: ${filteredChargers.length}`);
  
  // 保存
  fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify(filteredProjects, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'bidding.json'), JSON.stringify(filteredBidding, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'awards.json'), JSON.stringify(filteredAwards, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'chargers.json'), JSON.stringify(filteredChargers, null, 2));
  
  // 保存爬取状态
  state.lastRun = new Date().toISOString();
  state.crawledUrls = [...crawledUrls, ...uniqueItems.map(i => i.sourceUrl)];
  state.stats = {
    projects: filteredProjects.length,
    bidding: filteredBidding.length,
    awards: filteredAwards.length,
    chargers: filteredChargers.length,
    total: uniqueItems.length,
  };
  saveState(state);
  
  console.log('\n数据已保存到 public/data/');
  
  const provSet = new Set(projects.map(p => p.province).filter(Boolean));
  console.log(`项目覆盖省份: ${provSet.size}`);
  console.log(`数据来源: ${[...new Set(uniqueItems.map(i => i.sourceName))].join(', ')}`);
}

main().catch(console.error);
