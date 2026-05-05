/**
 * 光伏储能地图站 - 常量与配置
 */

export const SITE_NAME = "光伏储能地图站";
export const SITE_DESCRIPTION =
  "国内领先的光伏储能行业垂直目录站，收录全国光伏储能项目、储能电站、充电站数据";

export const PROVINCES = [
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
] as const;

export const PROJECT_TYPES = [
  "光伏",
  "储能",
  "风电",
  "充电",
  "氢能",
  "综合能源",
] as const;

export const BIDDING_STATUSES = ["报名中", "已截止"] as const;

// 爬虫数据源配置
export const CRAWL_SOURCES = {
  chinapower: {
    name: "中国电力网",
    baseUrl: "http://www.chinapower.com.cn",
    sections: [
      { path: "/chuneng/", name: "储能" },
      { path: "/tynfd/", name: "新能源发电" },
      { path: "/fd/", name: "风电" },
      { path: "/xw/", name: "电力新闻" },
      { path: "/dww/", name: "电网" },
      { path: "/flfd/", name: "分散式发电" },
      { path: "/qingneng/", name: "氢能" },
      { path: "/tanzhonghe/", name: "碳综合" },
      { path: "/guihuajianshe/", name: "规划建设" },
    ],
    maxPages: 15,
  },
  nea: {
    name: "国家能源局",
    baseUrl: "http://www.nea.gov.cn",
    sections: [
      { path: "/xwzx/zwgg/", name: "通知公告" },
      { path: "/xwzx/xw/", name: "新闻中心" },
      { path: "/sjzz/sjzz/", name: "数据中心" },
      { path: "/zcfg/zcjd/", name: "政策解读" },
    ],
    maxPages: 10,
  },
  neaSearch: {
    name: "国家能源局搜索",
    baseUrl: "https://www.nea.gov.cn",
    searchUrl: "https://www.nea.gov.cn/search.htm",
    keywords: ["光伏", "储能", "风电", "新能源", "招标", "项目"],
  },
  newenergy: {
    name: "中国新能源网",
    baseUrl: "http://www.newenergy.org.cn",
    sections: [
      "http://www.newenergy.org.cn/xnyjz/yjdt/",
      "http://www.newenergy.org.cn/xnyjz/zcfg/",
      "http://www.newenergy.org.cn/hqsy/hqdt/",
    ],
  },
  solarbe: {
    name: "索比光伏网",
    baseUrl: "https://www.solarbe.com",
    sections: [
      "https://www.solarbe.com/news/",
      "https://www.solarbe.com/policy/",
      "https://www.solarbe.com/market/",
    ],
    maxPages: 10,
  },
  bjx: {
    name: "北极星光伏网",
    baseUrl: "https://guangfu.bjx.com.cn",
    sections: [
      "https://guangfu.bjx.com.cn/news/",
      "https://guangfu.bjx.com.cn/project/",
      "https://guangfu.bjx.com.cn/bidding/",
    ],
    maxPages: 15,
  },
  ggzy: {
    name: "中国招标投标网",
    baseUrl: "https://www.ggzy.gov.cn",
    sections: [
      "https://www.ggzy.gov.cn/deal/dealList.html",
      "https://www.ggzy.gov.cn/deal/dealListBid.html",
    ],
  },
  cninfo: {
    name: "巨潮资讯网",
    baseUrl: "https://www.cninfo.com.cn",
    searchUrl: "https://www.cninfo.com.cn/new/fulltextSearch",
    keywords: ["光伏", "储能", "风电", "新能源"],
  },
} as const;

// AI 分析 Prompt 模板 (Gemma 4 + Function Calling)
export const AI_PROMPTS = {
  policy: `你是一位资深新能源政策分析师。请分析以下政策/新闻内容，提供：
1. 核心要点（3-5条）
2. 对光伏储能行业的影响评估
3. 投资机会与风险提示
4. 建议关注的方向

内容：{content}`,
  project: `你是一位新能源项目评估专家。请分析以下项目信息，提供：
1. 项目概况总结
2. 技术方案评估
3. 投资价值分析
4. 潜在风险点
5. 关注建议

项目信息：{content}`,
  trend: `你是一位新能源行业趋势研究员。基于以下信息，请分析：
1. 当前行业发展趋势
2. 市场格局变化
3. 技术路线演进
4. 未来3-6个月预测
5. 投资建议

信息：{content}`,
  bidding: `你是一位招标分析专家。请分析以下招标信息，提供：
1. 招标项目概要
2. 技术要求解读
3. 竞争态势分析
4. 投标建议
5. 风险提示

招标信息：{content}`,
} as const;

// 能源韧性分析 Prompt (Gemma 4 Good 参赛核心)
export const RESILIENCE_PROMPTS = {
  resilience: `你是一位能源韧性评估专家，专注于光伏储能系统的灾害响应和气候适应能力。

请基于以下实时数据，评估 {location} 地区的能源韧性：

【实时天气数据】
{weather_data}

【当前电价信息】
{price_data}

【项目信息】
{project_info}

请提供：
1. 当前灾害风险评估（台风/暴雨/沙尘/极端温度对面板和储能系统的影响）
2. 发电效率预测（基于天气条件的当日预期发电量偏差）
3. 储能调度建议（基于峰谷电价差的充放电策略）
4. 应急响应方案（极端天气下的系统保护措施）
5. 气候适应建议（长期气候趋势下的设施优化方向）

如果需要更精确的数据，请调用 get_weather、get_electricity_price 或 get_pv_forecast 工具。`,
} as const;

// 数据源链接（展示用）
export const DATA_SOURCE_LINKS = [
  { name: "中国电力网", url: "http://www.chinapower.com.cn/" },
  { name: "国家能源局", url: "http://www.nea.gov.cn/" },
  { name: "中国新能源网", url: "http://www.newenergy.org.cn/" },
  { name: "索比光伏网", url: "https://www.solarbe.com/" },
  { name: "中国充电联盟", url: "http://www.evcipa.org.cn/" },
  { name: "北极星光伏网", url: "https://guangfu.bjx.com.cn/" },
] as const;

// 导航配置
export const NAV_ITEMS = [
  { label: "首页", href: "/", key: "home" as const },
  { label: "招标动态", href: "/bidding", key: "bidding" as const },
  { label: "中标公示", href: "/awards", key: "awards" as const },
  { label: "省份分析", href: "/province", key: "province" as const },
  { label: "充电桩", href: "/chargers", key: "chargers" as const },
  { label: "数据看板", href: "/dashboard", key: "dashboard" as const },
  { label: "AI助手", href: "/ai", key: "ai" as const },
  {
    label: "充电站优化",
    href: "/dcic/ev-charging",
    key: "ev-charging" as const,
  },
  {
    label: "功率预测",
    href: "/dcic/power-prediction",
    key: "power-prediction" as const,
  },
  {
    label: "数字孪生",
    href: "/dcic/digital-twin",
    key: "digital-twin" as const,
  },
  {
    label: "缺陷检测",
    href: "/dcic/power-inspection",
    key: "power-inspection" as const,
  },
  {
    label: "充电桩AI",
    href: "/dcic/ev-charger-ai",
    key: "ev-charger-ai" as const,
  },
  { label: "具身AI", href: "/dcic/embodied-ai", key: "embodied-ai" as const },
  {
    label: "信创能源",
    href: "/dcic/xinchuang-energy",
    key: "xinchuang-energy" as const,
  },
] as const;
