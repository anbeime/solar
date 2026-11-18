# TOPGO SOLAR

光伏储能行业数据平台 + 光储智脑一体机方案。数据不出域，本地优先。

- 在线站点：<https://solar.miyucaicai.cn>
- 主体：TOPGO / 珠海安能宇新能源科技有限公司
- 许可：Apache-2.0

## 一、光伏储能数据地图站（本仓库主体）

基于 Next.js + shadcn/ui 的全栈应用，聚合光伏/储能/充电桩项目、招标、中标与政策数据。

- 数据规模：990 行业项目 / 50 招标（更新至 2026-11-12）
- 数据源：国家发改委、广东政府、南方电网招标网等公开渠道
- 在线模块：项目地图、招标、中标、充电桩、AI 问答、数字孪生、EV/电网分析
- 数据文件：`public/data/*.json`（近 90 天滚动保留）

## 二、光储智脑一体机（招商方案与工程产物）

面向光储充运营场景的本地 AI 运营官方案：插电即用，数据不出站。四岗位覆盖收益账本、设备健康值守、政策策略参谋、充电用户经营。

方案与配套工程产物见 [`docs/solar-box/`](docs/solar-box/)：

| 文件 | 说明 |
|---|---|
| `光储智脑一体机-招商方案书.html` / `.pdf` | 招商方案书（网页版 / 打印版） |
| `tools/meter30_template_gen.py` | 计量3.0「调控调试清单」模板自动生成器（零模型依赖，仅 openpyxl） |
| `samples/调控调试清单_演示样例.xlsx` | 生成器演示样例输出（4 行，非真实项目数据） |

模板生成规则来自南方电网售电《增量光伏"四可"设备验收及计量建档指引（增量）》实读条款，覆盖类型码、终端类别、测量点全局唯一、资产编号回退、表地址推导、专变分支轮次等校验。使用前须以南网最新权威模板核对列头列名。

## 三、快速开始

```bash
pnpm install
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm start        # 生产启动
```

其他常用脚本：`pnpm lint`、`pnpm ts-check`、`pnpm db:migrate`、`pnpm crawl:inc`、`pnpm deploy:dev`。要求 pnpm 9+（仓库预置 only-allow 钩子，禁用 npm/yarn）。

## 四、技术栈

Next.js 16.1.1（App Router）· shadcn/ui（Radix UI）· Tailwind CSS v4 · Drizzle ORM · TypeScript 5 · pnpm 9+

## 五、数据说明

- 站点数据来自公开渠道采集，仅供行业研究与信息参考。
- `samples/` 目录为演示数据，不对应任何真实项目或客户。
- 一体机方案为产品规划，能力以实际交付版本为准。
