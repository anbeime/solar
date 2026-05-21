#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
充电桩数据采集器
采集全国30个城市的充电站数据
数据来源: 模拟数据生成 (基于真实城市坐标分布)
"""

import json
import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

# 城市配置: (城市名, 省份, 中心经度, 中心纬度, 城市半径km)
CITIES_CONFIG = [
    ("广州", "广东", 113.2644, 23.1291, 25),
    ("深圳", "广东", 114.0579, 22.5431, 20),
    ("上海", "上海", 121.4737, 31.2304, 30),
    ("北京", "北京", 116.4074, 39.9042, 35),
    ("杭州", "浙江", 120.1551, 30.2741, 20),
    ("成都", "四川", 104.0665, 30.5728, 25),
    ("武汉", "湖北", 114.3055, 30.5928, 22),
    ("西安", "陕西", 108.9402, 34.3416, 20),
    ("南京", "江苏", 118.7969, 32.0603, 18),
    ("苏州", "江苏", 120.5853, 31.2989, 20),
    ("东莞", "广东", 113.7518, 23.0205, 18),
    ("佛山", "广东", 113.1227, 23.0215, 15),
    ("珠海", "广东", 113.5539, 22.2559, 12),
    ("中山", "广东", 113.3826, 22.5176, 12),
    ("惠州", "广东", 114.4165, 23.1115, 15),
    ("长沙", "湖南", 112.9388, 28.2282, 18),
    ("郑州", "河南", 113.6500, 34.7566, 20),
    ("合肥", "安徽", 117.2830, 31.8612, 18),
    ("济南", "山东", 116.9941, 36.6653, 18),
    ("青岛", "山东", 120.3826, 36.0671, 22),
    ("大连", "辽宁", 121.6147, 38.9140, 18),
    ("沈阳", "辽宁", 123.4315, 41.8057, 20),
    ("天津", "天津", 117.3616, 39.3434, 25),
    ("重庆", "重庆", 106.5516, 29.5630, 30),
    ("昆明", "云南", 102.7129, 25.0406, 18),
    ("贵阳", "贵州", 106.6302, 26.6470, 15),
    ("南昌", "江西", 115.8581, 28.6829, 15),
    ("福州", "福建", 119.2965, 26.0745, 15),
    ("厦门", "福建", 118.0894, 24.4798, 12),
]

# 运营商列表
OPERATORS = [
    "特来电", "星星充电", "国家电网", "南方电网", "小桔充电", 
    "云快充", "万马爱充", "汇充电", "闪充", "普天新能源",
    "依威能源", "智充科技", "地上铁", "新电途", "小蓝充电"
]

# 充电桩品牌
CHARGER_BRANDS = [
    "特来电", "星星充电", "国家电网", "ABB", "特斯拉", 
    "华为", "比亚迪", "蔚来", "小鹏", "公牛",
    "挚达", "普天", "华丰", "英飞源", "盛弘电气"
]

# 充电站类型
STATION_TYPES = [
    "公共充电站", "专用充电站", "公交充电站", "物流充电站",
    "停车场充电站", "商超充电站", "社区充电站", "高速服务区充电站"
]

# 场站名称关键词
STATION_KEYWORDS = [
    "充电中心", "充电站", "充电桩", "充换电站", "新能源中心",
    "电动汽车充电", "快充站", "慢充站", "综合能源站", "光储充一体站"
]

# 停车场景
PARKING_SCENARIOS = [
    "停车场", "地下车库", "地面停车场", "商超停车场", "写字楼",
    "小区", "公园", "医院", "学校", "酒店", "体育馆", "地铁站"
]


def km_to_degrees(km: float, is_lng: bool = True) -> float:
    """将公里转换为经纬度度数"""
    if is_lng:
        # 经度: 1度约111km * cos(纬度)
        return km / 111.0 / math.cos(math.radians(30))
    else:
        # 纬度: 1度约111km
        return km / 111.0


def generate_location(center_lng: float, center_lat: float, radius_km: float) -> Tuple[float, float]:
    """在给定中心点周围生成随机位置"""
    # 生成随机角度
    angle = random.uniform(0, 2 * math.pi)
    # 生成随机距离 (使用指数分布使位置更集中在中心)
    distance = random.expovariate(1 / (radius_km / 2)) if radius_km > 5 else random.uniform(0, radius_km)
    distance = min(distance, radius_km)
    
    # 计算偏移量
    dlat = km_to_degrees(distance * math.sin(angle), is_lng=False)
    dlng = km_to_degrees(distance * math.cos(angle), is_lng=True)
    
    return center_lng + dlng, center_lat + dlat


def generate_station_id(city: str, index: int) -> str:
    """生成场站ID"""
    return f"CS{city[:2].upper()}{datetime.now().year}{str(index).zfill(6)}"


def generate_charger_id(station_id: str, index: int) -> str:
    """生成充电桩ID"""
    return f"{station_id}P{str(index).zfill(3)}"


def random_date(start_days_ago: int = 730, end_days_ago: int = 0) -> str:
    """生成随机日期"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=start_days_ago)
    random_days = random.randint(0, (end_date - start_date).days)
    random_date = start_date + timedelta(days=random_days)
    return random_date.strftime("%Y-%m-%d")


def generate_station_name(city: str) -> str:
    """生成场站名称"""
    keyword = random.choice(STATION_KEYWORDS)
    scenario = random.choice(PARKING_SCENARIOS)
    
    patterns = [
        f"{city}{scenario}{keyword}",
        f"{city}{keyword}",
        f"{city}XX{keyword}",
        f"{city}{random.choice(['新', '老', '大', '小', ''])}{scenario}{keyword}",
        f"{city}XX{sample(STATION_KEYWORDS, 1)[0]}",
    ]
    return random.choice(patterns)


def sample(population: list, k: int) -> list:
    """随机抽样 (不放回)"""
    return random.sample(population, k)


def generate_chargers_per_station() -> Dict:
    """生成每个场站的充电桩配置"""
    # 慢充桩数量 (7kW-22kW)
    slow_count = random.randint(2, 20)
    # 快充桩数量 (30kW-180kW)
    fast_count = random.randint(2, 10)
    # 超快充桩数量 (200kW+)
    ultra_count = random.randint(0, 2) if random.random() > 0.6 else 0
    
    return {
        "slow": slow_count,
        "fast": fast_count,
        "ultra": ultra_count,
        "total": slow_count + fast_count + ultra_count
    }


def generate_station_capacity(charger_config: Dict) -> float:
    """计算场站总功率"""
    slow_power = random.choice([7, 11, 14, 22])  # kW
    fast_power = random.choice([30, 60, 90, 120, 180])  # kW
    ultra_power = random.choice([200, 250, 360, 500])  # kW
    
    total = (charger_config["slow"] * slow_power + 
             charger_config["fast"] * fast_power + 
             charger_config["ultra"] * ultra_power)
    return round(total / 1000, 2)  # 转换为MW


def generate_price() -> Dict:
    """生成电价信息"""
    # 尖时段
    peak_price = round(random.uniform(0.8, 1.5), 2)
    # 平时段
    flat_price = round(peak_price * random.uniform(0.7, 0.9), 2)
    # 谷时段
    valley_price = round(peak_price * random.uniform(0.3, 0.5), 2)
    # 服务费
    service_fee = round(random.uniform(0.3, 0.8), 2)
    
    return {
        "peak": peak_price,
        "flat": flat_price,
        "valley": valley_price,
        "service_fee": service_fee,
        "unit": "元/kWh"
    }


def generate_rating() -> float:
    """生成评分 (4.0-5.0)"""
    base = random.uniform(4.0, 4.5)
    # 添加一些高分评价
    if random.random() > 0.7:
        base = random.uniform(4.5, 5.0)
    return round(base, 1)


def generate_status() -> str:
    """生成场站状态"""
    weights = [0.85, 0.10, 0.05]  # 运营中, 维护中, 离线
    return random.choices(["operating", "maintenance", "offline"], weights=weights)[0]


def generate_charger_station(city_config: Tuple, index: int) -> Dict:
    """生成单个充电站数据"""
    city_name, province, center_lng, center_lat, radius = city_config
    
    # 生成位置
    lng, lat = generate_location(center_lng, center_lat, radius)
    
    # 生成充电桩配置
    charger_config = generate_chargers_per_station()
    
    # 生成场站基本信息
    station = {
        "id": generate_station_id(city_name, index),
        "name": generate_station_name(city_name),
        "city": city_name,
        "province": province,
        "location": {
            "lng": round(lng, 6),
            "lat": round(lat, 6),
            "address": f"{city_name}{random.choice(['XX区', 'XX街道', 'XX路'])}{random.randint(1, 999)}号",
            "parking_lots": random.randint(10, 200)
        },
        "operator": random.choice(OPERATORS),
        "charger_brand": random.choice(CHARGER_BRANDS),
        "station_type": random.choice(STATION_TYPES),
        "chargers": {
            "slow": charger_config["slow"],
            "fast": charger_config["fast"],
            "ultra": charger_config["ultra"],
            "total": charger_config["total"]
        },
        "capacity_mw": generate_station_capacity(charger_config),
        "price": generate_price(),
        "open_time": f"{random.randint(0,2):02d}:{random.choice(['00', '30'])}",
        "close_time": "24:00" if random.random() > 0.3 else f"{random.randint(18, 23):02d}:00",
        "rating": generate_rating(),
        "total_orders": random.randint(500, 50000),
        "status": generate_status(),
        "open_date": random_date(730, 180),
        "last_maintenance": random_date(90, 1),
        "features": sample([
            "24小时营业", "支持预约", "限时段免费停车", "有休息室",
            "卫生间", "便利店", "快餐服务", "WiFi覆盖",
            "监控覆盖", "消防设施", "无障碍通道", "支持APP支付",
            "支持微信支付", "支持支付宝", "支持扫码充电", "即插即充"
        ], k=random.randint(2, 6)),
        "connector_types": sample([
            "GB/T", "CHAdeMO", "CCS2", "特斯拉专用", "Type-2"
        ], k=random.randint(1, 3)),
        "data_source": "新能数据平台",
        "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    return station


def crawl_chargers(cities: List[Tuple] = None, stations_per_city: int = 200) -> List[Dict]:
    """
    主采集函数
    
    Args:
        cities: 城市配置列表, 默认使用CITIES_CONFIG
        stations_per_city: 每个城市的场站数量
    
    Returns:
        充电站数据列表
    """
    if cities is None:
        cities = CITIES_CONFIG
    
    all_stations = []
    
    print(f"开始采集 {len(cities)} 个城市的充电站数据...")
    print(f"目标: 每个城市 {stations_per_city} 个场站")
    print("-" * 50)
    
    for city_idx, city_config in enumerate(cities, 1):
        city_name = city_config[0]
        stations = []
        
        for station_idx in range(1, stations_per_city + 1):
            station = generate_charger_station(city_config, station_idx)
            stations.append(station)
        
        all_stations.extend(stations)
        
        # 打印进度
        total_power = sum(s["capacity_mw"] for s in stations)
        avg_rating = sum(s["rating"] for s in stations) / len(stations)
        print(f"[{city_idx:2d}/{len(cities)}] {city_name}: {len(stations)} 站, "
              f"总功率 {total_power:.1f}MW, 平均评分 {avg_rating:.1f}")
    
    print("-" * 50)
    print(f"采集完成! 共 {len(all_stations)} 个充电站")
    print(f"总充电桩数量: {sum(s['chargers']['total'] for s in all_stations)}")
    print(f"总装机功率: {sum(s['capacity_mw'] for s in all_stations):.2f} MW")
    
    return all_stations


def save_to_json(data: List[Dict], filepath: str):
    """保存数据到JSON文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"数据已保存至: {filepath}")


def generate_statistics(data: List[Dict]) -> Dict:
    """生成数据统计"""
    # 按城市统计
    city_stats = {}
    for station in data:
        city = station["city"]
        if city not in city_stats:
            city_stats[city] = {
                "station_count": 0,
                "total_capacity_mw": 0,
                "total_chargers": 0,
                "total_orders": 0,
                "avg_rating": 0
            }
        city_stats[city]["station_count"] += 1
        city_stats[city]["total_capacity_mw"] += station["capacity_mw"]
        city_stats[city]["total_chargers"] += station["chargers"]["total"]
        city_stats[city]["total_orders"] += station["total_orders"]
        city_stats[city]["avg_rating"] += station["rating"]
    
    for city in city_stats:
        city_stats[city]["avg_rating"] = round(
            city_stats[city]["avg_rating"] / city_stats[city]["station_count"], 1
        )
    
    # 按运营商统计
    operator_stats = {}
    for station in data:
        op = station["operator"]
        if op not in operator_stats:
            operator_stats[op] = {"station_count": 0, "total_capacity_mw": 0}
        operator_stats[op]["station_count"] += 1
        operator_stats[op]["total_capacity_mw"] += station["capacity_mw"]
    
    return {
        "total_stations": len(data),
        "total_chargers": sum(s["chargers"]["total"] for s in data),
        "total_capacity_mw": round(sum(s["capacity_mw"] for s in data), 2),
        "avg_stations_per_city": round(len(data) / len(city_stats), 1),
        "city_statistics": city_stats,
        "operator_statistics": operator_stats,
        "generate_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }


if __name__ == "__main__":
    # 采集数据
    stations = crawl_chargers(stations_per_city=200)
    
    # 保存原始数据
    save_to_json(stations, "./data/chargers.json")
    
    # 生成并保存统计
    stats = generate_statistics(stations)
    save_to_json(stats, "./data/chargers_statistics.json")
    
    print("\n✅ 所有任务完成!")
