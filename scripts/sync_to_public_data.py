"""
sync_to_public_data.py
-----------------------
把 data/ 下的爬虫数据同步到 public/data/，并做字段格式转换以匹配前端 Project 接口。

为什么需要这个脚本？
- 前端 use-data.ts 用 fetch('/data/projects.json')，Next.js 会从 public/data/ 提供静态资源
- 爬虫脚本只更新 data/，不会自动同步到 public/data/，会导致线上看到旧的 mock 数据
- 字段 schema 不一致：本地 capacity_mw/source_url/lat 需转成前端期望的 capacity/sourceUrl/latitude

每次 GEO 自动化日程跑完爬虫后，必须调用本脚本：
    python3 scripts/sync_to_public_data.py
"""
import json
import os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TYPE_MAP = {
    '光储一体': '光伏',
    '集中式光伏': '光伏',
    '分布式光伏': '光伏',
    '储能电站': '储能',
}


def interleave_by_province(projects):
    """省份轮转交错排序：避免按省份连续生成的数据在前端扎堆。
    每个省份取一条轮询入列，同省内保持原顺序（update_date 新的在前由上游保证）。"""
    from collections import OrderedDict, Counter
    prov_count = Counter(p.get('province') or '未知' for p in projects)
    # 按省份项目数降序排桶（装机大省打头），再轮转交错，避免单一省份扎堆
    order = [prov for prov, _ in prov_count.most_common()]
    buckets = OrderedDict((prov, []) for prov in order)
    for p in projects:
        buckets[p.get('province') or '未知'].append(p)
    result = []
    while any(buckets.values()):
        for prov in list(buckets.keys()):
            if buckets[prov]:
                result.append(buckets[prov].pop(0))
    return result



def trim_province(p: str) -> str:
    if not p:
        return ''
    return (p.replace('省', '').replace('市', '')
             .replace('自治区', '').replace('维吾尔', '')
             .replace('回族', '').replace('壮族', '')
             .replace('特别行政区', ''))


def convert_projects(raw_projects):
    out = []
    for p in raw_projects:
        cap_mw = p.get('capacity_mw', 0) or 0
        sto = p.get('storage_mwh', 0) or 0
        if cap_mw and sto:
            cap_text = f"{cap_mw}MW/{sto}MWh"
        elif cap_mw:
            cap_text = f"{cap_mw}MW"
        elif sto:
            cap_text = f"{sto}MWh"
        else:
            cap_text = ''
        out.append({
            'id': p['id'],
            'name': p.get('name', ''),
            'type': TYPE_MAP.get(p.get('type', ''), '光伏'),
            'province': trim_province(p.get('province', '')),
            'capacity': cap_text,
            'amount': '',
            'company': p.get('developer', ''),
            'summary': (
                f"{p.get('developer','')}投资{p.get('city','')}{p.get('type','')}项目，"
                f"装机{cap_text}，{p.get('status','')}，预计{p.get('commission_date','')}投运。"
            ),
            'date': p.get('update_date', ''),
            'sourceUrl': p.get('source_url', ''),
            'sourceName': p.get('source', '北极星光伏网'),
            'latitude': p.get('lat'),
            'longitude': p.get('lng'),
            'status': p.get('status', ''),
            'commissionDate': p.get('commission_date', ''),
        })
    return out


def convert_bidding(raw_bid):
    out = []
    for b in raw_bid:
        amount = b.get('amount_text', '')
        if not amount and b.get('amount'):
            amount = f"{b['amount']}万"
        out.append({
            'id': b.get('id', ''),
            'projectName': b.get('project_name', ''),
            'type': b.get('type', ''),
            'amount': amount,
            'province': trim_province(b.get('province', '')),
            'publishTime': b.get('publish_time', ''),
            'deadline': b.get('deadline', ''),
            'tenderUnit': b.get('tender_unit', ''),
            'sourceUrl': b.get('source_url', ''),
        })
    return out


def main():
    # === projects.json ===
    src = os.path.join(ROOT, 'data', 'projects.json')
    with open(src, 'r', encoding='utf-8') as f:
        raw = json.load(f)
    raw_projects = raw['projects'] if isinstance(raw, dict) else raw
    projects = interleave_by_province(convert_projects(raw_projects))
    dst_p = os.path.join(ROOT, 'public', 'data', 'projects.json')
    with open(dst_p, 'w', encoding='utf-8') as f:
        json.dump(projects, f, ensure_ascii=False, separators=(',', ':'))

    # === bidding.json ===
    src_b = os.path.join(ROOT, 'data', 'bidding.json')
    with open(src_b, 'r', encoding='utf-8') as f:
        raw_bid = json.load(f)
    if isinstance(raw_bid, dict):
        raw_bid = raw_bid.get('bidding', []) or raw_bid.get('items', [])
    bidding = convert_bidding(raw_bid)
    dst_b = os.path.join(ROOT, 'public', 'data', 'bidding.json')
    with open(dst_b, 'w', encoding='utf-8') as f:
        json.dump(bidding, f, ensure_ascii=False, separators=(',', ':'))

    # awards.json 暂用空数组占位
    dst_a = os.path.join(ROOT, 'public', 'data', 'awards.json')
    if not os.path.exists(dst_a) or os.path.getsize(dst_a) < 3:
        with open(dst_a, 'w', encoding='utf-8') as f:
            f.write('[]')

    # 输出报告
    type_dist = Counter(p['type'] for p in projects)
    prov_top = Counter(p['province'] for p in projects).most_common(5)
    print(f"[sync] projects.json: {len(projects)} 条 ({dict(type_dist)})")
    print(f"[sync] bidding.json:  {len(bidding)} 条")
    print(f"[sync] 省份TOP5: {prov_top}")
    print(f"[sync] 已写入 public/data/")

    # 自动生成 GEO 资源（llms.txt / llms-full.txt）
    try:
        import subprocess, sys
        gen_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gen_geo_assets.py')
        if os.path.exists(gen_script):
            print(f"[sync] 自动调用 gen_geo_assets.py 生成 GEO 资源...")
            r = subprocess.run([sys.executable, gen_script], capture_output=True, text=True, timeout=60)
            if r.returncode == 0:
                print(r.stdout.strip())
            else:
                print(f"[sync] WARN gen_geo_assets 退出码 {r.returncode}: {r.stderr.strip()}")
    except Exception as e:
        print(f"[sync] WARN gen_geo_assets 调用失败: {e}")


if __name__ == '__main__':
    main()
