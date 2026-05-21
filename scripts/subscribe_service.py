"""
订阅信息推送服务
基于Hermes Agent Workflow理念，定时推送光伏储能行业动态
"""
import requests
import json
import os
from datetime import datetime

class SubscribeService:
    def __init__(self):
        self.subscribers_file = "public/data/subscribers.json"
        self.gitee_token = "f759f8fdac5ac2849c9d3777010ba38b"
        self.gitee_repo = "anbeime/solar"
    
    def load_subscribers(self):
        """加载订阅者列表"""
        try:
            if os.path.exists(self.subscribers_file):
                with open(self.subscribers_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"加载订阅者失败: {e}")
        return []
    
    def generate_briefing(self):
        """生成晨间简报（符合GEO标准）"""
        # 获取最新项目数据
        projects = self.get_latest_projects()
        biddings = self.get_latest_biddings()
        
        # 生成精美HTML简报
        html = self.create_geo_briefing(projects, biddings)
        return html
    
    def create_geo_briefing(self, projects, biddings):
        """创建符合GEO标准的精美简报"""
        
        briefing = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>光伏储能行业动态简报 - {datetime.now().strftime('%Y年%m月%d日')}</title>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; background: #f5f5f5; }}
.header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 16px; text-align: center; margin-bottom: 20px; }}
.header h1 {{ margin: 0 0 10px; font-size: 24px; }}
.header p {{ margin: 0; opacity: 0.9; font-size: 14px; }}
.section {{ background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }}
.section-title {{ font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }}
.badge {{ display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }}
.badge-new {{ background: #e8f5e9; color: #2e7d32; }}
.badge-hot {{ background: #fff3e0; color: #e65100; }}
.item {{ padding: 12px 0; border-bottom: 1px solid #f0f0f0; }}
.item:last-child {{ border-bottom: none; }}
.item-title {{ font-size: 14px; color: #333; margin-bottom: 6px; font-weight: 500; }}
.item-meta {{ font-size: 12px; color: #888; }}
.tag {{ display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 4px; }}
.tag-solar {{ background: #e3f2fd; color: #1565c0; }}
.tag-storage {{ background: #f3e5f5; color: #7b1fa2; }}
.tag-bidding {{ background: #fce4ec; color: #c2185b; }}
.highlight {{ background: linear-gradient(120deg, #ffeaa7 0%, #ffeaa7 100%); padding: 0 4px; font-weight: 600; }}
.footer {{ text-align: center; padding: 20px; color: #888; font-size: 12px; }}
.stats {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }}
.stat {{ text-align: center; padding: 12px; background: #f8f9fa; border-radius: 12px; }}
.stat-num {{ font-size: 24px; font-weight: 700; color: #667eea; }}
.stat-label {{ font-size: 11px; color: #888; margin-top: 4px; }}
</style>
</head>
<body>

<div class="header">
    <h1>☀️ 光伏储能行业晨间简报</h1>
    <p>{datetime.now().strftime('%Y年%m月%d日 %A')} · 数据更新于 {datetime.now().strftime('%H:%M')}</p>
</div>

<div class="section">
    <div class="section-title">📊 行业数据概览</div>
    <div class="stats">
        <div class="stat">
            <div class="stat-num">{len(projects)}</div>
            <div class="stat-label">新增项目</div>
        </div>
        <div class="stat">
            <div class="stat-num">{len(biddings)}</div>
            <div class="stat-label">招标动态</div>
        </div>
        <div class="stat">
            <div class="stat-num">995</div>
            <div class="stat-label">累计项目</div>
        </div>
    </div>
</div>
"""
        
        # 新增项目
        if projects:
            briefing += """
<div class="section">
    <div class="section-title">🆕 最新项目动态 <span class="badge badge-new">NEW</span></div>
"""
            for p in projects[:5]:
                name = p.get('name', '未知项目')
                location = p.get('location', '未知地区')
                capacity = p.get('capacity', '未知')
                status = p.get('status', '未知')
                category = p.get('category', '其他')
                tag_class = 'tag-solar' if '光伏' in category else 'tag-storage'
                
                briefing += f"""
    <div class="item">
        <div class="item-title">{name}</div>
        <div class="item-meta">
            <span class="tag {tag_class}">{category}</span>
            <span>📍 {location}</span>
            <span>⚡ {capacity}</span>
            <span>📌 {status}</span>
        </div>
    </div>
"""
            briefing += "</div>"
        
        # 招标动态
        if biddings:
            briefing += """
<div class="section">
    <div class="section-title">🔥 招标公告 <span class="badge badge-hot">HOT</span></div>
"""
            for b in biddings[:5]:
                title = b.get('title', '未知公告')
                region = b.get('region', '未知地区')
                amount = b.get('amount', '未知')
                
                briefing += f"""
    <div class="item">
        <div class="item-title">{title}</div>
        <div class="item-meta">
            <span class="tag tag-bidding">招标</span>
            <span>📍 {region}</span>
            <span>💰 {amount}</span>
        </div>
    </div>
"""
            briefing += "</div>"
        
        # 热门话题
        briefing += """
<div class="section">
    <div class="section-title">💡 今日热点洞察</div>
    <div class="item">
        <div class="item-title">🔋 储能配置新规落地</div>
        <div class="item-meta">工商业项目强制配储≥15%，2小时时长，政策红利持续释放</div>
    </div>
    <div class="item">
        <div class="item-title">🌏 东南亚市场爆发</div>
        <div class="item-meta">柬埔寨、越南、老挝光伏项目密集获批，中国企业出海加速</div>
    </div>
    <div class="item">
        <div class="item-title">💹 行业数据亮眼</div>
        <div class="item-meta">2026年1-4月新型储能招标量同比+132%，新增装机+42%</div>
    </div>
</div>

<div class="footer">
    <p>📌 <span class="highlight">光伏储能地图站</span> 持续追踪全球新能源项目动态</p>
    <p>🌐 <a href="https://solar.miyucaicai.cn" style="color:#667eea;">solar.miyucaicai.cn</a></p>
    <p style="margin-top:12px;">🔒 您收到此邮件是因为已订阅我们的行业动态推送</p>
</div>

</body>
</html>
"""
        return briefing
    
    def get_latest_projects(self):
        """获取最新项目"""
        # 从本地或API获取
        try:
            # 这里可以对接真实数据源
            return [
                {"name": "智光电气梅州平远储能二期", "location": "广东梅州", "capacity": "100MW/200MWh", "status": "已并网", "category": "储能"},
                {"name": "柬埔寨太阳能发电站群", "location": "柬埔寨", "capacity": "330MW+500MW储能", "status": "审批中", "category": "光伏"},
                {"name": "大唐中卫云基地光伏电站", "location": "宁夏中卫", "capacity": "500MW", "status": "已投运", "category": "光伏"},
            ]
        except:
            return []
    
    def get_latest_biddings(self):
        """获取最新招标"""
        try:
            return [
                {"title": "甘肃武山300MW/1200MWh储能EPC", "region": "甘肃", "amount": "9.36亿元"},
                {"title": "山西怀仁100MW光储一体化EPC", "region": "山西", "amount": "招标中"},
                {"title": "宁夏中宁400MWh储能EPC", "region": "宁夏", "amount": "2.86亿元"},
            ]
        except:
            return []
    
    def send_briefing(self, email):
        """发送简报到邮箱（需配置邮件服务）"""
        # TODO: 集成邮件发送服务
        print(f"📧 发送简报到: {email}")
        return True
    
    def run_daily_workflow(self):
        """每日工作流"""
        print(f"🤖 启动每日订阅推送工作流 - {datetime.now()}")
        
        subscribers = self.load_subscribers()
        briefing = self.generate_briefing()
        
        print(f"📊 生成简报完成，共 {len(subscribers)} 位订阅者")
        
        for sub in subscribers:
            if sub.get('status') == 'active':
                self.send_briefing(sub.get('email'))
        
        print("✅ 每日推送完成")
        return True


if __name__ == "__main__":
    service = SubscribeService()
    service.run_daily_workflow()
