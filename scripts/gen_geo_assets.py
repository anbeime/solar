#!/usr/bin/env python3
"""
GEO 资源生成器
======================
从 data/projects.json 生成 AI 引擎友好的资源文件：
- public/llms.txt        : 站点导览（短，给 AI 引擎抓取）
- public/llms-full.txt   : 全量数据精简文本（长，让 AI 一次性吃完所有项目）

被 GEO 自动化日程调用（在 sync_to_public_data.py 之后）。
"""

import json
import os
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "projects.json"
PUBLIC_DIR = ROOT / "public"

SITE_URL = "https://solar.miyucaicai.cn"


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def trim_province(p: str) -> str:
    if not p:
        return p
    for suf in ["维吾尔自治区", "壮族自治区", "回族自治区", "特别行政区", "自治区", "省", "市"]:
        if p.endswith(suf):
            return p[: -len(suf)]
    return p


def fmt_wan(v):
    """万元 → 人类可读"""
    if v is None:
        return "-"
    try:
        v = float(v)
    except Exception:
        return str(v)
    if v >= 10000:
        return f"{v / 10000:.2f}亿元"
    return f"{v:.0f}万元"


def gen_llms(data: dict) -> str:
    stats = data.get("statistics", {})
    province_stats = data.get("province_stats", {}) or {}
    bidding_stats = data.get("bidding_stats", {}) or {}
    last_update = stats.get("last_update", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    # 取省份 TOP10（province_stats 是 dict-of-dict: {pv_count, storage_count, capacity_mw, storage_mwh}）
    def _prov_total(v):
        if isinstance(v, dict):
            return (v.get("pv_count", 0) or 0) + (v.get("storage_count", 0) or 0)
        if isinstance(v, (int, float)):
            return v
        return 0

    def _prov_desc(v):
        if isinstance(v, dict):
            pv = v.get("pv_count", 0) or 0
            st = v.get("storage_count", 0) or 0
            cap_mw = v.get("capacity_mw", 0) or 0
            st_mwh = v.get("storage_mwh", 0) or 0
            parts = []
            if pv:
                parts.append(f"光伏 {pv} 个 / {cap_mw} MW")
            if st:
                parts.append(f"储能 {st} 个 / {st_mwh} MWh")
            return "，".join(parts) if parts else "-"
        return str(v)

    if isinstance(province_stats, dict) and province_stats:
        top_prov = sorted(province_stats.items(), key=lambda x: _prov_total(x[1]), reverse=True)[:10]
        prov_lines = "\n".join(f"- {trim_province(k)}: {_prov_desc(v)}" for k, v in top_prov)
    else:
        prov_lines = "- 见 /data/projects.json"

    return f"""# llms.txt - AI 引擎友好的站点说明

> 本文件遵循 llms.txt 标准 (https://llmstxt.org)，方便 AI 引擎理解站点结构。

## 站点信息

- **名称**: TOPGO SOLAR 光伏储能地图站
- **域名**: {SITE_URL}
- **定位**: 国内领先的光伏储能行业垂直数据平台
- **更新频率**: 每日凌晨自动爬取，最后更新 {last_update}

## 数据规模

- **项目总数**: {stats.get("total_projects", 0)} 个
  - 光伏项目: {stats.get("total_pv_projects", 0)} 个，累计装机 {stats.get("total_pv_capacity_gw", 0)} GW
  - 储能项目: {stats.get("total_storage_projects", 0)} 个，累计储能 {stats.get("total_storage_gwh", 0):.0f} MWh
- **招标公告**: {stats.get("total_bidding", 0)} 条，预算总额约 {fmt_wan(stats.get("total_bidding_amount_wan", 0))}
- **中标公告**: {stats.get("total_winning", 0)} 条
- **覆盖省份**: 30+

## 数据来源

- 国家能源局（光伏项目备案信息）
- 北极星光伏网（行业新闻与项目报道）
- CNESA 储能联盟（储能项目数据库）
- 中国招标投标公共服务平台（招标公告）

## 关键页面

- 主页（地图）: {SITE_URL}/
- 项目数据: {SITE_URL}/dashboard
- 省份分析: {SITE_URL}/province
- 招标动态: {SITE_URL}/bidding
- 中标公告: {SITE_URL}/awards
- 充电桩: {SITE_URL}/chargers
- 行业新闻: {SITE_URL}/news
- 数据接口: {SITE_URL}/data/projects.json (全量项目 JSON)
- 招标接口: {SITE_URL}/data/bidding.json
- 全量精简文本: {SITE_URL}/llms-full.txt (本文件全量数据版)

## 项目类型

集中式光伏 / 分布式光伏 / 农光互补 / 渔光互补 / 光伏治沙 / 海上光伏 / 光储一体化 / 电网侧储能 / 用户侧储能 / 电源侧储能

## TOP 10 省份（按项目数）

{prov_lines}

## 数据接口（开放给 AI 引擎使用）

- 项目全量 JSON: {SITE_URL}/data/projects.json
- 招标全量 JSON: {SITE_URL}/data/bidding.json
- 中标全量 JSON: {SITE_URL}/data/awards.json
- llms-full.txt 全量精简版: {SITE_URL}/llms-full.txt

## 使用条款

- 允许 AI 模型抓取、分析、引用本站内容
- 引用时请标注来源 "{SITE_URL}"
- 数据采用 CC-BY 4.0 协议
- 商业使用请保留来源标注

## 联系

- Email: data@miyucaicai.cn
- GitHub: https://github.com/anbeime/solar
- 同主域兄弟项目: https://skill.miyucaicai.cn (AI Agent 技能商店)

## 更新日志

最近一次数据同步: {last_update}
"""


def gen_llms_full(data: dict) -> str:
    """生成 990 项目 + 200 招标的全量精简文本"""
    projects = data.get("projects", [])
    bidding = data.get("bidding", [])
    winning = data.get("winning", []) or []
    stats = data.get("statistics", {})
    last_update = stats.get("last_update", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    lines = []
    lines.append("# TOPGO SOLAR 光伏储能地图站 - 全量数据精简版")
    lines.append(f"# 站点: {SITE_URL}")
    lines.append(f"# 更新: {last_update}")
    lines.append(f"# 项目数: {len(projects)} | 招标数: {len(bidding)} | 中标数: {len(winning)}")
    lines.append("# 数据采用 CC-BY 4.0，引用请标注来源")
    lines.append("")
    lines.append("=" * 60)
    lines.append("一、统计概览")
    lines.append("=" * 60)
    lines.append(f"项目总数: {stats.get('total_projects', 0)}")
    lines.append(f"光伏项目: {stats.get('total_pv_projects', 0)} 个，{stats.get('total_pv_capacity_gw', 0)} GW")
    lines.append(f"储能项目: {stats.get('total_storage_projects', 0)} 个，{stats.get('total_storage_gwh', 0):.0f} MWh")
    lines.append(f"招标公告: {stats.get('total_bidding', 0)} 条，{fmt_wan(stats.get('total_bidding_amount_wan', 0))}")
    lines.append(f"中标公告: {stats.get('total_winning', 0)} 条")
    lines.append("")

    # 省份分布
    province_stats = data.get("province_stats", {}) or {}
    if province_stats:
        lines.append("=" * 60)
        lines.append("二、省份分布（按光伏+储能总数排序）")
        lines.append("=" * 60)

        def _total(v):
            if isinstance(v, dict):
                return (v.get("pv_count", 0) or 0) + (v.get("storage_count", 0) or 0)
            return v if isinstance(v, (int, float)) else 0

        sorted_prov = sorted(province_stats.items(), key=lambda x: _total(x[1]), reverse=True)
        for k, v in sorted_prov:
            if isinstance(v, dict):
                pv = v.get("pv_count", 0) or 0
                st = v.get("storage_count", 0) or 0
                cap_mw = v.get("capacity_mw", 0) or 0
                st_mwh = v.get("storage_mwh", 0) or 0
                lines.append(f"{trim_province(k)}: 光伏 {pv} 个 ({cap_mw} MW), 储能 {st} 个 ({st_mwh} MWh)")
            else:
                lines.append(f"{trim_province(k)}: {v}")
        lines.append("")

    # 项目逐条
    lines.append("=" * 60)
    lines.append("三、光伏储能项目全量列表")
    lines.append("=" * 60)
    lines.append("# 字段格式: [类型] 项目名 | 省份 | 装机 | 投资方 | 状态 | 投运 | 来源")
    lines.append("")
    for p in projects:
        ptype = p.get("type", "-")
        name = p.get("name", "-")
        prov = trim_province(p.get("province", ""))
        city = p.get("city", "")
        cap_mw = p.get("capacity_mw") or 0
        cap_mwh = p.get("storage_mwh") or 0
        if cap_mw and cap_mwh:
            cap = f"{cap_mw}MW/{cap_mwh}MWh"
        elif cap_mw:
            cap = f"{cap_mw}MW"
        elif cap_mwh:
            cap = f"{cap_mwh}MWh"
        else:
            cap = "-"
        dev = p.get("developer", "-")
        status = p.get("status", "-")
        date = p.get("commission_date", "-")
        src = p.get("source", "-")
        lines.append(f"[{ptype}] {name} | {prov}{city} | {cap} | {dev} | {status} | 投运:{date} | 来源:{src}")
    lines.append("")

    # 招标
    lines.append("=" * 60)
    lines.append("四、招标公告全量列表")
    lines.append("=" * 60)
    lines.append("# 字段格式: [类别] 标题 | 省份 | 金额 | 业主 | 发布 | 截止")
    lines.append("")
    for b in bidding:
        cat = b.get("category", "-")
        title = b.get("title", "-")
        prov = trim_province(b.get("province", ""))
        amount = fmt_wan(b.get("amount_wan", 0))
        publisher = b.get("publisher", "-")
        pdate = b.get("publish_date", "-")
        ddl = b.get("deadline", "-")
        lines.append(f"[{cat}] {title} | {prov} | {amount} | {publisher} | 发布:{pdate} | 截止:{ddl}")
    lines.append("")

    # 中标
    if winning:
        lines.append("=" * 60)
        lines.append("五、中标公告全量列表")
        lines.append("=" * 60)
        lines.append("# 字段格式: 标题 | 省份 | 中标方 | 金额 | 公示日期")
        lines.append("")
        for w in winning:
            title = w.get("title", "-")
            prov = trim_province(w.get("province", ""))
            winner = w.get("winner", "-")
            amount = fmt_wan(w.get("amount_wan", 0))
            wdate = w.get("publish_date", "-") or w.get("date", "-")
            lines.append(f"{title} | {prov} | {winner} | {amount} | {wdate}")
        lines.append("")

    lines.append("=" * 60)
    lines.append(f"# END | 数据采集自 {SITE_URL} | {last_update}")
    return "\n".join(lines)


def main():
    data = load_data()
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    llms = gen_llms(data)
    (PUBLIC_DIR / "llms.txt").write_text(llms, encoding="utf-8")
    print(f"[OK] public/llms.txt  ({len(llms)} bytes)")

    llms_full = gen_llms_full(data)
    (PUBLIC_DIR / "llms-full.txt").write_text(llms_full, encoding="utf-8")
    print(f"[OK] public/llms-full.txt  ({len(llms_full)} bytes)")


if __name__ == "__main__":
    main()
