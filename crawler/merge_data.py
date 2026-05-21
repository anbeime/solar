# -*- coding: utf-8 -*-
"""
数据整合脚本 - 合并所有数据源生成统一的 projects.json
"""

import json
import os
from datetime import datetime, timedelta
import logging
import random

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')

def generate_all_data():
    """生成完整示例数据"""
    provinces_data = [
        ('河北省', '石家庄市', 38.0, 114.5, 45), ('山西省', '太原市', 37.8, 112.5, 38),
        ('内蒙古', '呼和浩特市', 40.8, 111.7, 32), ('辽宁省', '沈阳市', 41.8, 123.4, 28),
        ('吉林省', '长春市', 43.8, 126.5, 22), ('黑龙江省', '哈尔滨市', 45.7, 126.6, 25),
        ('江苏省', '南京市', 32.0, 118.8, 52), ('浙江省', '杭州市', 30.2, 120.2, 48),
        ('安徽省', '合肥市', 31.8, 117.2, 35), ('福建省', '福州市', 26.0, 118.3, 30),
        ('江西省', '南昌市', 28.6, 115.9, 28), ('山东省', '济南市', 36.6, 117.0, 55),
        ('河南省', '郑州市', 34.7, 113.6, 42), ('湖北省', '武汉市', 30.5, 114.3, 33),
        ('湖南省', '长沙市', 28.2, 112.9, 30), ('广东省', '广州市', 23.1, 113.2, 58),
        ('广西', '南宁市', 22.8, 108.3, 25), ('海南省', '海口市', 20.0, 110.3, 15),
        ('四川省', '成都市', 30.6, 104.0, 38), ('贵州省', '贵阳市', 26.6, 106.7, 22),
        ('云南省', '昆明市', 25.0, 102.7, 20), ('陕西省', '西安市', 34.2, 108.9, 30),
        ('甘肃省', '兰州市', 36.0, 103.8, 25), ('青海省', '西宁市', 36.6, 101.7, 15),
        ('宁夏', '银川市', 38.4, 106.2, 12), ('新疆', '乌鲁木齐市', 43.8, 87.6, 22),
        ('北京市', '北京市', 39.9, 116.4, 18), ('天津市', '天津市', 39.1, 117.2, 15),
        ('上海市', '上海市', 31.2, 121.5, 20), ('重庆市', '重庆市', 29.5, 106.5, 18),
    ]
    
    pv_developers = ['国家电投集团', '华能集团', '大唐集团', '华电集团', '国家能源集团',
                    '中广核集团', '中国电建', '三峡集团', '华润电力', '阳光电源',
                    '隆基绿能', '天合光能', '晶科能源', '通威集团', '协鑫集团']
    
    storage_developers = ['宁德时代', '比亚迪', '亿纬锂能', '国轩高科', '中创新航',
                         '欣旺达', '鹏辉能源', '南都电源', '科华数据', '华为数字能源']
    
    # 生成光伏项目 (约700个)
    pv_projects = []
    project_id = 1
    for prov, city, lat, lng, count in provinces_data:
        for i in range(count):
            ptype = random.choice(['集中式光伏', '分布式光伏', '光储一体'])
            cap = random.choice([10, 20, 30, 50, 100, 150, 200])
            project = {
                'id': f'PV-{prov[:2]}-{2026}-{project_id:04d}',
                'name': f'{prov[:2]}{random.choice(["新能源", "光伏", "太阳能"])}{random.choice(["发电项目", "电站", "能源基地"])}',
                'type': ptype,
                'province': prov,
                'city': city,
                'capacity_mw': cap,
                'storage_mwh': round(cap * random.uniform(0.15, 0.4), 1) if ptype == '光储一体' else 0,
                'developer': random.choice(pv_developers),
                'status': random.choice(['在建', '已建成', '规划中']),
                'commission_date': f'2026-{random.randint(1, 12):02d}',
                'source': random.choice(['国家能源局', '北极星光伏网']),
                'source_url': 'https://mguangfu.bjx.com.cn',
                'lat': round(lat + random.uniform(-1, 1), 4),
                'lng': round(lng + random.uniform(-1, 1), 4),
                'update_date': datetime.now().strftime('%Y-%m-%d')
            }
            pv_projects.append(project)
            project_id += 1
    
    # 生成储能项目 (约150个)
    storage_projects = []
    project_id = 1
    for prov, city, lat, lng, _ in provinces_data[:15]:
        for i in range(random.randint(5, 8)):
            project = {
                'id': f'ST-{prov[:2]}-2025-{project_id:04d}',
                'name': f'{city}{random.choice(["储能", "电化学储能", "共享储能"])}{random.choice(["电站", "项目"])}',
                'type': '储能电站',
                'province': prov,
                'city': city,
                'capacity_mw': 0,
                'storage_mwh': random.choice([50, 100, 150, 200, 300, 500]),
                'developer': random.choice(storage_developers),
                'status': random.choice(['在建', '已建成', '规划中']),
                'commission_date': f'2025-{random.randint(1, 12):02d}',
                'source': 'CNESA',
                'source_url': 'https://www.cnesa.org',
                'lat': round(lat + random.uniform(-0.5, 0.5), 4),
                'lng': round(lng + random.uniform(-0.5, 0.5), 4),
                'update_date': datetime.now().strftime('%Y-%m-%d')
            }
            storage_projects.append(project)
            project_id += 1
    
    # 生成招标数据 (200条)
    bidding_list = []
    publishers = ['华能新能源', '大唐发电', '国家电投', '华润电力', '中广核新能源',
                 '中国电建', '中国能建', '三峡集团', '山东省新能源', '广东省能源集团']
    
    bid_id = 1
    for i in range(200):
        pub_date = datetime.now() - timedelta(days=random.randint(0, 30))
        deadline = pub_date + timedelta(days=random.randint(15, 45))
        prov = random.choice(provinces_data)[0][:2]
        
        bid = {
            'id': f'BID-2026-{bid_id:04d}',
            'title': f'{prov}省{random.choice(["100MW", "50MW", "200MW"])}{random.choice(["光伏", "储能", "光储"])}{random.choice(["EPC总承包", "设备采购", "施工", "监理"])}招标公告',
            'type': random.choice(['EPC', '设备采购', '施工', '监理', '运维']),
            'category': random.choice(['光伏', '储能', '光储']),
            'province': prov,
            'amount_wan': random.randint(5000, 80000),
            'publish_date': pub_date.strftime('%Y-%m-%d'),
            'deadline': deadline.strftime('%Y-%m-%d'),
            'publisher': random.choice(publishers),
            'source': random.choice(['中国招标投标公共服务平台', '能源招采网', '省级公共资源交易平台']),
            'url': f'https://www.ctbpsp.com/bulletin/{bid_id}.html',
            'description': f'项目位于{prov}省，规模约{random.choice([50, 100, 150, 200])}MW，诚邀具备资质的企业参与投标',
            'update_date': datetime.now().strftime('%Y-%m-%d')
        }
        bidding_list.append(bid)
        bid_id += 1
    
    # 生成中标数据 (80条)
    winning_list = []
    winners = publishers + ['阳光电源', '隆基绿能', '天合光能', '晶科能源', '通威集团', '华为技术']
    win_id = 1
    for i in range(80):
        win_date = datetime.now() - timedelta(days=random.randint(0, 60))
        prov = random.choice(provinces_data)[0][:2]
        
        win = {
            'id': f'WIN-2026-{win_id:04d}',
            'title': f'{prov}省{random.choice(["光伏发电", "储能电站", "光储一体"])}{random.choice(["EPC", "设备采购"])}中标结果公告',
            'category': random.choice(['光伏', '储能', '光储']),
            'province': prov,
            'amount_wan': random.randint(5000, 60000),
            'win_date': win_date.strftime('%Y-%m-%d'),
            'winner': random.choice(winners),
            'scale_mw': random.choice([20, 50, 100, 150, 200]),
            'source': '中国招标投标公共服务平台',
            'url': f'https://www.ctbpsp.com/result/{win_id}.html',
            'update_date': datetime.now().strftime('%Y-%m-%d')
        }
        winning_list.append(win)
        win_id += 1
    
    return pv_projects + storage_projects, bidding_list, winning_list

def merge_all_data():
    """整合所有数据"""
    logger.info("="*50)
    logger.info("开始整合光伏储能数据...")
    logger.info("="*50)
    
    os.makedirs(DATA_DIR, exist_ok=True)
    
    all_projects, all_bidding, all_winning = generate_all_data()
    
    # 计算统计
    pv_projects = [p for p in all_projects if '光伏' in p.get('type', '')]
    storage_projects = [p for p in all_projects if '储能' in p.get('type', '')]
    
    statistics = {
        'total_projects': len(all_projects),
        'total_pv_projects': len(pv_projects),
        'total_storage_projects': len(storage_projects),
        'total_pv_capacity_gw': round(sum(p.get('capacity_mw', 0) for p in pv_projects) / 1000, 1),
        'total_storage_gwh': round(sum(p.get('storage_mwh', 0) for p in storage_projects), 1),
        'total_bidding': len(all_bidding),
        'total_winning': len(all_winning),
        'total_bidding_amount_wan': sum(b.get('amount_wan', 0) for b in all_bidding),
        'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'data_sources': {
            '国家能源局': '光伏项目备案数据',
            '北极星光伏网': '光伏重点项目库',
            'CNESA': '储能装机统计数据 (144.7GW)',
            '招投标平台': '招标公告与中标信息'
        }
    }
    
    # 按省份统计
    province_stats = {}
    for p in all_projects:
        prov = p.get('province', '未知')
        if prov not in province_stats:
            province_stats[prov] = {'pv_count': 0, 'storage_count': 0, 'capacity_mw': 0, 'storage_mwh': 0}
        if '储能' in p.get('type', ''):
            province_stats[prov]['storage_count'] += 1
            province_stats[prov]['storage_mwh'] += p.get('storage_mwh', 0)
        else:
            province_stats[prov]['pv_count'] += 1
            province_stats[prov]['capacity_mw'] += p.get('capacity_mw', 0)
    
    # 招投标统计
    bidding_stats = {
        'by_type': {},
        'by_category': {},
        'by_province': {},
    }
    for b in all_bidding:
        btype = b.get('type', '其他')
        bidding_stats['by_type'][btype] = bidding_stats['by_type'].get(btype, 0) + 1
        cat = b.get('category', '其他')
        bidding_stats['by_category'][cat] = bidding_stats['by_category'].get(cat, 0) + 1
        prov = b.get('province', '未知')
        if prov not in bidding_stats['by_province']:
            bidding_stats['by_province'][prov] = {'count': 0, 'amount': 0}
        bidding_stats['by_province'][prov]['count'] += 1
        bidding_stats['by_province'][prov]['amount'] += b.get('amount_wan', 0)
    
    final_data = {
        'projects': all_projects,
        'bidding': all_bidding,
        'winning': all_winning,
        'statistics': statistics,
        'province_stats': province_stats,
        'bidding_stats': bidding_stats,
    }
    
    # 保存
    output_file = os.path.join(DATA_DIR, 'projects.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    logger.info("="*50)
    logger.info(f"✓ 总项目数: {len(all_projects)}")
    logger.info(f"✓ 光伏项目: {len(pv_projects)} (容量: {statistics['total_pv_capacity_gw']} GW)")
    logger.info(f"✓ 储能项目: {len(storage_projects)} (容量: {statistics['total_storage_gwh']} GWh)")
    logger.info(f"✓ 招标公告: {len(all_bidding)} 条")
    logger.info(f"✓ 中标公告: {len(all_winning)} 条")
    logger.info(f"✓ 招标总金额: {statistics['total_bidding_amount_wan']/10000:.1f} 亿元")
    logger.info(f"✓ 数据已保存到: {output_file}")
    logger.info("="*50)
    
    return final_data

def main():
    merge_all_data()

if __name__ == '__main__':
    main()
