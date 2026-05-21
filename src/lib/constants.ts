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
// 类别说明:
//   - 行业媒体: chinapower, newenergy, solarbe, bjx, escn, china5e, evcipa
//   - 政府平台: ccgp, ggzy, ndrc, tender (国家级); provinces (省级公共资源交易)
export const CRAWL_SOURCES = {
  // ===== 行业媒体类 =====
  chinapower: {
    name: "中国电力网",
    baseUrl: "http://www.chinapower.com.cn",
    type: "media" as const,
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
    type: "government" as const,
    sections: [
      { path: "/xwzx/zwgg/", name: "通知公告" },
      { path: "/xwzx/xw/", name: "新闻中心" },
      { path: "/sjzz/sjzz/", name: "数据中心" },
      { path: "/zcfg/zcjd/", name: "政策解读" },
    ],
    maxPages: 10,
  },
  ndrpc: {
    name: "国家发改委",
    baseUrl: "https://www.ndrc.gov.cn",
    sections: [
      { path: "/xwzx/zwgg/", name: "通知公告" },
      { path: "/xwzx/xw/", name: "新闻动态" },
      { path: "/zcfg/zcjd/", name: "政策解读" },
    ],
    keywords: [
      "光伏",
      "储能",
      "风电",
      "新能源",
      "可再生能源",
      "绿电",
      "碳达峰",
      "碳中和",
    ],
    maxPages: 10,
  },
  gdgov: {
    name: "广东省政府",
    baseUrl: "https://www.gd.gov.cn",
    sections: [
      { path: "/zwgk/zwgk02/gggky/", name: "公示公告" },
      { path: "/zwgk/zwgk06/", name: "政策解读" },
    ],
    keywords: [
      "光伏",
      "储能",
      "风电",
      "新能源",
      "充电桩",
      "氢能",
      "电池",
      "可再生能源",
    ],
    maxPages: 10,
  },
  gddrc: {
    name: "广东省发改委",
    baseUrl: "https://drc.gd.gov.cn",
    sections: [
      { path: "/zwgk/ztzl/xzgfxgk/", name: "政策法规" },
      { path: "/zwgk/tzgg/", name: "通知公告" },
    ],
    keywords: ["光伏", "储能", "风电", "新能源", "项目", "招标"],
    maxPages: 10,
  },
  newenergy: {
    name: "中国新能源网",
    baseUrl: "http://www.newenergy.org.cn",
    type: "media" as const,
    sections: [
      "http://www.newenergy.org.cn/xnyjz/yjdt/",
      "http://www.newenergy.org.cn/xnyjz/zcfg/",
      "http://www.newenergy.org.cn/hqsy/hqdt/",
    ],
  },
  solarbe: {
    name: "索比光伏网",
    baseUrl: "https://www.solarbe.com",
    type: "media" as const,
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
    type: "media" as const,
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
  csg: {
    name: "南方电网",
    baseUrl: "https://www.csg.cn",
    sections: [
      { path: "/ Columnid=6636", name: "新闻动态" },
      { path: "/ Columnid=6645", name: "公示公告" },
      { path: "/ Columnid=6638", name: "采购信息" },
    ],
    keywords: ["光伏", "储能", "风电", "新能源", "充电桩", "招标", "项目"],
    maxPages: 10,
  },
  csgBid: {
    name: "南方电网招标",
    baseUrl: "https://www.bidding.csg.cn",
    searchUrl: "https://www.bidding.csg.cn/zbcg/index.jhtml",
    keywords: [
      "光伏",
      "储能",
      "风电",
      "新能源",
      "充电桩",
      "设备",
      "安装",
      "施工",
      "监理",
      "设计",
    ],
    maxPages: 10,
  },
  csgb: {
    name: "南方电网深圳",
    baseUrl: "https://www.sz.csg.cn",
    sections: [
      { path: "/zwgk/gggs/", name: "公示公告" },
      { path: "/cggg/cgxm/", name: "采购公告" },
    ],
    keywords: ["光伏", "储能", "充电桩", "招标"],
    maxPages: 10,
  },
  cninfo: {
    name: "巨潮资讯网",
    baseUrl: "https://www.cninfo.com.cn",
    searchUrl: "https://www.cninfo.com.cn/new/fulltextSearch",
    keywords: ["光伏", "储能", "风电", "新能源"],
  },
  escn: {
    name: "储能与电力市场",
    baseUrl: "https://www.escn.com.cn",
    type: "media" as const,
    sections: ["news/", "policy/", "market/"],
  },
  china5e: {
    name: "中国能源网",
    baseUrl: "https://www.china5e.com",
    type: "media" as const,
    sections: ["news/", "news/zonghe/", "news/huanbao/"],
  },
  // ===== 政府采购/招标类（国家级） =====
  ccgp: {
    name: "中国政府采购网",
    baseUrl: "https://www.ccgp.gov.cn",
    type: "government" as const,
    sections: [
      { path: "/cggg/zygg/gkzb/", name: "招标公告" },
      { path: "/cggg/dfcg/cgxx/", name: "地方采购" },
    ],
  },
  tender: {
    name: "中国招投标公共服务平台",
    baseUrl: "https://www.cebpubservice.com",
    type: "government" as const,
    sections: ["cgxx/", "zbcgxx/"],
  },
  ndrc: {
    name: "国家发改委",
    baseUrl: "https://www.ndrc.gov.cn",
    type: "government" as const,
    sections: ["xwzx/tzgg/", "fzggw/"],
  },
  evcipa: {
    name: "中国充电联盟",
    baseUrl: "http://www.evcipa.org.cn",
    type: "industry" as const,
  },
  // ===== 省级公共资源交易平台 =====
  provinces: {
    name: "省级公共资源交易平台",
    type: "government" as const,
    description: "覆盖31个省市自治区公共资源交易平台",
    platforms: [
      {
        name: "北京市公共资源交易服务平台",
        url: "https://ggzyfw.beijing.gov.cn",
        province: "北京",
      },
      {
        name: "天津市公共资源交易平台",
        url: "https://www.tjggzy.com",
        province: "天津",
      },
      {
        name: "河北省招标投标公共服务平台",
        url: "https://www.hebeieb.com",
        province: "河北",
      },
      {
        name: "河北省公共资源交易平台",
        url: "https://www.hbggzy.cn",
        province: "河北",
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
        name: "江苏省公共资源交易平台",
        url: "https://jsggzy.jszwfw.gov.cn",
        province: "江苏",
      },
      {
        name: "浙江省公共资源交易服务平台",
        url: "https://zjpubservice.zjzwfw.gov.cn",
        province: "浙江",
      },
      {
        name: "安徽省公共资源交易监管网",
        url: "https://www.ahggzyjy.cn",
        province: "安徽",
      },
      {
        name: "福建省公共资源交易电子公共服务平台",
        url: "https://ggzyfw.fujian.gov.cn",
        province: "福建",
      },
      {
        name: "江西省公共资源交易平台",
        url: "http://www.jxsggzy.cn",
        province: "江西",
      },
      {
        name: "山东省公共资源交易网",
        url: "https://www.sdggzyjy.gov.cn",
        province: "山东",
      },
      {
        name: "河南省公共资源交易中心网",
        url: "http://hnsggzyjy.henan.gov.cn",
        province: "河南",
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
        name: "海南省公共资源交易服务中心",
        url: "http://zw.hainan.gov.cn/ggzy/",
        province: "海南",
      },
      {
        name: "重庆市公共资源交易网",
        url: "https://www.cqggzy.com",
        province: "重庆",
      },
      {
        name: "四川省公共资源交易信息网",
        url: "https://ggzyjy.sc.gov.cn",
        province: "四川",
      },
      {
        name: "贵州省公共资源交易公共服务平台",
        url: "http://ggzy.guizhou.gov.cn",
        province: "贵州",
      },
      {
        name: "云南省公共资源交易信息网",
        url: "https://ggzy.yn.gov.cn",
        province: "云南",
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
    ] as const,
  },
  // ===== 市级重点平台 =====
  cities: {
    name: "市级公共资源交易平台（重点）",
    type: "government" as const,
    description: "新能源项目密集城市的市级交易平台",
    platforms: [
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
    ] as const,
  },
} as const;

// 爬虫搜索关键词
export const CRAWL_KEYWORDS = [
  "光伏",
  "储能",
  "风电",
  "新能源",
  "可再生能源",
  "充电桩",
  "充电站",
  "氢能",
  "制氢",
  "锂电池",
  "电池",
  "绿电",
  "碳达峰",
  "碳中和",
  "源网荷储",
  "虚拟电厂",
  "微电网",
  "综合能源",
  "中标",
  "招标",
  "项目",
  "开工",
  "投产",
  "并网",
  "签约",
  "审批",
  "核准",
  "备案",
];

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

// 数据源链接（展示用）- 分组展示
export const DATA_SOURCE_LINKS = [
  // 国家级综合平台
  { name: "中国政府采购网", url: "https://www.ccgp.gov.cn/" },
  { name: "全国公共资源交易平台", url: "https://www.ggzy.gov.cn/" },
  { name: "中国招投标公共服务平台", url: "https://www.cebpubservice.com/" },
  // 行业媒体
  { name: "中国电力网", url: "http://www.chinapower.com.cn/" },
  { name: "国家能源局", url: "http://www.nea.gov.cn/" },
  { name: "中国新能源网", url: "http://www.newenergy.org.cn/" },
  { name: "索比光伏网", url: "https://www.solarbe.com/" },
  { name: "北极星光伏网", url: "https://guangfu.bjx.com.cn/" },
  { name: "储能与电力市场", url: "https://www.escn.com.cn/" },
  { name: "中国能源网", url: "https://www.china5e.com/" },
  { name: "中国充电联盟", url: "http://www.evcipa.org.cn/" },
  // 政府部门
  { name: "国家发改委", url: "https://www.ndrc.gov.cn/" },
] as const;

// 省级公共资源交易平台链接（展示用）
export const PROVINCE_PLATFORM_LINKS = [
  {
    name: "北京市公共资源交易服务平台",
    url: "https://ggzyfw.beijing.gov.cn",
    province: "北京",
  },
  {
    name: "天津市公共资源交易平台",
    url: "https://www.tjggzy.com",
    province: "天津",
  },
  {
    name: "河北省公共资源交易平台",
    url: "https://www.hbggzy.cn",
    province: "河北",
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
    name: "江苏省公共资源交易平台",
    url: "https://jsggzy.jszwfw.gov.cn",
    province: "江苏",
  },
  {
    name: "浙江省公共资源交易服务平台",
    url: "https://zjpubservice.zjzwfw.gov.cn",
    province: "浙江",
  },
  {
    name: "安徽省公共资源交易监管网",
    url: "https://www.ahggzyjy.cn",
    province: "安徽",
  },
  {
    name: "福建省公共资源交易电子公共服务平台",
    url: "https://ggzyfw.fujian.gov.cn",
    province: "福建",
  },
  {
    name: "江西省公共资源交易平台",
    url: "http://www.jxsggzy.cn",
    province: "江西",
  },
  {
    name: "山东省公共资源交易网",
    url: "https://www.sdggzyjy.gov.cn",
    province: "山东",
  },
  {
    name: "河南省公共资源交易中心网",
    url: "http://hnsggzyjy.henan.gov.cn",
    province: "河南",
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
    name: "海南省公共资源交易服务中心",
    url: "http://zw.hainan.gov.cn/ggzy/",
    province: "海南",
  },
  {
    name: "重庆市公共资源交易网",
    url: "https://www.cqggzy.com",
    province: "重庆",
  },
  {
    name: "四川省公共资源交易信息网",
    url: "https://ggzyjy.sc.gov.cn",
    province: "四川",
  },
  {
    name: "贵州省公共资源交易公共服务平台",
    url: "http://ggzy.guizhou.gov.cn",
    province: "贵州",
  },
  {
    name: "云南省公共资源交易信息网",
    url: "https://ggzy.yn.gov.cn",
    province: "云南",
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
