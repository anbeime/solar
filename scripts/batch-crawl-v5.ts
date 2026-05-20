/**
 * 批量爬取脚本 v6 - 政府公共资源交易版
 *
 * 数据源 (共6大类):
 * 1. 行业媒体: 中国电力网、国家能源局、中国新能源网、索比光伏网、北极星光伏网
 * 2. 国家级政府平台: 中国政府采购网、全国公共资源交易平台、中国招投标公共服务平台、国家发改委
 * 3. 省级公共资源交易平台 (31个省市)
 * 4. 市级重点平台 (枣庄/驻马店/洛阳/咸宁)
 * 5. 充电桩数据: 中国充电联盟
 * 6. 其他行业媒体: 储能与电力市场、中国能源网
 *
 * 用法: npx tsx scripts/batch-crawl-v5.ts [--incremental] [--sources=media,gov,province]
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const STATE_FILE = path.join(DATA_DIR, '.crawl-state.json');
const INCREMENTAL = process.argv.includes('--incremental');

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

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

// ===== 数据源6: 省级公共资源交易平台 (新增) =====

const PROVINCE_PLATFORMS: Array<{name: string; url: string; province: string}> = [
  { name: "河南省公共资源交易中心", url: "http://hnsggzyjy.henan.gov.cn", province: "河南" },
  { name: "安徽省公共资源交易监管网", url: "https://www.ahggzyjy.cn", province: "安徽" },
  { name: "四川省公共资源交易信息网", url: "https://www.spprec.com", province: "四川" },
  { name: "浙江省公共资源交易服务平台", url: "https://zjpubservice.zjzwfw.gov.cn", province: "浙江" },
  { name: "江苏省公共资源交易平台", url: "https://jsggzy.jszwfw.gov.cn", province: "江苏" },
  { name: "河北省招标投标公共服务平台", url: "https://www.hebeieb.com", province: "河北" },
  { name: "江西省公共资源交易平台", url: "http://www.jxsggzy.cn", province: "江西" },
  { name: "云南省公共资源交易平台", url: "https://www.ynggzy.com", province: "云南" },
  { name: "天津市公共资源交易平台", url: "https://www.tjggzy.com", province: "天津" },
  { name: "山东省公共资源交易网", url: "https://www.sdggzyjy.gov.cn", province: "山东" },
  { name: "湖北省公共资源交易电子服务系统", url: "https://www.hbggzyfwpt.cn", province: "湖北" },
  { name: "湖南省公共资源交易服务平台", url: "https://www.hnsggzy.com", province: "湖南" },
  { name: "广东省公共资源交易平台", url: "http://bs.gdggzy.org.cn", province: "广东" },
  { name: "广西壮族自治区公共资源交易平台", url: "https://gxggzy.gxzf.gov.cn", province: "广西" },
  { name: "重庆市公共资源交易网", url: "https://www.cqggzy.com", province: "重庆" },
  { name: "贵州省公共资源交易公共服务平台", url: "http://ggzy.guizhou.gov.cn", province: "贵州" },
  { name: "陕西省公共资源交易中心", url: "http://www.sxggzyjy.cn", province: "陕西" },
  { name: "甘肃省公共资源交易网", url: "http://ggzyjy.gansu.gov.cn", province: "甘肃" },
  { name: "青海省公共资源交易网", url: "http://www.qhggzyjy.gov.cn", province: "青海" },
  { name: "宁夏回族自治区公共资源交易网", url: "https://www.nxggzyjy.org", province: "宁夏" },
  { name: "新疆维吾尔自治区公共资源交易网", url: "https://www.xjggzy.gov.cn", province: "新疆" },
  { name: "北京市公共资源交易服务平台", url: "https://ggzyfw.beijing.gov.cn", province: "北京" },
  { name: "山西省公共资源交易平台", url: "https://www.sxggzy.cn", province: "山西" },
  { name: "内蒙古自治区公共资源交易网", url: "http://ggzy.nmg.gov.cn", province: "内蒙古" },
  { name: "辽宁省公共资源交易网", url: "http://www.lnggzy.gov.cn", province: "辽宁" },
  { name: "吉林省公共资源交易公共服务平台", url: "http://www.jlsggzyjy.gov.cn", province: "吉林" },
  { name: "黑龙江省公共资源交易网", url: "http://www.hljgggy.gov.cn", province: "黑龙江" },
  { name: "上海市公共资源交易服务平台", url: "http://ggzy.sheic.org.cn", province: "上海" },
  { name: "福建省公共资源交易电子公共服务平台", url: "https://ggzyfw.fujian.gov.cn", province: "福建" },
  { name: "海南省公共资源交易服务中心", url: "http://zw.hainan.gov.cn/ggzy/", province: "海南" },
];

// 新能源关键词 - 用于过滤公共资源交易平台的公告
const ENERGY_KEYWORDS = [
  '光伏', '储能', '充电桩', '光储充', '源网荷储', '渔光互补',
  '分布式光伏', '风电', '新能源', '充电站', '换电', '虚拟电厂',
  '微电网', '综合能源', '智慧能源', '绿电', '氢能', '太阳能',
  '锂电池', '逆变器', '组件', 'EPC',
];

async function crawlProvincePlatform(platform: {name: string; url: string; province: string}): Promise<Array<{title: string; summary: string; date: string; sourceUrl: string; sourceName: string}>> {
  const items: Array<{title: string; summary: string; date: string; sourceUrl: string; sourceName: string}> = [];
  try {
    // 尝试多个常见路径
    const searchPaths = [
      '/jyxx/002001/002001001/',
      '/jyxx/002001/',
      '/info/index',
      '/search',
      '',
    ];

    for (const searchPath of searchPaths.slice(0, INCREMENTAL ? 1 : 2)) {
      const targetUrl = `${platform.url}${searchPath}`;
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          },
          signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        // 提取所有链接并按新能源关键词过滤
        const linkMatches = html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
        for (const m of linkMatches) {
          let href = m[1];
          const titleTag = m[2].replace(/<[^>]+>/g, '').trim();
          if (!titleTag || titleTag.length < 8) continue;

          // 关键词过滤
          const hasEnergyKw = ENERGY_KEYWORDS.some(kw => titleTag.includes(kw));
          if (!hasEnergyKw) continue;

          // 补全URL
          if (href.startsWith('/')) href = `${platform.url}${href}`;
          else if (!href.startsWith('http')) href = `${platform.url}/${href}`;

          items.push({
            title: `[${platform.province}] ${titleTag}`,
            summary: `来源: ${platform.name}`,
            date: '',
            sourceUrl: href,
            sourceName: platform.name,
          });
        }

        if (items.length > 0) break; // 找到数据就停止尝试其他路径
      } catch {
        continue;
      }
      await sleep(100);
    }
  } catch {
    // 静默失败
  }
  return items;
}

// ===== 数据源7: 市级重点平台 (新增) =====

const CITY_PLATFORMS: Array<{name: string; url: string; city: string}> = [
  { name: "枣庄市公共资源交易网", url: "http://ggzy.zaozhuang.gov.cn", city: "枣庄" },
  { name: "驻马店市公共资源电子交易系统", url: "http://ggzy.zhumadian.gov.cn", city: "驻马店" },
  { name: "洛阳市公共资源交易中心", url: "https://www.lyggzy.com", city: "洛阳" },
  { name: "咸宁市公共资源交易信息网", url: "https://ggzy.xianning.gov.cn", city: "咸宁" },
];

async function crawlCityPlatform(platform: {name: string; url: string; city: string}): Promise<Array<{title: string; summary: string; date: string; sourceUrl: string; sourceName: string}>> {
  const items: Array<{title: string; summary: string; date: string; sourceUrl: string; sourceName: string}> = [];
  try {
    const paths = ['/jyxx/', '/info/', '/search', ''];
    for (const p of paths.slice(0, 1)) {
      try {
        const resp = await fetch(`${platform.url}${p}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        const linkMatches = html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi);
        for (const m of linkMatches) {
          let href = m[1];
          const titleTag = m[2].replace(/<[^>]+>/g, '').trim();
          if (!titleTag || titleTag.length < 8) continue;
          if (!ENERGY_KEYWORDS.some(kw => titleTag.includes(kw))) continue;

          if (href.startsWith('/')) href = `${platform.url}${href}`;
          else if (!href.startsWith('http')) href = `${platform.url}/${href}`;

          items.push({
            title: `[${platform.city}] ${titleTag}`,
            summary: `来源: ${platform.name}`,
            date: '',
            sourceUrl: href,
            sourceName: platform.name,
          });
        }
        if (items.length > 0) break;
      } catch { continue; }
    }
  } catch { /* skip */ }
  return items;
}

// ===== 数据源8: 中国政府采购网-国家级 (增强) =====

async function getCCGPLinks(): Promise<string[]> {
  const links = new Set<string>();
  try {
    const sections = [
      'http://www.ccgp.gov.cn/cggg/zygg/gkzb/',
      'http://www.ccgp.gov.cn/cggg/dfcg/cgxx/',
    ];
    for (const sectionUrl of sections) {
      try {
        const resp = await fetch(sectionUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        // 匹配链接
        const linkRegex = /href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let m: RegExpExecArray | null;
        while ((m = linkRegex.exec(html)) !== null) {
          const title = m[2].replace(/<[^>]+>/g, '').trim();
          if (title.length > 8 && ENERGY_KEYWORDS.some(kw => title.includes(kw))) {
            let href = m[1];
            if (href.startsWith('/')) href = `http://www.ccgp.gov.cn${href}`;
            else if (!href.startsWith('http') && href.startsWith('.')) href = `http://www.ccgp.gov.cn/cggg/zygg/gkzb/${href.replace(/^\.\//, '')}`;
            links.add(href);
          }
        }
      } catch { continue; }
      await sleep(200);
    }
    console.log(`  [CCGP] ${links.size} 条新能源相关`);
  } catch { console.log(`  [CCGP] Failed`); }
  return Array.from(links);
}

async function crawlCCGPTitle(url: string): Promise<{title: string; summary: string; date: string} | null> {
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)/) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : '';
    if (!title) return null;
    const dateM = html.match(/(\d{4}[年\-\/]\d{1,2}[月\-\/]\d{1,2})/);
    const date = dateM ? dateM[1].replace(/[年\/]/g, '-').replace('月', '-') : '';
    return { title, summary: '', date };
  } catch { return null; }
}

// ===== 数据源9: 全国公共资源交易平台 (新增) =====

async function crawlGGZY(): Promise<Array<{title: string; summary: string; date: string; sourceUrl: string; sourceName: string}>> {
  const items: Array<{title: string; summary: string; date: string; sourceUrl: string; sourceName: string}> = [];
  try {
    const resp = await fetch('https://www.ggzy.gov.cn/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15000),
    });
    if (resp.ok) {
      const html = await resp.text();
      const linkMatches = html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      for (const m of linkMatches) {
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (title.length > 10 && ENERGY_KEYWORDS.some(kw => title.includes(kw))) {
          items.push({
            title: `[全国] ${title}`,
            summary: '来源: 全国公共资源交易平台',
            date: '',
            sourceUrl: m[1].startsWith('http') ? m[1] : `https://www.ggzy.gov.cn${m[1]}`,
            sourceName: '全国公共资源交易平台',
          });
        }
      }
    }
    console.log(`  [GGZY] ${items.length} 条`);
  } catch { console.log(`  [GGZY] Failed`); }
  return items;
}

// ===== 主流程 =====

async function main() {
  console.log(`=== 光伏储能数据批量爬取 v6 (政府公共资源交易版) ===`);
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
  
  // ---------- 数据源6: 中国政府采购网 (国家级增强) ----------
  console.log('\n--- 数据源6: 中国政府采购网 (新能源关键词过滤) ---');
  const ccgpLinks = await getCCGPLinks();
  console.log(`  CCGP: ${ccgpLinks.length} 条新能源相关链接`);

  if (ccgpLinks.length > 0) {
    for (let i = 0; i < ccgpLinks.length; i += BATCH_SIZE) {
      const batch = ccgpLinks.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(url => crawlCCGPTitle(url)));
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r && r.title) {
          allItems.push({ title: r.title, summary: r.summary || '', date: r.date, sourceUrl: batch[j], sourceName: '中国政府采购网' });
        }
      }
      await sleep(50);
    }
  }

  // ---------- 数据源7: 全国公共资源交易平台 ----------
  console.log('\n--- 数据源7: 全国公共资源交易平台 ---');
  const ggzyItems = await crawlGGZY();
  allItems.push(...ggzyItems);

  // ---------- 数据源8: 省级公共资源交易平台 (31省市) ----------
  console.log('\n--- 数据源8: 省级公共资源交易平台 (${INCREMENTAL ? 'TOP10' : '全部31个'}) ---');
  const provinceTargets = INCREMENTAL ? PROVINCE_PLATFORMS.slice(0, 10) : PROVINCE_PLATFORMS;
  let provinceTotal = 0;

  for (const platform of provinceTargets) {
    try {
      const items = await crawlProvincePlatform(platform);
      if (items.length > 0) {
        allItems.push(...items);
        provinceTotal += items.length;
        console.log(`  [${platform.province}] ${platform.name}: ${items.length} 条`);
      }
    } catch { /* skip */ }
    await sleep(INCREMENTAL ? 50 : 150);
  }
  console.log(`  省级平台合计: ${provinceTotal} 条`);

  // ---------- 数据源9: 市级重点平台 ----------
  console.log('\n--- 数据源9: 市级重点平台 ---');
  let cityTotal = 0;
  for (const platform of CITY_PLATFORMS) {
    try {
      const items = await crawlCityPlatform(platform);
      if (items.length > 0) {
        allItems.push(...items);
        cityTotal += items.length;
        console.log(`  [${platform.city}] ${platform.name}: ${items.length} 条`);
      }
    } catch { /* skip */ }
    await sleep(100);
  }
  console.log(`  市级平台合计: ${cityTotal} 条`);

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
  
  console.log(`\n分类结果:`);
  console.log(`  项目: ${projects.length}`);
  console.log(`  招标: ${bidding.length}`);
  console.log(`  中标: ${awards.length}`);
  console.log(`  充电桩: ${chargers.length}`);
  
  // 保存
  fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify(projects, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'bidding.json'), JSON.stringify(bidding, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'awards.json'), JSON.stringify(awards, null, 2));
  fs.writeFileSync(path.join(DATA_DIR, 'chargers.json'), JSON.stringify(chargers, null, 2));
  
  // 保存爬取状态
  state.lastRun = new Date().toISOString();
  state.crawledUrls = [...crawledUrls, ...uniqueItems.map(i => i.sourceUrl)];
  state.stats = {
    projects: projects.length,
    bidding: bidding.length,
    awards: awards.length,
    chargers: chargers.length,
    total: uniqueItems.length,
  };
  saveState(state);
  
  console.log('\n数据已保存到 public/data/');
  
  const provSet = new Set(projects.map(p => p.province).filter(Boolean));
  console.log(`项目覆盖省份: ${provSet.size}`);
  console.log(`数据来源: ${[...new Set(uniqueItems.map(i => i.sourceName))].join(', ')}`);
}

main().catch(console.error);
