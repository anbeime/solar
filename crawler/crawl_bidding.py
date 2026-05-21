# -*- coding: utf-8 -*-
"""
光伏储能地图站 - 招投标数据爬虫
支持：中国招标投标公共服务平台、能源招采网、各省政府采购平台
"""

import requests
import json
import time
import random
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from urllib.parse import urljoin
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BiddingCrawler:
    """招投标数据爬虫基类"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
        }
        self.timeout = 30
        
    def fetch_page(self, url: str, encoding: str = 'utf-8') -> Optional[str]:
        """获取网页内容"""
        try:
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.encoding = encoding
            return response.text
        except Exception as e:
            logger.error(f"请求失败 {url}: {e}")
            return None
    
    def parse_date(self, date_str: str) -> str:
        """解析日期格式"""
        if not date_str:
            return datetime.now().strftime('%Y-%m-%d')
        # 清理日期字符串
        date_str = re.sub(r'[年月日]', '-', date_str).rstrip('-')
        try:
            # 尝试多种日期格式
            for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%Y.%m.%d']:
                try:
                    return datetime.strptime(date_str[:10], fmt).strftime('%Y-%m-%d')
                except:
                    pass
            return date_str[:10]
        except:
            return datetime.now().strftime('%Y-%m-%d')


class CTBPspCrawler(BiddingCrawler):
    """中国招标投标公共服务平台爬虫"""
    
    def __init__(self):
        super().__init__()
        self.base_url = 'https://www.ctbpsp.com'
        self.api_url = 'https://www.ctbpsp.com/#/bulletin'
        
    def get_bidding_list(self, keyword: str = '光伏', page: int = 1) -> List[Dict]:
        """获取招标公告列表"""
        results = []
        
        # 构造搜索URL (模拟，实际需要解析网站API)
        search_url = f'{self.base_url}/bulletin/list'
        params = {
            'keyword': keyword,
            'page': page,
            'pageSize': 20,
            'category': 'tender'
        }
        
        try:
            # 这里模拟数据，实际需要分析网站结构后实现
            logger.info(f"正在抓取中国招标投标公共服务平台: {keyword} 第{page}页")
            time.sleep(random.uniform(1, 2))
            
            # TODO: 根据实际网站结构解析HTML
            # 示例HTML解析代码（待网站结构确认后启用）
            # html = self.fetch_page(search_url)
            # if html:
            #     results = self.parse_html(html)
                
        except Exception as e:
            logger.error(f"抓取失败: {e}")
            
        return results
    
    def parse_html(self, html: str) -> List[Dict]:
        """解析HTML内容"""
        results = []
        # 使用正则或BeautifulSoup解析
        # pattern = r'<div class="title">(.*?)</div>'
        return results


class EnergyTenderCrawler(BiddingCrawler):
    """能源招采网爬虫"""
    
    def __init__(self):
        super().__init__()
        self.base_url = 'https://www.nengyuanjie.net'
        
    def get_bidding_list(self, keyword: str = '光伏储能', page: int = 1) -> List[Dict]:
        """获取招标公告列表"""
        results = []
        logger.info(f"正在抓取能源招采网: {keyword} 第{page}页")
        time.sleep(random.uniform(1, 2))
        return results


class GovernmentProcurementCrawler(BiddingCrawler):
    """各省政府采购平台爬虫"""
    
    def __init__(self):
        super().__init__()
        # 各省采购平台URL模板
        self.province_urls = {
            '北京': 'https://www.ccgp-beijing.gov.cn',
            '上海': 'https://www.ccgp-shanghai.gov.cn',
            '广东': 'https://www.ccgp-guangdong.gov.cn',
            '浙江': 'https://www.ccgp-zhejiang.gov.cn',
            '江苏': 'https://www.ccgp-jiangsu.gov.cn',
            '山东': 'https://www.ccgp-shandong.gov.cn',
            '四川': 'https://www.ccgp-sichuan.gov.cn',
            '河南': 'https://www.ccgp-henan.gov.cn',
            '湖北': 'https://www.ccgp-hubei.gov.cn',
            '湖南': 'https://www.ccgp-hunan.gov.cn',
        }
        
    def get_bidding_list(self, province: str = None, keyword: str = '光伏', page: int = 1) -> List[Dict]:
        """获取指定省份的招标公告"""
        results = []
        
        if province and province in self.province_urls:
            urls = {province: self.province_urls[province]}
        else:
            urls = self.province_urls
            
        for prov, base_url in urls.items():
            try:
                logger.info(f"正在抓取{prov}政府采购平台: {keyword}")
                time.sleep(random.uniform(2, 4))
                # TODO: 解析各省平台实际结构
            except Exception as e:
                logger.error(f"抓取{prov}失败: {e}")
                
        return results


class BiddingDataManager:
    """招投标数据管理器"""
    
    def __init__(self, data_file: str = '../data/bidding.json'):
        self.data_file = data_file
        self.data: List[Dict] = []
        self.load_data()
        
    def load_data(self):
        """加载本地数据"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            logger.info(f"已加载 {len(self.data)} 条数据")
        except FileNotFoundError:
            logger.warning(f"数据文件不存在: {self.data_file}")
            self.data = []
        except Exception as e:
            logger.error(f"加载数据失败: {e}")
            self.data = []
            
    def save_data(self):
        """保存数据到本地"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
            logger.info(f"已保存 {len(self.data)} 条数据")
        except Exception as e:
            logger.error(f"保存数据失败: {e}")
            
    def add_records(self, records: List[Dict]):
        """添加新记录"""
        for record in records:
            if self.is_new_record(record):
                self.data.append(record)
        self.save_data()
        
    def is_new_record(self, record: Dict) -> bool:
        """检查是否是新记录"""
        for existing in self.data:
            if existing.get('project_name') == record.get('project_name'):
                return False
        return True
    
    def filter_data(self, 
                   province: str = None,
                   project_type: str = None,
                   keyword: str = None,
                   start_date: str = None,
                   end_date: str = None) -> List[Dict]:
        """筛选数据"""
        results = self.data.copy()
        
        if province:
            results = [r for r in results if r.get('province') == province]
        if project_type:
            results = [r for r in results if r.get('type') == project_type]
        if keyword:
            results = [r for r in results if keyword in r.get('project_name', '')]
        if start_date:
            results = [r for r in results if r.get('publish_time', '') >= start_date]
        if end_date:
            results = [r for r in results if r.get('publish_time', '') <= end_date]
            
        return results


def generate_simulated_data() -> List[Dict]:
    """生成模拟招投标数据"""
    provinces = ['北京', '上海', '广东', '浙江', '江苏', '山东', '四川', '河南', '湖北', '湖南',
                 '河北', '陕西', '安徽', '福建', '江西', '云南', '贵州', '广西', '山西', '内蒙古']
    
    project_types = ['光伏组件采购', '光伏EPC总承包', '储能系统招标', '光伏逆变器招标', 
                     '光伏支架采购', '储能电池招标', '光伏储能一体化', '分布式光伏项目',
                     '光伏运维服务', '光伏并网工程']
    
    units = ['国家电网XX省分公司', '华能XX省分公司', '华电XX省分公司', '大唐XX省分公司',
             '中广核XX省公司', '国电投XX省分公司', 'XX省新能源发展集团', 'XX市发改委',
             'XX县能源局', 'XX开发区管委会', 'XX企业股份公司', 'XX科技有限公司']
    
    projects = [
        '2025年屋顶分布式光伏发电项目', '渔光互补光伏发电项目', '农光互补光伏项目',
        '光伏储能一体化示范项目', '工商业分布式光伏项目', '光伏扶贫项目',
        '地面集中式光伏电站', '储能调频项目', '储能调峰项目', '光储充一体化项目',
        '光伏制氢项目', '海上光伏项目', '光伏逆变器采购项目', '光伏支架采购项目',
        '光伏运维服务项目', '光伏并网设计项目', '储能电池系统采购', 'BMS系统招标',
        '光伏组件及逆变器采购', '光伏项目监理服务'
    ]
    
    data = []
    base_date = datetime.now()
    
    for i in range(50):
        province = provinces[i % len(provinces)]
        project_type = project_types[i % len(project_types)]
        project_name = projects[i % len(projects)]
        unit = units[i % len(units)].replace('XX', province)
        
        publish_days_ago = random.randint(1, 30)
        deadline_days_ahead = random.randint(5, 45)
        
        publish_time = (base_date - timedelta(days=publish_days_ago)).strftime('%Y-%m-%d')
        deadline = (base_date + timedelta(days=deadline_days_ahead)).strftime('%Y-%m-%d')
        
        amount = random.choice([
            round(random.uniform(100, 5000), 2) * 100,  # 万元
            None
        ])
        
        record = {
            'id': f'BID{2025}{i+1:04d}',
            'project_name': f'{province}{project_name}',
            'type': project_type,
            'amount': amount,
            'amount_text': f'{amount}万元' if amount else '面议',
            'province': province,
            'publish_time': publish_time,
            'deadline': deadline,
            'tender_unit': unit,
            'status': '招标中' if datetime.strptime(deadline, '%Y-%m-%d') > base_date else '已截止',
            'source': random.choice(['中国招标投标公共服务平台', '能源招采网', f'{province}政府采购网']),
            'url': f'https://example.com/bidding/{i+1}'
        }
        data.append(record)
    
    return data


def run_crawler():
    """运行爬虫主函数"""
    print("=" * 60)
    print("光伏储能地图站 - 招投标数据爬虫")
    print("=" * 60)
    
    # 初始化爬虫
    ctbpsp = CTBPspCrawler()
    energy_tender = EnergyTenderCrawler()
    gov_procurement = GovernmentProcurementCrawler()
    
    # 数据管理器
    data_manager = BiddingDataManager()
    
    # 采集策略
    keywords = ['光伏', '储能', '新能源', '光储']
    
    print("\n[1] 中国招标投标公共服务平台")
    for keyword in keywords[:2]:
        ctbpsp.get_bidding_list(keyword=keyword)
        
    print("\n[2] 能源招采网")
    for keyword in keywords[:2]:
        energy_tender.get_bidding_list(keyword=keyword)
        
    print("\n[3] 省政府采购平台")
    gov_procurement.get_bidding_list(keyword='光伏储能')
    
    # 生成模拟数据（供开发测试用）
    print("\n[4] 生成模拟数据...")
    simulated_data = generate_simulated_data()
    
    # 保存模拟数据
    output_file = '../data/bidding.json'
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(simulated_data, f, ensure_ascii=False, indent=2)
        print(f"✓ 已生成 {len(simulated_data)} 条模拟数据: {output_file}")
    except Exception as e:
        print(f"✗ 保存失败: {e}")
    
    print("\n" + "=" * 60)
    print("爬虫执行完成!")
    print("=" * 60)


if __name__ == '__main__':
    run_crawler()
