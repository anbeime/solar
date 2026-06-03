export const metadata = {
  title: 'SNEC明日开幕！储能馆数量首超光伏馆，华为/宁德/比亚迪抢C位',
  description: '全球最大光伏储能盛会即将启幕，储能主题馆规模创历史新高'
}

export default function Page() {
  return (
    <div style={{maxWidth:'640px',margin:'0 auto',background:'#fff',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      {/* 封面图 */}
      <div style={{position:'relative'}}>
        <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800" style={{width:'100%',display:'block'}} alt="SNEC展会"/>
      </div>

      {/* 标题区 */}
      <div style={{padding:'20px 16px 12px'}}>
        <h1 style={{margin:0,fontSize:'22px',lineHeight:'1.4',color:'#1a1a1a',fontWeight:'700'}}>SNEC明日开幕！储能馆数量首超光伏馆</h1>
        <div style={{marginTop:'10px',fontSize:'13px',color:'#999'}}>
          <span>光伏储能地图站</span>&nbsp;|&nbsp;<span>2026-06-02</span>
        </div>
      </div>

      {/* 导语 */}
      <div style={{padding:'0 16px 16px',borderBottom:'1px solid #eee'}}>
        <p style={{margin:0,fontSize:'15px',color:'#555'}}>SNEC 2026将于6月3日在上海开幕，储能馆数量历史性超越光伏馆，华为/宁德时代/比亚迪六大馆抢C位。宁德时代砸30亿建全球最大储能实证平台。</p>
      </div>

      {/* 数据卡片 */}
      <div style={{padding:'16px',background:'#f0f9ff',borderRadius:'8px',margin:'16px'}}>
        <div style={{fontSize:'13px',color:'#666',marginBottom:'12px'}}>📊 今日市场数据</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#06b6d4'}}>88个</div>
            <div style={{fontSize:'12px',color:'#999'}}>NEA光伏项目</div>
          </div>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#10b981'}}>896个</div>
            <div style={{fontSize:'12px',color:'#999'}}>BJX储能项目</div>
          </div>
        </div>
      </div>

      {/* 热点一 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🔴 储能馆数量首超光伏馆！SNEC 2026明日开幕</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>SNEC 2026将于6月3日至5日在上海国家会展中心举行。储能主题馆达到<strong style={{color:'#e74c3c'}}>6个</strong>，首次超越光伏电池组件馆的4个，标志着行业从"光伏春晚"正式迈向"光储春晚"。</p>
      </div>

      {/* 热点二 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🟣 宁德时代30亿建全球最大储能实证平台</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>厦门市政府与宁德时代共建的<strong style={{color:'#6366f1'}}>厦门实证储能科技研究院正式启动</strong>，总占地150亩、总投资约30亿元，是目前全球规模最大、检测能力最完整的储能系统全场景一站式检测与实证平台。</p>
      </div>

      {/* 热点三 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🟢 南方五省绿电现货长周期结算正式落地</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>6月1日起，广东、广西、云南、贵州、海南正式试运行<strong style={{color:'#10b981'}}>新能源现货长周期结算新规</strong>，覆盖全品类新能源项目，开放市场化交易通道。</p>
      </div>

      {/* 底部引流 */}
      <div style={{padding:'16px',background:'#fafafa',borderTop:'1px solid #eee',textAlign:'center'}}>
        <p style={{margin:'0 0 10px',fontSize:'13px',color:'#666'}}>📍 查看全国光伏储能项目分布</p>
        <a href="https://solar.miyucaicai.cn" style={{display:'inline-block',background:'#06b6d4',color:'#fff',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',textDecoration:'none',margin:'4px'}}>🌞 光伏储能地图站</a>
      </div>
    </div>
  )
}
