# 光伏储能地图站 v2

## 项目概览

光伏储能垂直目录站是基于GEO（生成式引擎优化）实战复盘开发的Web应用，收录全国光伏储能项目、储能电站、充电站数据，支持项目地图可视化、招标动态追踪、中标公示、省份分析、充电桩查询、AI智能分析、光伏发电预测。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **AI**: Ollama (qwen2.5:7b) - 政策解读/项目评估/趋势预测/招标分析
- **预测模型**: PatchTST (ICLR 2023) - 光伏发电功率预测
- **数据库**: PostgreSQL + Drizzle ORM
- **爬虫**: Puppeteer + HTTP fetch - 6大数据源自动采集
- **部署**: Docker Compose - 一键部署全栈

## 项目结构

```
src/
├── app/
│   ├── page.tsx           # 主页（导航卡片 + 项目列表 + 行业报告）
│   ├── layout.tsx         # 根布局
│   ├── bidding/page.tsx   # 招标公告页面
│   ├── awards/page.tsx    # 中标公示页面
│   ├── province/page.tsx  # 省份分析页面
│   ├── chargers/page.tsx  # 充电桩查询页面
│   ├── dashboard/page.tsx # 数据分析仪表盘
│   ├── ai/page.tsx        # AI智能助手
│   ├── api/
│   │   ├── crawl/         # 爬虫API (4个数据源 + 状态查询)
│   │   ├── ai/            # AI分析API (分析/预测/搜索)
│   │   ├── stats/         # 统计数据API (5分钟缓存)
│   │   ├── health/        # 健康检查API (Web+Ollama+DB+Forecast)
│   │   └── projects/      # 项目爬取API (全源爬取)
│   ├── robots.ts          # robots.txt 配置
│   ├── json-ld.tsx        # JSON-LD 结构化数据
│   └── globals.css        # 全局样式
├── components/
│   ├── site-header.tsx    # 共享导航头部 (响应式, 高亮当前页)
│   ├── site-footer.tsx    # 共享底部 (数据来源链接)
│   ├── page-layout.tsx    # 通用页面布局 (Header+Content+Footer)
│   ├── stat-cards.tsx     # 统计卡片组件 (StatCards/SimpleStatCards)
│   ├── data-source-card.tsx # 数据来源展示卡片
│   └── ui/                # shadcn/ui 组件库
├── hooks/
│   ├── use-data.ts        # 数据加载Hook (统一获取+统计计算)
│   └── use-mobile.ts      # 移动端检测
└── lib/
    ├── types.ts           # 统一类型定义 (Project/BiddingItem/StatCardItem等)
    ├── constants.ts       # 常量与配置 (省份/数据源/AI Prompt/导航)
    ├── data.ts            # 数据工具函数 (解析/分类/统计/样式)
    ├── crawler.ts         # 增强爬虫系统 (6数据源+自动Chrome检测)
    ├── ai.ts              # AI分析服务 (Ollama+降级+搜索+预测)
    ├── db/
    │   ├── index.ts       # 数据库Schema (6张表+Zod验证)
    │   └── client.ts      # 数据库客户端 (连接池+健康检查)
    └── utils.ts           # 工具函数

scripts/
├── batch-crawl-v5.ts      # 增强批量爬取 (增量+5数据源)
├── batch-crawl-v4.ts      # 旧版批量爬取
├── db-migrate.ts          # 数据库迁移脚本
├── db-seed.ts             # 数据库种子导入 (JSON→PostgreSQL)
├── init.sql               # 数据库初始化SQL
├── deploy.sh              # 一键部署脚本 (--dev/--prod/--migrate/--seed)
├── build.sh / dev.sh / start.sh
└── prepare.sh

public/
├── data/
│   ├── projects.json      # 光伏储能项目数据
│   ├── bidding.json       # 招标公告数据
│   ├── awards.json        # 中标公示数据
│   └── chargers.json      # 充电站数据
└── llms.txt               # AI友好的网站说明文件
```

## 共享组件

| 组件 | 作用 | 使用页面 |
|------|------|---------|
| `PageLayout` | 统一页面布局 (Header+Content+Footer) | 全部子页面 |
| `StatCards` | 统计卡片组 (图标+数值+标签) | Dashboard |
| `SimpleStatCards` | 简单统计卡片 | Bidding等 |
| `DataSourceCard` | 数据来源展示 | 首页 |
| `SiteHeader` | 响应式导航 (高亮当前页) | 全局 |
| `SiteFooter` | 底部信息 (数据来源链接) | 全局 |

## 页面功能

### 1. 主页 (/)
- Hero区域：核心统计数据
- 8个导航卡片：项目地图、招标动态、中标公示、省份分析、充电桩、数据看板、AI助手、行业报告
- 项目列表：搜索+省份/类型筛选
- 行业报告预览
- 数据来源链接

### 2. 招标公告 (/bidding) - 使用 PageLayout
- 卡片列表展示招标信息
- 汇总统计、状态筛选、省份过滤、搜索

### 3. 中标公示 (/awards) - 使用 PageLayout
- 中标结果与金额公示
- 汇总与搜索过滤

### 4. 省份分析 (/province) - 使用 PageLayout
- 省份项目排行（项目数/装机量/企业数排序切换）
- 类型分布条形图

### 5. 充电桩 (/chargers) - 使用 PageLayout
- 充电站卡片网格
- 省份过滤

### 6. 数据看板 (/dashboard) - 使用 PageLayout + StatCards
- 核心指标卡片 (StatCards组件)
- 项目类型分布图
- 省份排行 Top10
- 年份分布图
- 数据来源分布
- 招标状态分布
- 投资方排行 Top10

### 7. AI智能助手 (/ai) - 使用 PageLayout
- 4种分析模式：政策解读/项目评估/趋势预测/招标分析
- 预设问题快速开始
- 实时对话式分析
- Ollama LLM 智能分析 + 降级规则分析
- 风险评级 + 情绪分析

## AI集成

### Ollama LLM
- 模型: qwen2.5:7b (可配置)
- 分析类型: 政策解读、项目评估、趋势预测、招标分析
- 降级方案: 关键词规则分析 (LLM不可用时)
- API: /api/ai/analyze, /api/ai/search, /api/ai/forecast

### PatchTST 光伏预测
- 模型: PatchTST (ICLR 2023), ~5M参数
- 输入: 336步(3.5天)历史数据
- 输出: 96步(24h)发电预测
- 降级方案: 简单日历模型

## 爬虫系统

### 数据源 (6个)
1. 中国电力网 (chinapower.com.cn) - SSR, 多栏目, 可翻页
2. 国家能源局 (nea.gov.cn) - SSR, 政策新闻
3. 中国新能源网 (newenergy.org.cn) - SSR, 科研动态
4. 索比光伏网 (solarbe.com) - SSR, 光伏行业
5. 北极星光伏网 (bjx.com.cn) - SSR, 项目/招标
6. 中国政府采购网 (ccgp.gov.cn) - 招标/中标

### 特性
- 增量更新: 跳过已爬取URL
- 自动分类: 项目/招标/中标/充电桩
- 信息提取: 省份/容量/金额/企业/日期
- 状态保存: .crawl-state.json
- 自动Chrome检测: 支持 Linux/Windows/macOS

## 数据库

### Schema (Drizzle ORM + PostgreSQL)
- projects: 光伏储能项目
- bidding_items: 招标公告
- award_items: 中标公示
- charger_items: 充电桩
- crawl_logs: 爬取日志
- ai_analysis_logs: AI分析日志

### 命令
```bash
# 运行SQL迁移
pnpm db:migrate

# 导入JSON种子数据
pnpm db:seed

# Drizzle Kit推送Schema
pnpm db:push
```

## 部署

### Docker Compose 一键部署
```bash
# 开发模式
pnpm deploy:dev

# 生产模式
pnpm deploy
```

服务:
- web: Next.js 前端 (端口 5000)
- db: PostgreSQL (端口 5432)
- ollama: LLM 服务 (端口 11434)
- forecast: PatchTST 预测 API (端口 8001)

### 环境变量
参考 .env.example

## GEO优化

- llms.txt - AI友好的网站说明文件
- robots.txt - 明确放行AI爬虫（GPTBot、ClaudeBot、PerplexityBot等）
- JSON-LD结构化数据（Organization、Dataset、WebSite）
- 自包含段落内容便于AI理解
- 语义化的HTML结构

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发环境
pnpm dev

# 构建
pnpm build

# 生产环境
pnpm start

# 类型检查
pnpm ts-check

# 批量爬取 (全量)
pnpm crawl

# 批量爬取 (增量)
pnpm crawl:inc

# 数据库迁移
pnpm db:migrate

# 数据库种子导入
pnpm db:seed

# Drizzle Kit推送
pnpm db:push
```
