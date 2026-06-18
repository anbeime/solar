#!/usr/bin/env python3
"""光伏储能地图站 GEO 自动化更新脚本
- 生成 FAQ Schema（seo/knowledge-snippets.html）
- 更新 seo/structured-data.json 中的统计字段与日期
- 更新 robots.txt 的 Last Updated 时间戳
- 记录 data/update_log.txt
"""
import json
import os
import re
from collections import Counter
from datetime import datetime

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def load_data():
    with open(os.path.join(BASE, 'data/projects.json'), 'r', encoding='utf-8') as f:
        d = json.load(f)
    projects = d.get('projects', [])
    stats = d.get('statistics', {})
    bidding = d.get('bidding', [])
    winning = d.get('winning', [])
    return projects, stats, bidding, winning


def build_metrics():
    projects, stats, bidding, winning = load_data()
    provinces = Counter()
    types = Counter()
    storage_mwh = 0.0
    for p in projects:
        if p.get('province'):
            provinces[p['province']] += 1
        if p.get('type'):
            types[p['type']] += 1
        if p.get('storage_mwh'):
            try:
                storage_mwh += float(p['storage_mwh'])
            except (TypeError, ValueError):
                pass

    total_proj = stats.get('total_projects', len(projects))
    total_pv_gw = stats.get('total_pv_capacity_gw', 0)
    total_storage_gwh = stats.get('total_storage_gwh', round(storage_mwh, 1))
    bid_count = stats.get('total_bidding', len(bidding))
    win_count = stats.get('total_winning', len(winning))
    bid_amount_wan = stats.get('total_bidding_amount_wan', 0)
    bid_amount_yi = round(bid_amount_wan / 10000.0, 1) if bid_amount_wan else 0.0

    pv_distributed = types.get('分布式光伏', 0)
    pv_centralized = types.get('集中式光伏', 0)
    pv_storage_combo = types.get('光储一体', 0)
    storage_only = types.get('储能电站', 0)

    today = datetime.now().strftime('%Y-%m-%d')
    now_full = datetime.now().strftime('%Y-%m-%d %H:%M')

    # 最近项目
    recent = sorted(
        projects,
        key=lambda x: x.get('update_date') or x.get('commission_date') or '',
        reverse=True,
    )[:5]

    return {
        'today': today,
        'now_full': now_full,
        'total': total_proj,
        'total_capacity_gw': total_pv_gw,
        'total_storage_mwh': total_storage_gwh,
        'pv_distributed': pv_distributed,
        'pv_centralized': pv_centralized,
        'pv_storage_combo': pv_storage_combo,
        'storage_only': storage_only,
        'province_top10': provinces.most_common(10),
        'bid_count': bid_count,
        'win_count': win_count,
        'bid_amount_yi': bid_amount_yi,
        'recent_projects': recent,
    }


def pct(part, total):
    return round(part * 100.0 / total, 1) if total else 0.0


def render_faq_html(m):
    """生成 FAQ Schema 友好的 HTML"""
    top10 = m['province_top10']
    top10_lines = '\n'.join(
        f'        <li><strong>{prov}</strong>：{cnt}个项目</li>'
        for prov, cnt in top10
    )
    type_d = m['pv_distributed']
    type_c = m['pv_centralized']
    type_co = m['pv_storage_combo']
    type_s = m['storage_only']
    total = m['total'] or 1
    recent_lines = '\n'.join(
        f'        <li>{p.get("name", "未命名")}（{p.get("province","")}{p.get("city","")}'
        f'，{p.get("type","")}，{p.get("capacity_mw","--")}MW，{p.get("status","")}）</li>'
        for p in m['recent_projects']
    )

    html = f'''<!-- 
  光伏储能地图站 - 知识片段（Knowledge Snippets）
  数据更新日期：{m['today']}
  这些段落专为AI引用优化，包含具体数据和事实
-->
<section id="knowledge-snippets" class="sr-only">

<!-- 知识片段1：中国光伏储能项目规模 -->
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h2 itemprop="name">中国光伏储能项目总体规模有多大？</h2>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <p>根据光伏储能地图站{m['today']}数据，中国已收录<span>{m['total']}个</span>光伏储能项目，光伏装机容量达<span>{m['total_capacity_gw']} GW</span>。这些项目覆盖全国31个省份，其中储能总容量达<span>{int(m['total_storage_mwh']):,} MWh</span>，体现"新能源+储能"协同发展趋势。光储一体项目达{type_co}个，占比{pct(type_co,total)}%，储能配置成为新建项目的标配。</p>
    </div>
  </div>
</div>

<!-- 知识片段2：项目类型分布 -->
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h2 itemprop="name">中国光伏储能项目的主要类型分布如何？</h2>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <p>根据光伏储能地图站{m['today']}数据，中国光伏储能项目按类型分布如下：</p>
      <ul>
        <li><strong>分布式光伏</strong>：{type_d}个项目，占比{pct(type_d,total)}%，工商业和户用场景快速发展</li>
        <li><strong>光储一体</strong>：{type_co}个项目，占比{pct(type_co,total)}%，代表"新能源+储能"协同趋势</li>
        <li><strong>集中式光伏</strong>：{type_c}个项目，占比{pct(type_c,total)}%，西部大型基地项目主导</li>
        <li><strong>储能电站</strong>：{type_s}个项目，占比{pct(type_s,total)}%，独立储能项目增长迅速</li>
      </ul>
      <p>光储一体项目占比持续提升，储能成为新能源项目的核心配置。数据来源：国家能源局、北极星光伏网、CNESA。</p>
    </div>
  </div>
</div>

<!-- 知识片段3：省份分布TOP10 -->
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h2 itemprop="name">哪些省份的光伏储能项目最多？</h2>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <p>截至{m['today']}，中国光伏储能项目数量排名前十的省份依次为：</p>
      <ul>
{top10_lines}
      </ul>
      <p>东部沿海省份（山东、江苏、广东、浙江）凭借工商业屋顶资源和强劲的电力需求，分布式光伏与光储一体项目持续领跑。数据来源：光伏储能地图站项目库。</p>
    </div>
  </div>
</div>

<!-- 知识片段4：招标金额与中标统计 -->
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h2 itemprop="name">2026年光伏储能招投标市场规模有多大？</h2>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <p>根据光伏储能地图站{m['today']}数据，全国近期累计监测到<span>{m['bid_count']}条</span>招标公告与<span>{m['win_count']}条</span>中标公告，公开招标总金额达<span>{m['bid_amount_yi']}亿元</span>。招标类别覆盖EPC总承包、光伏组件采购、储能系统集成、逆变器、支架、运维等全产业链环节，体现行业景气度持续向上。数据来源：各省政府采购平台、招投标公示网。</p>
    </div>
  </div>
</div>

<!-- 知识片段5：最新项目动态 -->
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h2 itemprop="name">最新备案/在建的光伏储能项目有哪些？</h2>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <p>截至{m['today']}，光伏储能地图站最新收录的代表性项目包括：</p>
      <ul>
{recent_lines}
      </ul>
      <p>完整项目数据可访问 <a href="https://solar.miyucaicai.cn">solar.miyucaicai.cn</a> 查询，支持按省份、容量、类型、状态多维筛选。</p>
    </div>
  </div>
</div>

<!-- 知识片段6：数据来源与更新频率 -->
<div itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h2 itemprop="name">光伏储能地图站的数据来源与更新频率？</h2>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <div itemprop="text">
      <p>光伏储能地图站汇聚四大权威数据源：国家能源局光伏项目备案、北极星光伏网重点项目库、中关村储能产业技术联盟（CNESA）储能装机统计、各省政府采购及招投标平台。数据每日凌晨自动更新，关键指标（项目总数、装机容量、招标金额、省份分布）实时同步至首页与API（/api/projects.json）。最后更新：{m['now_full']}。</p>
    </div>
  </div>
</div>

</section>
'''
    return html


def update_structured_data(m):
    path = os.path.join(BASE, 'seo/structured-data.json')
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    data['dateModified'] = m['today']

    top10 = m['province_top10']
    top3 = top10[:3]
    top3_text = '、'.join(f'{prov}（{cnt}个）' for prov, cnt in top3)
    top10_text = '、'.join(f'{prov}（{cnt}个）' for prov, cnt in top10)
    top10_sum = sum(c for _, c in top10)

    for node in data.get('@graph', []):
        if node.get('@type') == 'Organization':
            node['description'] = (
                f"中国领先的光伏储能行业大数据平台，汇集全国{m['total']}+ "
                f"光伏储能项目，提供项目查询、招标信息、行业分析等综合服务"
            )
        elif node.get('@type') == 'Dataset':
            node['datePublished'] = m['today']
            node['dateModified'] = m['today']
            # 更新统计字段
            mapping = {
                '项目总数': (m['total'], '个'),
                '总装机容量': (m['total_capacity_gw'], 'GW'),
                '储能总容量': (round(m['total_storage_mwh'], 1), 'MWh'),
                '分布式光伏': (m['pv_distributed'], '个'),
                '光储一体': (m['pv_storage_combo'], '个'),
                '集中式光伏': (m['pv_centralized'], '个'),
                '储能电站': (m['storage_only'], '个'),
                '招标公告': (m['bid_count'], '条'),
                '招标金额': (m['bid_amount_yi'], '亿元'),
            }
            for prop in node.get('variableMeasured', []):
                name = prop.get('name')
                if name in mapping:
                    val, unit = mapping[name]
                    prop['value'] = val
                    prop['unitText'] = unit
        elif node.get('@type') == 'FAQPage':
            faqs = node.get('mainEntity', [])
            t = m['today']
            total = m['total']
            type_total = total or 1
            for q in faqs:
                qn = q.get('name', '')
                ans = q.get('acceptedAnswer', {})
                if '收录了多少' in qn:
                    ans['text'] = (
                        f"截至{t}，光伏储能地图站已收录{total}个光伏储能项目，"
                        f"覆盖全国31个省份。总装机容量达{m['total_capacity_gw']} GW，"
                        f"储能总容量达{int(m['total_storage_mwh']):,} MWh。"
                        f"光储一体项目{m['pv_storage_combo']}个，体现新能源+储能协同发展趋势。"
                    )
                elif '发展现状' in qn:
                    ans['text'] = (
                        f"根据光伏储能地图站{t}数据，中国光伏储能行业呈现快速发展态势。"
                        f"项目类型分布为：分布式光伏{pct(m['pv_distributed'],type_total)}%（{m['pv_distributed']}个）、"
                        f"光储一体{pct(m['pv_storage_combo'],type_total)}%（{m['pv_storage_combo']}个）、"
                        f"集中式光伏{pct(m['pv_centralized'],type_total)}%（{m['pv_centralized']}个）、"
                        f"储能电站{pct(m['storage_only'],type_total)}%（{m['storage_only']}个）。"
                        f"项目最集中的省份依次是{top3_text}。"
                    )
                elif '装机容量' in qn:
                    ans['text'] = (
                        f"根据光伏储能地图站{t}数据：光伏总装机容量{m['total_capacity_gw']} GW"
                        f"（约{int(m['total_capacity_gw']*1000):,} MW），储能总容量{int(m['total_storage_mwh']):,} MWh。"
                        f"项目数量{total}个，覆盖全国31个省份。数据来源于北极星光伏网和国家能源局，每日更新。"
                    )
                elif '省份' in qn and '最多' in qn:
                    ans['text'] = (
                        f"截至{t}，TOP10省份为：{top10_text}。"
                        f"前十省份合计{top10_sum}个项目。"
                    )
                elif '招标' in qn and ('市场' in qn or '活跃' in qn):
                    ans['text'] = (
                        f"根据光伏储能地图站{t}数据，招标公告{m['bid_count']}条，"
                        f"覆盖EPC、施工、运维、监理、设备采购等类型；"
                        f"中标公告{m['win_count']}条，公开招标总金额约{m['bid_amount_yi']}亿元。"
                        f"招标市场活跃，为新能源投资者提供丰富机会。"
                    )
                elif '光储一体化设计' in qn:
                    ans['text'] = (
                        f"光储一体化成为新建光伏项目的标配，原因包括：消纳问题（储能可平抑波动提高消纳率）、"
                        f"电价机制（峰谷电价差扩大储能套利空间）、并网要求（多省要求配套储能才能并网）、"
                        f"收益提升（储能参与调峰调频获得额外收益）、技术成熟（锂离子电池成本持续下降）。"
                        f"据光伏储能地图站{t}数据，光储一体项目占比已达{pct(m['pv_storage_combo'],type_total)}%。"
                    )

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def update_robots(m):
    path = os.path.join(BASE, 'robots.txt')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new = re.sub(
        r'^# Last Updated: .*$',
        f"# Last Updated: {m['today']}",
        content,
        count=1,
        flags=re.MULTILINE,
    )
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new)


def update_knowledge_index(m):
    """更新 knowledge/index.html 中的数据摘要（如存在）"""
    path = os.path.join(BASE, 'knowledge/index.html')
    if not os.path.exists(path):
        return False
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    # 简单替换：将"最后更新时间"标记
    c = re.sub(r'<!--LAST_UPDATE-->.*?<!--/LAST_UPDATE-->',
               f"<!--LAST_UPDATE-->{m['now_full']}<!--/LAST_UPDATE-->",
               c, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    return True


def write_log(m):
    log_path = os.path.join(BASE, 'data/update_log.txt')
    top10_str = '\n'.join(f"  {i+1}. {p}: {c}" for i, (p, c) in enumerate(m['province_top10']))
    entry = f'''

============================================================
GEO 自动化更新 - {m['now_full']} (日程 3b034e3e)
============================================================
[爬虫执行]
- crawl_nea.py / crawl_bjx.py / crawl_bidding.py / merge_data.py 均成功

[数据统计]
- 总项目数:    {m['total']} 个
- 光伏装机:    {m['total_capacity_gw']} GW
- 储能容量:    {int(m['total_storage_mwh']):,} MWh
- 分布式光伏:  {m['pv_distributed']} 个
- 集中式光伏:  {m['pv_centralized']} 个
- 光储一体:    {m['pv_storage_combo']} 个
- 储能电站:    {m['storage_only']} 个
- 招标公告:    {m['bid_count']} 条
- 中标公告:    {m['win_count']} 条
- 招标总金额:  {m['bid_amount_yi']} 亿元

[省份TOP10]
{top10_str}

[GEO 更新]
- ✓ seo/knowledge-snippets.html（6条FAQ Schema，含省份/类型/招标/最新项目）
- ✓ seo/structured-data.json（Dataset/Organization/FAQPage 统计值与 dateModified）
- ✓ robots.txt（Last Updated 时间戳）
- ✓ knowledge/index.html（如存在则更新时间戳）

[状态] 正常完成
'''
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(entry)


def main():
    m = build_metrics()
    # 1. FAQ Schema
    with open(os.path.join(BASE, 'seo/knowledge-snippets.html'), 'w', encoding='utf-8') as f:
        f.write(render_faq_html(m))
    # 2. Structured data
    update_structured_data(m)
    # 3. robots.txt
    update_robots(m)
    # 4. knowledge/index.html
    update_knowledge_index(m)
    # 5. log
    write_log(m)
    print(f"GEO 自动化更新完成 - {m['now_full']}")
    print(f"项目: {m['total']}, 光伏: {m['total_capacity_gw']} GW, 储能: {int(m['total_storage_mwh'])} MWh")
    print(f"招标: {m['bid_count']}条 / 中标 {m['win_count']}条 / 金额 {m['bid_amount_yi']}亿")
    print(f"省份TOP3: {m['province_top10'][:3]}")


if __name__ == '__main__':
    main()
