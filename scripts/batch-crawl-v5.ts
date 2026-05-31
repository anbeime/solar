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

import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const STATE_FILE = path.join(DATA_DIR, ".crawl-state.json");
const INCREMENTAL = process.argv.includes("--incremental");

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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
    .map((item) => ({
      ...item,
      _score: getRecencyScore(item.date),
      _date: item.date || "",
    }))
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return b._date.localeCompare(a._date);
    })
    .filter((item) => item._score > 0)
    .map(({ _score, _date, ...item }) => item as unknown as T);
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
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {
    /* ignore */
  }
  return { lastRun: "", crawledUrls: [], stats: {} };
}

function saveState(state: CrawlState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ===== 通用提取函数 =====

const PROVINCES = [
  "北京",
  "天津",
  "上海",
  "重庆",
  "河北",
  "山西",
  "辽宁",
  "吉林",
  "黑龙江",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "海南",
  "四川",
  "贵州",
  "云南",
  "陕西",
  "甘肃",
  "青海",
  "内蒙古",
  "广西",
  "西藏",
  "宁夏",
  "新疆",
];

function extractProvince(text: string): string {
  for (const p of PROVINCES) {
    if (text.includes(p)) return p;
  }
  return "";
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
  return "";
}

function extractAmount(text: string): string {
  const m = text.match(/([\d.]+)\s*(亿元|万元|万|元)/);
  if (!m) return "";
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
  return "";
}

function extractDate(text: string): string {
  const m = text.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  const m2 = text.match(/(\d{4})[年](\d{1,2})[月]/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, "0")}`;
  return "";
}

// ===== 自动分类 =====

// 负面过滤词 - 包含这些词的条目直接丢弃（非光伏储能相关）
const BLOCK_KW = [
  // 金融证券无关内容
  "股票", "基金", "期货", "美股", "港股", "外汇", "黄金", "债券",
  "行情中心", "主力净流入", "新股申购", "中签查询", "数据中心_",
  "沪深两市", "资金流向", "龙虎榜", "融资融券", "交易提示",
  "涨停板", "跌停板", "K线图", "技术分析", "均线系统",
  // 广告和无关页面
  "广告", "推广", "诚聘", "招聘", "加盟", "代理",
  "联系我们", "关于我们", "网站地图", "免责声明",
  // 其他无关
  "BAIDU_CLB", "百度统计", "Google Analytics", "window.",
];

/**
 * 检查是否应该过滤掉该条目
 * 返回 true 表示应该过滤掉
 */
function shouldBlock(title: string, summary: string): boolean {
  const text = `${title} ${summary}`;
  return BLOCK_KW.some((kw) => text.includes(kw));
}

const PROJECT_KW = [
  "光伏项目", "风电项目", "储能项目", "电站项目", "发电项目",
  "光伏电站", "风力发电站", "储能电站", "分布式光伏",
  "集中式光伏", "光伏基地", "风电基地", "新能源基地",
  "光伏并网", "风电并网", "并网发电", "并网运行",
  "光伏投产", "风电投产", "投产运营", "投产发电",
  "光伏开工", "风电开工", "开工建设", "正式启动",
  "光伏组件", "光伏逆变器", "风机叶片", "塔筒",
  "源网荷储", "虚拟电厂", "微电网", "综合能源站",
  "零碳园区", "零碳工厂", "绿色供电", "绿电交易",
  "光伏装机", "风电装机", "新增装机", "装机容量",
  "光储一体", "风光储", "风储", "光储充",
  "锂电池储能", "电化学储能", "抽水蓄能", "压缩空气储能",
  "制氢项目", "氢能产业", "加氢站",
  "充电桩建设", "充电站建设", "换电站建设",
  "碳中和项目", "碳达峰行动", "可再生能源",
];
const BIDDING_KW = [
  "招标",
  "投标",
  "采购",
  "竞价",
  "竞标",
  "询价",
  "比选",
  "资格预审",
  "标段",
  "报名",
  "截标",
  "开标",
  "选商",
  "招商",
];
const AWARD_KW = [
  "中标",
  "成交",
  "公示",
  "候选人",
  "预中标",
  "中标结果",
  "中标公告",
  "入围",
];
const CHARGER_KW = [
  "充电桩",
  "充电站",
  "充电设施",
  "换电站",
  "充电网",
  "充电基础设施",
  "充换电",
  "超充",
  "快充",
  "充电服务",
];

function classifyArticle(
  title: string,
  summary: string,
): "project" | "bidding" | "award" | "charger" | "blocked" {
  // 先检查负面过滤
  if (shouldBlock(title, summary)) return "blocked";

  const text = `${title} ${summary}`;
  if (CHARGER_KW.some((kw) => text.includes(kw))) return "charger";
  if (AWARD_KW.some((kw) => text.includes(kw))) return "award";
  if (BIDDING_KW.some((kw) => text.includes(kw))) return "bidding";
  if (PROJECT_KW.some((kw) => text.includes(kw))) return "project";
  // 默认不归类为 project，避免垃圾数据混入
  return "blocked";
}

function determineType(title: string, summary: string): string {
  const text = `${title} ${summary}`;
  if (/储能|电池|锂电池|蓄能|抽水蓄能|电化学/.test(text)) return "储能";
  if (/光伏|太阳能|分布式光伏|集中式光伏|组件|硅片/.test(text)) return "光伏";
  if (/风电|风力发电|风场|风机/.test(text)) return "风电";
  if (/充电|充电桩|充电站|换电/.test(text)) return "充电";
  if (/氢能|制氢|储氢|燃料电池/.test(text)) return "氢能";
  return "综合能源";
}

function determineStatus(
  title: string,
  summary: string,
  category: string,
): string {
  const text = `${title} ${summary}`;
  if (category === "bidding") {
    if (/已截止|已开标|已结束/.test(text)) return "已截止";
    return "报名中";
  }
  if (category === "award") return "已公示";
  return "";
}

// ===== 数据源1: 中国电力网 =====

const CHINAPOWER_SECTIONS: Array<{ path: string; name: string }> = [
  { path: "/chuneng/", name: "储能" },
  { path: "/tynfd/", name: "新能源发电" },
  { path: "/fd/", name: "风电" },
  { path: "/xw/", name: "电力新闻" },
  { path: "/dww/", name: "电网" },
  { path: "/flfd/", name: "分散式发电" },
  { path: "/qingneng/", name: "氢能" },
  { path: "/tanzhonghe/", name: "碳综合" },
  { path: "/guihuajianshe/", name: "规划建设" },
  { path: "/zjqy/", name: "智能电气" },
  { path: "/dlxxh/", name: "电力信息化" },
];

async function getChinaPowerLinks(
  section: string,
  maxPages: number,
  crawledUrls: Set<string>,
): Promise<string[]> {
  const allLinks = new Set<string>();
  const baseUrl = `http://www.chinapower.com.cn${section}`;

  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = page === 1 ? baseUrl : `${baseUrl}index_${page}.html`;
    try {
      const resp = await fetch(pageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
          Referer: baseUrl,
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

      console.log(
        `  [ChinaPower] ${section} page ${page}: ${found} new, total ${allLinks.size}`,
      );
      if (found === 0 && page > 2) break; // 没有新链接且已翻页，提前退出
    } catch {
      break;
    }
    await sleep(200);
  }

  return Array.from(allLinks);
}

async function crawlChinaPowerDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    const titleM = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    let title = titleM ? titleM[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!title) {
      const fallbackM = html.match(/<title>([^<]+)/);
      title = fallbackM ? fallbackM[1].replace(/_电力网$/, "").trim() : "";
    }

    const dateM =
      html.match(/发布时间[：:]\s*(\d{4}-\d{2}-\d{2})/) ||
      html.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateM ? dateM[1].trim() : "";

    let summary = "";
    const contentM = html.match(
      /class="content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/,
    );
    if (contentM) {
      summary = contentM[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&mdash;/g, "—")
        .replace(/&ldquo;|&rdquo;/g, '"')
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 500);
    }

    if (!summary || summary.length < 30) {
      const paragraphs = html.match(/<p[^>]*>([^<]{20,})<\/p>/g) || [];
      summary = paragraphs
        .map((p) => p.replace(/<[^>]+>/g, "").trim())
        .filter(
          (t) =>
            t.length > 20 &&
            !t.includes("版权") &&
            !t.includes("免责") &&
            !t.includes("声明"),
        )
        .join(" ")
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
  { path: "http://www.nea.gov.cn/xwzx/index.htm", name: "新闻中心" },
  { path: "http://www.nea.gov.cn/sjzz/index.htm", name: "数据中心" },
  { path: "http://www.nea.gov.cn/politics/index.htm", name: "政策法规" },
];

async function getNEALinks(sectionUrl: string): Promise<string[]> {
  const links = new Set<string>();
  try {
    const resp = await fetch(sectionUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const base = "http://www.nea.gov.cn/";

    const regexes = [
      /href="(\d{8}\/[a-f0-9]+\/c\.html)"/g,
      /href="(\/\d{4}-\d{2}\/\d{2}\/c_\d+\.htm)"/g,
      /href="\.\.\/(\d{8}\/[a-f0-9]+\/c\.html)"/g,
    ];

    for (const regex of regexes) {
      let m: RegExpExecArray | null;
      while ((m = regex.exec(html)) !== null) {
        const url = m[1].startsWith("/")
          ? `http://www.nea.gov.cn${m[1]}`
          : base + m[1];
        links.add(url);
      }
    }

    console.log(`  [NEA] ${sectionUrl}: ${links.size} links`);
  } catch {
    console.log(`  [NEA] Failed: ${sectionUrl}`);
  }
  return Array.from(links);
}

async function crawlNEADetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    const titleM = html.match(/name="ArticleTitle"\s+content="([^"]+)"/);
    const title = titleM ? titleM[1].trim() : "";
    const dateM = html.match(/name="PubDate"\s+content="([^"]+)"/);
    const date = dateM ? dateM[1].trim() : "";

    const paragraphs = html.match(/<p[^>]*>([^<]{20,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 20)
      .join(" ")
      .slice(0, 500);

    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源3: 中国新能源网 =====

const NEWENERGY_SECTIONS = [
  "http://www.newenergy.org.cn/xnyjz/yjdt/",
  "http://www.newenergy.org.cn/xnyjz/zcfg/",
  "http://www.newenergy.org.cn/hqsy/hqdt/",
  "http://www.newenergy.org.cn/tynfd/tuofeng/",
];

async function getNewEnergyLinks(sectionUrl: string): Promise<string[]> {
  const links = new Set<string>();
  try {
    const resp = await fetch(sectionUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
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

async function crawlNewEnergyDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    const titleM = html.match(/<title>([^<]+)<\/title>/);
    let title = titleM ? titleM[1].replace(/----.*$/, "").trim() : "";
    const dateM = html.match(/(\d{4})[年\-](\d{1,2})[月\-](\d{1,2})/);
    const date = dateM
      ? `${dateM[1]}-${dateM[2].padStart(2, "0")}-${dateM[3].padStart(2, "0")}`
      : "";

    const paragraphs = html.match(/<p[^>]*>([^<]{20,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 20)
      .join(" ")
      .slice(0, 500);

    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源5: 北极星光伏网 =====

async function getBJXLinks(
  sectionUrl: string,
  maxPages: number = 5,
): Promise<string[]> {
  const links = new Set<string>();
  try {
    for (let page = 1; page <= maxPages; page++) {
      const pageUrl =
        page === 1 ? sectionUrl : `${sectionUrl}index_${page}.html`;
      try {
        const resp = await fetch(pageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "text/html",
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!resp.ok) break;
        const html = await resp.text();

        // BJX article links
        const linkRegex =
          /href="(https?:\/\/guangfu\.bjx\.com\.cn\/[^"]*\/\d+\.html)"/g;
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

async function crawlBJXDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    const titleM =
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ||
      html.match(/<title>([^<]+)-北极星光伏/);
    let title = titleM ? titleM[1].replace(/<[^>]+>/g, "").trim() : "";

    const dateM = html.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/);
    const date = dateM ? dateM[1].replace(/\//g, "-") : "";

    const paragraphs = html.match(/<p[^>]*>([^<]{25,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, "").trim())
      .filter(
        (t) =>
          t.length > 25 &&
          !t.includes("北极星") &&
          !t.includes("版权") &&
          !t.includes("免责"),
      )
      .join(" ")
      .slice(0, 500);

    if (!title) return null;
    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源6: 省级公共资源交易平台 (新增) =====

const PROVINCE_PLATFORMS: Array<{
  name: string;
  url: string;
  province: string;
}> = [
  {
    name: "河南省公共资源交易中心",
    url: "http://hnsggzyjy.henan.gov.cn",
    province: "河南",
  },
  {
    name: "安徽省公共资源交易监管网",
    url: "https://www.ahggzyjy.cn",
    province: "安徽",
  },
  {
    name: "四川省公共资源交易信息网",
    url: "https://www.spprec.com",
    province: "四川",
  },
  {
    name: "浙江省公共资源交易服务平台",
    url: "https://zjpubservice.zjzwfw.gov.cn",
    province: "浙江",
  },
  {
    name: "江苏省公共资源交易平台",
    url: "https://jsggzy.jszwfw.gov.cn",
    province: "江苏",
  },
  {
    name: "河北省招标投标公共服务平台",
    url: "https://www.hebeieb.com",
    province: "河北",
  },
  {
    name: "江西省公共资源交易平台",
    url: "http://www.jxsggzy.cn",
    province: "江西",
  },
  {
    name: "云南省公共资源交易平台",
    url: "https://www.ynggzy.com",
    province: "云南",
  },
  {
    name: "天津市公共资源交易平台",
    url: "https://www.tjggzy.com",
    province: "天津",
  },
  {
    name: "山东省公共资源交易网",
    url: "https://www.sdggzyjy.gov.cn",
    province: "山东",
  },
  {
    name: "湖北省公共资源交易电子服务系统",
    url: "https://www.hbggzyfwpt.cn",
    province: "湖北",
  },
  {
    name: "湖南省公共资源交易服务平台",
    url: "https://www.hnsggzy.com",
    province: "湖南",
  },
  {
    name: "广东省公共资源交易平台",
    url: "http://bs.gdggzy.org.cn",
    province: "广东",
  },
  {
    name: "广西壮族自治区公共资源交易平台",
    url: "https://gxggzy.gxzf.gov.cn",
    province: "广西",
  },
  {
    name: "重庆市公共资源交易网",
    url: "https://www.cqggzy.com",
    province: "重庆",
  },
  {
    name: "贵州省公共资源交易公共服务平台",
    url: "http://ggzy.guizhou.gov.cn",
    province: "贵州",
  },
  {
    name: "陕西省公共资源交易中心",
    url: "http://www.sxggzyjy.cn",
    province: "陕西",
  },
  {
    name: "甘肃省公共资源交易网",
    url: "http://ggzyjy.gansu.gov.cn",
    province: "甘肃",
  },
  {
    name: "青海省公共资源交易网",
    url: "http://www.qhggzyjy.gov.cn",
    province: "青海",
  },
  {
    name: "宁夏回族自治区公共资源交易网",
    url: "https://www.nxggzyjy.org",
    province: "宁夏",
  },
  {
    name: "新疆维吾尔自治区公共资源交易网",
    url: "https://www.xjggzy.gov.cn",
    province: "新疆",
  },
  {
    name: "北京市公共资源交易服务平台",
    url: "https://ggzyfw.beijing.gov.cn",
    province: "北京",
  },
  {
    name: "山西省公共资源交易平台",
    url: "https://www.sxggzy.cn",
    province: "山西",
  },
  {
    name: "内蒙古自治区公共资源交易网",
    url: "http://ggzy.nmg.gov.cn",
    province: "内蒙古",
  },
  {
    name: "辽宁省公共资源交易网",
    url: "http://www.lnggzy.gov.cn",
    province: "辽宁",
  },
  {
    name: "吉林省公共资源交易公共服务平台",
    url: "http://www.jlsggzyjy.gov.cn",
    province: "吉林",
  },
  {
    name: "黑龙江省公共资源交易网",
    url: "http://www.hljgggy.gov.cn",
    province: "黑龙江",
  },
  {
    name: "上海市公共资源交易服务平台",
    url: "http://ggzy.sheic.org.cn",
    province: "上海",
  },
  {
    name: "福建省公共资源交易电子公共服务平台",
    url: "https://ggzyfw.fujian.gov.cn",
    province: "福建",
  },
  {
    name: "黑龙江省公共资源交易网",
    url: "http://www.hljggzy.gov.cn",
    province: "黑龙江",
  },
  {
    name: "安徽省公共资源交易监管网",
    url: "http://ggzy.ah.gov.cn",
    province: "安徽",
  },
  {
    name: "四川省公共资源交易信息网",
    url: "https://ggzyjy.sc.gov.cn",
    province: "四川",
  },
  {
    name: "云南省公共资源交易信息网",
    url: "https://ggzy.yn.gov.cn",
    province: "云南",
  },
  {
    name: "河北省公共资源交易平台",
    url: "https://www.hebggzy.cn",
    province: "河北",
  },
];

// 新能源关键词 - 用于过滤公共资源交易平台的公告
const ENERGY_KEYWORDS = [
  "光伏",
  "储能",
  "充电桩",
  "光储充",
  "源网荷储",
  "渔光互补",
  "分布式光伏",
  "风电",
  "新能源",
  "充电站",
  "换电",
  "虚拟电厂",
  "微电网",
  "综合能源",
  "智慧能源",
  "绿电",
  "氢能",
  "太阳能",
  "锂电池",
  "逆变器",
  "组件",
  "EPC",
];

async function crawlProvincePlatform(platform: {
  name: string;
  url: string;
  province: string;
}): Promise<
  Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }>
> {
  const items: Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }> = [];
  try {
    // 尝试多个常见路径
    const searchPaths = [
      "/jyxx/002001/002001001/",
      "/jyxx/002001/",
      "/info/index",
      "/search",
      "",
    ];

    for (const searchPath of searchPaths.slice(0, INCREMENTAL ? 1 : 2)) {
      const targetUrl = `${platform.url}${searchPath}`;
      try {
        const resp = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          },
          signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        // 提取所有链接并按新能源关键词过滤
        const linkMatches = html.matchAll(
          /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
        );
        for (const m of linkMatches) {
          let href = m[1];
          const titleTag = m[2].replace(/<[^>]+>/g, "").trim();
          if (!titleTag || titleTag.length < 8) continue;

          // 关键词过滤
          const hasEnergyKw = ENERGY_KEYWORDS.some((kw) =>
            titleTag.includes(kw),
          );
          if (!hasEnergyKw) continue;

          // 补全URL
          if (href.startsWith("/")) href = `${platform.url}${href}`;
          else if (!href.startsWith("http")) href = `${platform.url}/${href}`;

          items.push({
            title: `[${platform.province}] ${titleTag}`,
            summary: `来源: ${platform.name}`,
            date: "",
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

const CITY_PLATFORMS: Array<{ name: string; url: string; city: string }> = [
  {
    name: "枣庄市公共资源交易网",
    url: "http://ggzy.zaozhuang.gov.cn",
    city: "枣庄",
  },
  {
    name: "驻马店市公共资源电子交易系统",
    url: "http://ggzy.zhumadian.gov.cn",
    city: "驻马店",
  },
  {
    name: "洛阳市公共资源交易中心",
    url: "https://www.lyggzy.com",
    city: "洛阳",
  },
  {
    name: "咸宁市公共资源交易信息网",
    url: "https://ggzy.xianning.gov.cn",
    city: "咸宁",
  },
];

// ===== 省级政府采购平台 =====

const PROVINCE_GOV_PROCUREMENT: Array<{
  name: string;
  url: string;
  province: string;
}> = [
  {
    name: "北京市政府采购网",
    url: "http://www.ccgp-beijing.gov.cn",
    province: "北京",
  },
  {
    name: "上海政府采购",
    url: "http://www.ccgp-shanghai.gov.cn",
    province: "上海",
  },
  {
    name: "天津市政府采购网",
    url: "https://www.ccgp-tianjin.gov.cn",
    province: "天津",
  },
  {
    name: "重庆市政府采购网",
    url: "https://www.ccgp-chongqing.gov.cn",
    province: "重庆",
  },
  {
    name: "河北省政府采购网",
    url: "http://www.ccgp-hebei.gov.cn",
    province: "河北",
  },
  {
    name: "山西省政府采购网",
    url: "http://www.ccgp-shanxi.gov.cn",
    province: "山西",
  },
  {
    name: "内蒙古自治区政府采购网",
    url: "http://www.ccgp-neimenggu.gov.cn",
    province: "内蒙古",
  },
  {
    name: "辽宁省政府采购网",
    url: "http://www.ccgp-liaoning.gov.cn",
    province: "辽宁",
  },
  {
    name: "吉林省政府采购网",
    url: "http://www.ccgp-jilin.gov.cn",
    province: "吉林",
  },
  {
    name: "黑龙江省政府采购网",
    url: "http://www.ccgp-heilongjiang.gov.cn",
    province: "黑龙江",
  },
  {
    name: "江苏政府采购",
    url: "http://www.ccgp-jiangsu.gov.cn",
    province: "江苏",
  },
  {
    name: "浙江政府采购网",
    url: "http://www.ccgp-zhejiang.gov.cn",
    province: "浙江",
  },
  {
    name: "安徽省政府采购网",
    url: "http://www.ccgp-anhui.gov.cn",
    province: "安徽",
  },
  {
    name: "福建省政府采购网",
    url: "http://www.ccgp-fujian.gov.cn",
    province: "福建",
  },
  {
    name: "江西省政府采购网",
    url: "http://www.ccgp-jiangxi.gov.cn",
    province: "江西",
  },
  {
    name: "山东省政府采购网",
    url: "http://www.ccgp-shandong.gov.cn",
    province: "山东",
  },
  {
    name: "河南省政府采购网",
    url: "http://www.ccgp-henan.gov.cn",
    province: "河南",
  },
  {
    name: "湖北政府购买服务信息平台",
    url: "http://www.ccgp-hubei.gov.cn",
    province: "湖北",
  },
  {
    name: "中国湖南政府采购网",
    url: "http://www.ccgp-hunan.gov.cn",
    province: "湖南",
  },
  {
    name: "广东省政府采购网",
    url: "http://www.ccgp-guangdong.gov.cn",
    province: "广东",
  },
  {
    name: "广西壮族自治区政府采购网",
    url: "http://www.ccgp-guangxi.gov.cn",
    province: "广西",
  },
  {
    name: "海南省政府采购网",
    url: "https://www.ccgp-hainan.gov.cn",
    province: "海南",
  },
  {
    name: "四川省政府采购网",
    url: "http://www.ccgp-sichuan.gov.cn",
    province: "四川",
  },
  { name: "贵州省政府采购网", url: "https://gzgp.zbytb.com", province: "贵州" },
  {
    name: "云南省政府采购网",
    url: "http://www.ccgp-yunnan.gov.cn",
    province: "云南",
  },
  {
    name: "西藏自治区政府采购网",
    url: "http://www.ccgp-xizang.gov.cn",
    province: "西藏",
  },
  {
    name: "陕西省政府采购网",
    url: "http://www.ccgp-shaanxi.gov.cn",
    province: "陕西",
  },
  {
    name: "甘肃政府采购网",
    url: "http://www.ccgp-gansu.gov.cn",
    province: "甘肃",
  },
  {
    name: "青海省政府采购网",
    url: "http://www.ccgp-qinghai.gov.cn",
    province: "青海",
  },
  {
    name: "宁夏回族自治区政府采购网",
    url: "http://www.ccgp-ningxia.gov.cn",
    province: "宁夏",
  },
  {
    name: "新疆维吾尔自治区政府采购网",
    url: "http://www.ccgp-xinjiang.gov.cn",
    province: "新疆",
  },
];

async function crawlCityPlatform(platform: {
  name: string;
  url: string;
  city: string;
}): Promise<
  Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }>
> {
  const items: Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }> = [];
  try {
    const paths = ["/jyxx/", "/info/", "/search", ""];
    for (const p of paths.slice(0, 1)) {
      try {
        const resp = await fetch(`${platform.url}${p}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        const linkMatches = html.matchAll(
          /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
        );
        for (const m of linkMatches) {
          let href = m[1];
          const titleTag = m[2].replace(/<[^>]+>/g, "").trim();
          if (!titleTag || titleTag.length < 8) continue;
          if (!ENERGY_KEYWORDS.some((kw) => titleTag.includes(kw))) continue;

          if (href.startsWith("/")) href = `${platform.url}${href}`;
          else if (!href.startsWith("http")) href = `${platform.url}/${href}`;

          items.push({
            title: `[${platform.city}] ${titleTag}`,
            summary: `来源: ${platform.name}`,
            date: "",
            sourceUrl: href,
            sourceName: platform.name,
          });
        }
        if (items.length > 0) break;
      } catch {
        continue;
      }
    }
  } catch {
    /* skip */
  }
  return items;
}

// ===== 省级政府采购平台爬虫 =====

async function crawlGovProcurementPlatform(platform: {
  name: string;
  url: string;
  province: string;
}): Promise<
  Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }>
> {
  const items: Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }> = [];
  try {
    const paths = ["/", "/jyxx/", "/zbxx/", "/cgxx/"];
    for (const p of paths.slice(0, 1)) {
      try {
        const resp = await fetch(`${platform.url}${p}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: AbortSignal.timeout(10000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        const linkMatches = html.matchAll(
          /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
        );
        for (const m of linkMatches) {
          let href = m[1];
          const titleTag = m[2].replace(/<[^>]+>/g, "").trim();
          if (!titleTag || titleTag.length < 8) continue;
          if (!ENERGY_KEYWORDS.some((kw) => titleTag.includes(kw))) continue;

          if (href.startsWith("/")) href = `${platform.url}${href}`;
          else if (!href.startsWith("http")) href = `${platform.url}/${href}`;

          items.push({
            title: `[${platform.province}] ${titleTag}`,
            summary: `来源: ${platform.name}`,
            date: "",
            sourceUrl: href,
            sourceName: platform.name,
          });
        }
        if (items.length > 0) break;
      } catch {
        continue;
      }
    }
  } catch {
    /* skip */
  }
  return items;
}

// ===== 数据源10: 储能与电力市场 =====

async function getESCNLinks(): Promise<string[]> {
  const links = new Set<string>();
  const ENERGY_KW = [
    "光伏",
    "储能",
    "风电",
    "新能源",
    "充电",
    "氢能",
    "电池",
    "电池储能",
    "光储",
  ];
  try {
    const resp = await fetch("https://www.escn.com.cn/news/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) return [];
    const html = await resp.text();
    const linkRegex = /href="(\/[^"]*\/[^"]*\.html)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const match = m;
      const fullUrl = `https://www.escn.com.cn${match[1]}`;
      if (ENERGY_KW.some((kw) => match[0].includes(kw))) {
        links.add(fullUrl);
      }
    }
  } catch (e) {
    console.log(
      `  [ESCN] Error: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  return Array.from(links);
}

async function crawlESCNDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    const title = titleM
      ? titleM[1].replace(/ - 储能与电力市场$/, "").trim()
      : "";
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 300);
    return { title, summary, date: dateM ? dateM[1] : "" };
  } catch {
    return null;
  }
}

// ===== 数据源11: 中国能源网 =====

async function getChina5ELinks(): Promise<string[]> {
  const links = new Set<string>();
  try {
    const resp = await fetch("https://www.china5e.com/news/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!resp.ok) {
      console.log(`  [China5E] HTTP ${resp.status}`);
      return [];
    }
    const html = await resp.text();
    const linkRegex = /href="(\/news\/[^"]+\.html)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      links.add(`https://www.china5e.com${m[1]}`);
    }
    console.log(`  [China5E] Found ${links.size} links`);
  } catch (e) {
    console.log(
      `  [China5E] Error: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
  return Array.from(links);
}

async function crawlChina5EDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    const title = titleM ? titleM[1].replace(/_中国能源网$/, "").trim() : "";
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 300);
    return { title, summary, date: dateM ? dateM[1] : "" };
  } catch {
    return null;
  }
}

// ===== 数据源12: 新浪财经能源 =====

async function getSinaFinanceLinks(): Promise<string[]> {
  const links = new Set<string>();
  const ENERGY_KW = ["光伏", "储能", "风电", "新能源"];
  try {
    const resp = await fetch("https://finance.sina.com.cn/energy/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const linkRegex = /href="(https?:\/\/finance\.sina\.com\.cn\/[^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const match = m;
      if (ENERGY_KW.some((kw) => match[1].includes(kw))) {
        links.add(match[1]);
      }
    }
  } catch {
    /* skip */
  }
  return Array.from(links);
}

async function crawlSinaDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    const title = titleM ? titleM[1].replace(/_新浪财经$/, "").trim() : "";
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 300);
    return { title, summary, date: dateM ? dateM[1] : "" };
  } catch {
    return null;
  }
}

// ===== 数据源13: 东方财富网 =====

async function getEastMoneyLinks(): Promise<string[]> {
  const links = new Set<string>();
  const ENERGY_KW = ["光伏", "储能", "风电", "新能源"];
  try {
    const resp = await fetch(
      "https://search.eastmoney.com/search/s?keyword=%E5%85%89%E4%BC%8F%E5%82%A8%E8%83%BD",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000),
      },
    );
    const html = await resp.text();
    const linkRegex = /href="(https?:\/\/([^\/]+)\.eastmoney\.com\/[^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      if (m[1].length > 50) links.add(m[1]);
    }
  } catch {
    /* skip */
  }
  return Array.from(links).slice(0, 50);
}

async function crawlEastMoneyDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    const title = titleM ? titleM[1].replace(/东方财富网$/, "").trim() : "";
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 300);
    return { title, summary, date: dateM ? dateM[1] : "" };
  } catch {
    return null;
  }
}

// ===== 数据源14: 国家发改委 =====

async function getNDRCLinks(): Promise<string[]> {
  const links = new Set<string>();
  const ENERGY_KW = ["光伏", "储能", "新能源", "项目"];
  try {
    const resp = await fetch("https://www.ndrc.gov.cn/xwzx/tzgg/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const linkRegex = /href="(https?:\/\/www\.ndrc\.gov\.cn\/[^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const match = m;
      if (ENERGY_KW.some((kw) => match[1].includes(kw))) {
        links.add(match[1]);
      }
    }
  } catch {
    /* skip */
  }
  return Array.from(links);
}

async function crawlNDRCDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    const title = titleM
      ? titleM[1].replace(/国家发展和改革委员会$/, "").trim()
      : "";
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 300);
    return { title, summary, date: dateM ? dateM[1] : "" };
  } catch {
    return null;
  }
}

// ===== 数据源15: 中国招投标公共服务平台 =====

async function getTenderInfoLinks(): Promise<string[]> {
  const links = new Set<string>();
  const ENERGY_KW = ["光伏", "储能", "新能源", "招标"];
  try {
    const resp = await fetch("https://www.cebpubservice.com/cggg/zygg/gkzb/", {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const linkRegex = /href="(https?:\/\/www\.cebpubservice\.com\/[^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const match = m;
      if (ENERGY_KW.some((kw) => match[1].includes(kw))) {
        links.add(match[1]);
      }
    }
  } catch {
    /* skip */
  }
  return Array.from(links);
}

async function crawlTenderDetail(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const titleM = html.match(/<title>([^<]+)<\/title>/);
    const title = titleM
      ? titleM[1].replace(/ - 中国招投标公共服务平台$/, "").trim()
      : "";
    const dateM = html.match(/(\d{4}-\d{2}-\d{2})/);
    const paragraphs = html.match(/<p[^>]*>([^<]{30,})<\/p>/g) || [];
    const summary = paragraphs
      .map((p) => p.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 300);
    return { title, summary, date: dateM ? dateM[1] : "" };
  } catch {
    return null;
  }
}

// ===== 数据源6: 中国政府采购网-国家级 (搜索API版) =====
// 使用 search.ccgp.gov.cn/bxsearch 搜索接口，支持关键词检索

const CCGP_SEARCH_URL = "http://search.ccgp.gov.cn/bxsearch";
const CCGP_KEYWORDS = ["光伏", "储能", "新能源", "风电", "太阳能", "充电桩", "光储"];

async function getCCGPLinks(): Promise<string[]> {
  const links = new Set<string>();
  try {
    // 对每个关键词搜索，获取最近7天的数据
    const now = new Date();
    const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startStr = `${startTime.getFullYear()}-${String(startTime.getMonth() + 1).padStart(2, "0")}-${String(startTime.getDate()).padStart(2, "0")}`;

    for (const kw of CCGP_KEYWORDS) {
      try {
        const searchUrl = `${CCGP_SEARCH_URL}?searchtype=1&page_index=1&start_time=${startStr}&end_time=&timeType=6&kw=${encodeURIComponent(kw)}`;
        const resp = await fetch(searchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          },
          signal: AbortSignal.timeout(15000),
        });
        if (!resp.ok) continue;
        const html = await resp.text();

        // 搜索结果页中的链接格式
        const linkPatterns = [
          /href="(https?:\/\/[^"]*ccgp\.gov\.cn[^"]*)"/gi,
          /data-url="(https?:\/\/[^"]*)"/gi,
        ];

        for (const pattern of linkPatterns) {
          const linkRegex = RegExp(pattern.source, pattern.flags);
          let m: RegExpExecArray | null;
          while ((m = linkRegex.exec(html)) !== null) {
            let href = m[1];
            if (!href || href.startsWith("javascript") || href.startsWith("#")) continue;
            if (href.startsWith("/")) href = `http://www.ccgp.gov.cn${href}`;
            links.add(href);
          }
        }

        // 备用：匹配搜索结果列表下的所有链接
        const ulRegex = /<a[^>]+href="([^"]+)"[^>]*>/gi;
        let um: RegExpExecArray | null;
        while ((um = ulRegex.exec(html)) !== null) {
          const href = um[1];
          if (href.startsWith("/") && !links.has(href)) {
            links.add(`http://www.ccgp.gov.cn${href}`);
          } else if (href.startsWith("http") && !links.has(href)) {
            links.add(href);
          }
        }
      } catch {
        continue;
      }
      await sleep(300); // 避免请求过快
    }

    // 去重并过滤非 ccgp 域名的链接
    const filtered = Array.from(links).filter(
      (l) => l.includes("ccgp.gov.cn") || l.includes("search.ccgp.gov.cn"),
    );
    console.log(`  [CCGP] ${filtered.length} 条新能源相关（搜索API）`);
    return filtered;
  } catch (e) {
    console.log(`  [CCGP] Error: ${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
}

async function crawlCCGPTitle(
  url: string,
): Promise<{ title: string; summary: string; date: string } | null> {
  try {
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    // 标题匹配：优先 h1/title
    const titleM =
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ||
      html.match(/<title>([^<]+)/);
    const title = titleM ? titleM[1].replace(/<[^>]+>/g, "").trim() : "";
    if (!title) return null;

    // 日期匹配：多种格式
    const datePatterns = [
      /(\d{4}年\d{1,2}月\d{1,2}日)/,
      /(\d{4}-\d{2}-\d{2})/,
      /发布时间[：:]\s*(\d{4}[^\s]*)/,
      /(\d{4}\/\d{1,2}\/\d{1,2})/,
    ];
    let date = "";
    for (const p of datePatterns) {
      const dm = html.match(p);
      if (dm) {
        date = dm[1].replace(/[年\/]/g, "-").replace("月", "-").replace("日", "");
        break;
      }
    }

    // 简要内容摘要
    const contentMatch = html.match(/<div[^>]*class="[^"]*vT-sdetail-content[^"]*"[^>]*>([\s\S]{50,500})<\/div>/i)
      || html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]{50,500})/i);
    const summary = contentMatch
      ? contentMatch[1].replace(/<[^>]+>/g, "").trim().slice(0, 300)
      : "";

    return { title, summary, date };
  } catch {
    return null;
  }
}

// ===== 数据源9: 全国公共资源交易平台 (新增) =====

async function crawlGGZY(): Promise<
  Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }>
> {
  const items: Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }> = [];
  try {
    const resp = await fetch("https://www.ggzy.gov.cn/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (resp.ok) {
      const html = await resp.text();
      const linkMatches = html.matchAll(
        /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
      );
      for (const m of linkMatches) {
        const title = m[2].replace(/<[^>]+>/g, "").trim();
        if (
          title.length > 10 &&
          ENERGY_KEYWORDS.some((kw) => title.includes(kw))
        ) {
          items.push({
            title: `[全国] ${title}`,
            summary: "来源: 全国公共资源交易平台",
            date: "",
            sourceUrl: m[1].startsWith("http")
              ? m[1]
              : `https://www.ggzy.gov.cn${m[1]}`,
            sourceName: "全国公共资源交易平台",
          });
        }
      }
    }
    console.log(`  [GGZY] ${items.length} 条`);
  } catch {
    console.log(`  [GGZY] Failed`);
  }
  return items;
}

// ===== 主流程 =====

async function main() {
  console.log(`=== 光伏储能数据批量爬取 v6 (政府公共资源交易版) ===`);
  console.log(`模式: ${INCREMENTAL ? "增量更新" : "全量爬取"}\n`);

  const state = loadState();
  const crawledUrls = new Set(state.crawledUrls);

  if (INCREMENTAL) {
    console.log(`上次运行: ${state.lastRun || "无"}`);
    console.log(`已爬取URL数: ${crawledUrls.size}`);
  }

  const allItems: Array<{
    title: string;
    summary: string;
    date: string;
    sourceUrl: string;
    sourceName: string;
  }> = [];

  const BATCH_SIZE = 20;

  // ---------- 数据源1: 中国电力网 ----------
  console.log("\n--- 数据源1: 中国电力网 ---");
  let cpTotalLinks = 0;
  const cpLinks: string[] = [];

  for (const section of CHINAPOWER_SECTIONS) {
    console.log(`  栏目: ${section.name}`);
    const links = await getChinaPowerLinks(
      section.path,
      INCREMENTAL ? 3 : 15,
      crawledUrls,
    );
    cpTotalLinks += links.length;
    cpLinks.push(...links);
  }

  const cpUniqueLinks = [...new Set(cpLinks)];
  console.log(
    `  中国电力网: ${cpTotalLinks} -> 去重后 ${cpUniqueLinks.length}`,
  );

  for (let i = 0; i < cpUniqueLinks.length; i += BATCH_SIZE) {
    const batch = cpUniqueLinks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((url) => crawlChinaPowerDetail(url)),
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r && r.title) {
        allItems.push({
          title: r.title,
          summary: r.summary || "",
          date: r.date,
          sourceUrl: batch[j],
          sourceName: "中国电力网",
        });
      }
    }
    if (i % 200 === 0)
      console.log(
        `    进度: ${Math.min(i + BATCH_SIZE, cpUniqueLinks.length)}/${cpUniqueLinks.length}`,
      );
    await sleep(50);
  }

  // ---------- 数据源2: 国家能源局 ----------
  console.log("\n--- 数据源2: 国家能源局 ---");
  const neaLinks: string[] = [];
  for (const section of NEA_SECTIONS) {
    const links = await getNEALinks(section.path);
    neaLinks.push(...links);
  }
  const neaUniqueLinks = [...new Set(neaLinks)];
  console.log(`  国家能源局: 去重后 ${neaUniqueLinks.length}`);

  for (let i = 0; i < neaUniqueLinks.length; i += BATCH_SIZE) {
    const batch = neaUniqueLinks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((url) => crawlNEADetail(url)));
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r && r.title) {
        allItems.push({
          title: r.title,
          summary: r.summary || "",
          date: r.date,
          sourceUrl: batch[j],
          sourceName: "国家能源局",
        });
      }
    }
    await sleep(50);
  }

  // ---------- 数据源3: 中国新能源网 ----------
  console.log("\n--- 数据源3: 中国新能源网 ---");
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
      const results = await Promise.all(
        batch.map((url) => crawlNewEnergyDetail(url)),
      );
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r && r.title) {
          allItems.push({
            title: r.title,
            summary: r.summary || "",
            date: r.date,
            sourceUrl: batch[j],
            sourceName: "中国新能源网",
          });
        }
      }
      await sleep(50);
    }
  }

  // ---------- 数据源4: 北极星光伏网 ----------
  console.log("\n--- 数据源4: 北极星光伏网 ---");
  const bjxSections = [
    "https://guangfu.bjx.com.cn/news/",
    "https://guangfu.bjx.com.cn/project/",
    "https://guangfu.bjx.com.cn/bidding/",
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
      const results = await Promise.all(
        batch.map((url) => crawlBJXDetail(url)),
      );
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r && r.title) {
          allItems.push({
            title: r.title,
            summary: r.summary || "",
            date: r.date,
            sourceUrl: batch[j],
            sourceName: "北极星光伏网",
          });
        }
      }
      await sleep(50);
    }
  }

  // ---------- 数据源6: 中国政府采购网 (国家级增强) ----------
  console.log("\n--- 数据源6: 中国政府采购网 (新能源关键词过滤) ---");
  const ccgpLinks = await getCCGPLinks();
  console.log(`  CCGP: ${ccgpLinks.length} 条新能源相关链接`);

  if (ccgpLinks.length > 0) {
    for (let i = 0; i < ccgpLinks.length; i += BATCH_SIZE) {
      const batch = ccgpLinks.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((url) => crawlCCGPTitle(url)),
      );
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r && r.title) {
          allItems.push({
            title: r.title,
            summary: r.summary || "",
            date: r.date,
            sourceUrl: batch[j],
            sourceName: "中国政府采购网",
          });
        }
      }
      await sleep(50);
    }
  }

  // ---------- 数据源7: 全国公共资源交易平台 ----------
  console.log("\n--- 数据源7: 全国公共资源交易平台 ---");
  const ggzyItems = await crawlGGZY();
  allItems.push(...ggzyItems);

  // ---------- 数据源8: 省级公共资源交易平台 (31省市) ----------
  console.log(
    `\n--- 数据源8: 省级公共资源交易平台 (${INCREMENTAL ? "TOP10" : "全部31个"}) ---`,
  );
  const provinceTargets = INCREMENTAL
    ? PROVINCE_PLATFORMS.slice(0, 10)
    : PROVINCE_PLATFORMS;
  let provinceTotal = 0;

  for (const platform of provinceTargets) {
    try {
      const items = await crawlProvincePlatform(platform);
      if (items.length > 0) {
        allItems.push(...items);
        provinceTotal += items.length;
        console.log(
          `  [${platform.province}] ${platform.name}: ${items.length} 条`,
        );
      }
    } catch {
      /* skip */
    }
    await sleep(INCREMENTAL ? 50 : 150);
  }
  console.log(`  省级平台合计: ${provinceTotal} 条`);

  // ---------- 数据源9: 市级重点平台 ----------
  console.log("\n--- 数据源9: 市级重点平台 ---");
  let cityTotal = 0;
  for (const platform of CITY_PLATFORMS) {
    try {
      const items = await crawlCityPlatform(platform);
      if (items.length > 0) {
        allItems.push(...items);
        cityTotal += items.length;
        console.log(
          `  [${platform.city}] ${platform.name}: ${items.length} 条`,
        );
      }
    } catch {
      /* skip */
    }
    await sleep(100);
  }
  console.log(`  市级平台合计: ${cityTotal} 条`);

  // ---------- 数据源10: 省级政府采购平台 ----------
  console.log(
    `\n--- 数据源10: 省级政府采购平台 (${INCREMENTAL ? "TOP10" : "全部31个"}) ---`,
  );
  const govProcurementTargets = INCREMENTAL
    ? PROVINCE_GOV_PROCUREMENT.slice(0, 10)
    : PROVINCE_GOV_PROCUREMENT;
  let govProcurementTotal = 0;

  for (const platform of govProcurementTargets) {
    try {
      const items = await crawlGovProcurementPlatform(platform);
      if (items.length > 0) {
        allItems.push(...items);
        govProcurementTotal += items.length;
        console.log(
          `  [${platform.province}] ${platform.name}: ${items.length} 条`,
        );
      }
    } catch {
      /* skip */
    }
    await sleep(INCREMENTAL ? 50 : 100);
  }
  console.log(`  省级政府采购合计: ${govProcurementTotal} 条`);

  // ---------- 数据源11: 储能与电力市场 ----------
  console.log("\n--- 数据源10: 储能与电力市场 ---");
  try {
    const escnLinks = await getESCNLinks();
    console.log(`  储能与电力市场: ${escnLinks.length} 条`);
    for (const link of escnLinks) {
      const detail = await crawlESCNDetail(link);
      if (detail?.title) {
        allItems.push({
          ...detail,
          sourceUrl: link,
          sourceName: "储能与电力市场",
        });
        await sleep(50);
      }
    }
  } catch {
    /* skip */
  }

  // ---------- 数据源11: 中国能源网 ----------
  console.log("\n--- 数据源11: 中国能源网 ---");
  try {
    const china5eLinks = await getChina5ELinks();
    console.log(`  中国能源网: ${china5eLinks.length} 条`);
    for (const link of china5eLinks) {
      const detail = await crawlChina5EDetail(link);
      if (detail?.title) {
        allItems.push({ ...detail, sourceUrl: link, sourceName: "中国能源网" });
        await sleep(50);
      }
    }
  } catch {
    /* skip */
  }

  // ---------- 数据源12: 新浪财经能源 ----------
  console.log("\n--- 数据源12: 新浪财经能源 ---");
  try {
    const sinaLinks = await getSinaFinanceLinks();
    console.log(`  新浪财经: ${sinaLinks.length} 条`);
    for (const link of sinaLinks) {
      const detail = await crawlSinaDetail(link);
      if (detail?.title) {
        allItems.push({ ...detail, sourceUrl: link, sourceName: "新浪财经" });
        await sleep(50);
      }
    }
  } catch {
    /* skip */
  }

  // ---------- 数据源13: 东方财富网 ----------
  console.log("\n--- 数据源13: 东方财富网 ---");
  try {
    const eastmoneyLinks = await getEastMoneyLinks();
    console.log(`  东方财富网: ${eastmoneyLinks.length} 条`);
    for (const link of eastmoneyLinks) {
      const detail = await crawlEastMoneyDetail(link);
      if (detail?.title) {
        allItems.push({ ...detail, sourceUrl: link, sourceName: "东方财富网" });
        await sleep(50);
      }
    }
  } catch {
    /* skip */
  }

  // ---------- 数据源14: 国家发改委 ----------
  console.log("\n--- 数据源14: 国家发改委 ---");
  try {
    const ndrcLinks = await getNDRCLinks();
    console.log(`  国家发改委: ${ndrcLinks.length} 条`);
    for (const link of ndrcLinks) {
      const detail = await crawlNDRCDetail(link);
      if (detail?.title) {
        allItems.push({ ...detail, sourceUrl: link, sourceName: "国家发改委" });
        await sleep(50);
      }
    }
  } catch {
    /* skip */
  }

  // ---------- 数据源15: 中国招投标公共服务平台 ----------
  console.log("\n--- 数据源15: 中国招投标公共服务平台 ---");
  try {
    const tenderLinks = await getTenderInfoLinks();
    console.log(`  中国招投标公共服务平台: ${tenderLinks.length} 条`);
    for (const link of tenderLinks) {
      const detail = await crawlTenderDetail(link);
      if (detail?.title) {
        allItems.push({
          ...detail,
          sourceUrl: link,
          sourceName: "中国招投标公共服务平台",
        });
        await sleep(50);
      }
    }
  } catch {
    /* skip */
  }

  // ---------- 分类和保存 ----------
  console.log(`\n=== 数据处理 ===`);
  console.log(`总计爬取: ${allItems.length} 条`);

  // 去重
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((item) => {
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
  let blockedCount = 0;

  let idCounter = 1;
  for (const item of uniqueItems) {
    const category = classifyArticle(item.title, item.summary || "");

    // 过滤掉无关内容
    if (category === "blocked") {
      blockedCount++;
      continue;
    }

    const text = `${item.title} ${item.summary || ""}`;
    const province = extractProvince(text);
    const capacity = extractCapacity(text);
    const amount = extractAmount(text);
    const company = extractCompany(text);
    const date = item.date || extractDate(text);

    const record = {
      id: String(idCounter++),
      title: item.title,
      province,
      summary: (item.summary || "").slice(0, 500),
      capacity,
      amount,
      company,
      date,
      sourceUrl: item.sourceUrl,
      sourceName: item.sourceName,
    };

    switch (category) {
      case "project":
        projects.push({
          ...record,
          type: determineType(item.title, item.summary || ""),
          name: item.title,
        });
        break;
      case "bidding":
        bidding.push({
          ...record,
          category: determineType(item.title, item.summary || ""),
          status: determineStatus(item.title, item.summary || "", "bidding"),
        });
        break;
      case "award":
        awards.push({
          ...record,
          category: determineType(item.title, item.summary || ""),
          status: determineStatus(item.title, item.summary || "", "award"),
        });
        break;
      case "charger":
        chargers.push(record);
        break;
    }
  }

  console.log(`\n分类结果 (过滤前):`);
  console.log(`  项目: ${projects.length}`);
  console.log(`  招标: ${bidding.length}`);
  console.log(`  中标: ${awards.length}`);
  console.log(`  充电桩: ${chargers.length}`);
  console.log(`  已过滤无关内容: ${blockedCount} 条`);

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
  fs.writeFileSync(
    path.join(DATA_DIR, "projects.json"),
    JSON.stringify(filteredProjects, null, 2),
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "bidding.json"),
    JSON.stringify(filteredBidding, null, 2),
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "awards.json"),
    JSON.stringify(filteredAwards, null, 2),
  );
  fs.writeFileSync(
    path.join(DATA_DIR, "chargers.json"),
    JSON.stringify(filteredChargers, null, 2),
  );

  // ===== 生成问答式知识库 =====
  generateQAKnowledgeBase(filteredProjects, filteredBidding, filteredAwards, filteredChargers);

  // 保存爬取状态
  state.lastRun = new Date().toISOString();
  state.crawledUrls = [...crawledUrls, ...uniqueItems.map((i) => i.sourceUrl)];
  state.stats = {
    projects: filteredProjects.length,
    bidding: filteredBidding.length,
    awards: filteredAwards.length,
    chargers: filteredChargers.length,
    total: uniqueItems.length,
  };
  saveState(state);

  console.log("\n数据已保存到 public/data/");

  const provSet = new Set(projects.map((p) => p.province).filter(Boolean));
  console.log(`项目覆盖省份: ${provSet.size}`);
  console.log(
    `数据来源: ${[...new Set(uniqueItems.map((i) => i.sourceName))].join(", ")}`,
  );
}

// ===== 问答式知识库生成 =====

interface QAEntry {
  question: string;
  answer: string;
  category: "project" | "bidding" | "award" | "charger" | "industry";
  tags: string[];
  source: string;
  date: string;
}

/**
 * 从结构化数据生成问答式知识库
 * AI 助手可以直接搜索和引用这些 Q&A 对
 */
function generateQAKnowledgeBase(
  projects: any[],
  bidding: any[],
  awards: any[],
  chargers: any[]
): void {
  const qaList: QAEntry[] = [];

  // --- 项目类问答 ---
  for (const p of projects.slice(0, 100)) {
    const type = p.type || "综合能源";
    const prov = p.province ? `（${p.province}）` : "";
    const cap = p.capacity ? `，规模：${p.capacity}` : "";
    const comp = p.company ? `，投资/建设单位：${p.company}` : "";
    const date = p.date ? `（${p.date}）` : "";

    qaList.push({
      question: `${type}${prov}有哪些最新项目？`,
      answer: `【${p.title}】${date}${cap}${comp}。${p.summary || ""}`,
      category: "project",
      tags: [type, p.province].filter(Boolean),
      source: p.sourceName || "",
      date: p.date || "",
    });
  }

  // --- 招标类问答 ---
  for (const b of bidding.slice(0, 80)) {
    const cat = b.category || "综合能源";
    const status = b.status || "";
    const prov = b.province ? `（${b.province}）` : "";
    const amt = b.amount ? `，预算金额：${b.amount}` : "";
    const date = b.date ? `（${b.date}）` : "";

    qaList.push({
      question: `最近${cat}方面有什么招标信息？`,
      answer: `【${b.title}】${date} 状态：${status}${prov}${amt}。${b.summary || ""}`,
      category: "bidding",
      tags: [cat, b.status, b.province].filter(Boolean),
      source: b.sourceName || "",
      date: b.date || "",
    });

    // 额外生成具体问题
    if (b.title.length > 10) {
      qaList.push({
        question: `${b.title.slice(0, 30)}的招标详情是什么？`,
        answer: `项目名称：${b.title}\n发布时间：${b.date || "未知"}\n省份：${b.province || "全国"}\n状态：${status}\n${amt ? `预算：${b.amount}\n` : ""}摘要：${b.summary || "暂无详细信息"}\n来源：${b.sourceUrl || b.sourceName || ""}`,
        category: "bidding",
        tags: [cat, b.province],
        source: b.sourceName || "",
        date: b.date || "",
      });
    }
  }

  // --- 中标类问答 ---
  for (const a of awards.slice(0, 80)) {
    const cat = a.category || "综合能源";
    const prov = a.province ? `（${a.province}）` : "";
    const comp = a.company ? `，中标单位：${a.company}` : "";
    const amt = a.amount ? `，中标金额：${a.amount}` : "";
    const date = a.date ? `（${a.date}）` : "";

    qaList.push({
      question: `最近${cat}领域有哪些中标公告？`,
      answer: `【${a.title}】${date}${prov}${comp}${amt}。${a.summary || ""}`,
      category: "award",
      tags: [cat, a.province].filter(Boolean),
      source: a.sourceName || "",
      date: a.date || "",
    });
  }

  // --- 充电桩类问答 ---
  for (const c of chargers.slice(0, 50)) {
    const prov = c.province ? `（${c.province}）` : "";
    const date = c.date ? `（${c.date}）` : "";

    qaList.push({
      question: `最近充电桩/充电站建设有哪些动态？`,
      answer: `【${c.title}】${date}${prov}。${c.summary || ""}`,
      category: "charger",
      tags: ["充电桩", c.province].filter(Boolean),
      source: c.sourceName || "",
      date: c.date || "",
    });
  }

  // --- 行业综合问答（从所有数据中提炼热点话题） ---
  const allItems = [
    ...projects.map((p) => ({ text: p.title + " " + p.summary, date: p.date, src: p.sourceName })),
    ...bidding.map((b) => ({ text: b.title + " " + b.summary, date: b.date, src: b.sourceName })),
    ...awards.map((a) => ({ text: a.title + " " + a.summary, date: a.date, src: a.sourceName })),
  ];

  // 按省份统计
  const provinceCount: Record<string, number> = {};
  for (const item of allItems) {
    const prov = extractProvince(item.text);
    if (prov) {
      provinceCount[prov] = (provinceCount[prov] || 0) + 1;
    }
  }
  const topProvinces = Object.entries(provinceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topProvinces.length > 0) {
    qaList.push({
      question: "哪些省份的光伏储能项目最活跃？",
      answer: `根据最新数据，光伏储能项目最活跃的省份依次为：\n${topProvinces.map(([p, c], i) => `${i + 1}. ${p}（${c}条信息）`).join("\n")}\n\n数据更新时间：${new Date().toISOString().slice(0, 10)}`,
      category: "industry",
      tags: ["省份排行", "行业概览"],
      source: "自动统计",
      date: new Date().toISOString().slice(0, 10),
    });
  }

  // 按类型统计
  const typeCount: Record<string, number> = {};
  for (const p of projects) {
    const t = p.type || "其他";
    typeCount[t] = (typeCount[t] || 0) + 1;
  }
  const typeEntries = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  if (typeEntries.length > 0) {
    qaList.push({
      question: "目前各类新能源项目的分布情况如何？",
      answer: `当前项目类型分布：\n${typeEntries.map(([t, c]) => `- ${t}：${c}个项目`).join("\n")}\n\n招标信息：${bidding.length}条\n中标公告：${awards.length}条\n充电桩动态：${chargers.length}条`,
      category: "industry",
      tags: ["类型分布", "行业概览"],
      source: "自动统计",
      date: new Date().toISOString().slice(0, 10),
    });
  }

  // 保存知识库
  fs.writeFileSync(
    path.join(DATA_DIR, "qa-knowledge.json"),
    JSON.stringify(qaList, null, 2)
  );

  console.log(`\n=== 问答式知识库已生成 ===`);
  console.log(`  总 QA 条目数: ${qaList.length}`);
  console.log(`  项目问答: ${qaList.filter(q => q.category === "project").length}`);
  console.log(`  招标问答: ${qaList.filter(q => q.category === "bidding").length}`);
  console.log(`  中标问答: ${qaList.filter(q => q.category === "award").length}`);
  console.log(`  充电桩问答: ${qaList.filter(q => q.category === "charger").length}`);
  console.log(`  行业综合: ${qaList.filter(q => q.category === "industry").length}`);
  console.log(`  保存路径: public/data/qa-knowledge.json`);
}

main().catch(console.error);
