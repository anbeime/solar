export const metadata = {
  title: 'SNEC 2026来了！光伏储能赛道6月迎重磅催化',
  description: '6月3日-5日，全球光伏盛会SNEC即将在上海开幕'
}

export default function Page() {
  return (
    <div style={{maxWidth:'640px',margin:'0 auto',background:'#fff',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      {/* 封面图 */}
      <div style={{position:'relative'}}>
        <img src="https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800" style={{width:'100%',display:'block'}} alt="光伏储能"/>
      </div>

      {/* 标题区 */}
      <div style={{padding:'20px 16px 12px'}}>
        <h1 style={{margin:0,fontSize:'22px',lineHeight:'1.4',color:'#1a1a1a',fontWeight:'700'}}>🔥 SNEC 2026来了！光伏储能赛道6月迎重磅催化</h1>
        <div style={{marginTop:'10px',fontSize:'13px',color:'#999'}}>
          <span>光伏储能地图站</span>&nbsp;|&nbsp;<span>2026-06-01</span>
        </div>
      </div>

      {/* 导语 */}
      <div style={{padding:'0 16px 16px',borderBottom:'1px solid #eee'}}>
        <p style={{margin:0,fontSize:'15px',color:'#555'}}>6月3日-5日，全球光伏盛会SNEC即将在上海开幕。隆基、天合、通威等头部企业蓄势待发，叠加储能政策利好持续释放，光伏储能赛道迎来布局良机。</p>
      </div>

      {/* 数据卡片 */}
      <div style={{padding:'16px',background:'#f0f9ff',borderRadius:'8px',margin:'16px'}}>
        <div style={{fontSize:'13px',color:'#666',marginBottom:'12px'}}>📊 今日市场数据</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#06b6d4'}}>612</div>
            <div style={{fontSize:'12px',color:'#999'}}>光伏项目(个)</div>
          </div>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#10b981'}}>49.1GW</div>
            <div style={{fontSize:'12px',color:'#999'}}>累计装机</div>
          </div>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#f59e0b'}}>97</div>
            <div style={{fontSize:'12px',color:'#999'}}>储能项目(个)</div>
          </div>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#e74c3c'}}>876.4亿</div>
            <div style={{fontSize:'12px',color:'#999'}}>招标金额(元)</div>
          </div>
        </div>
      </div>

      {/* SNEC展会 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🎯 SNEC 2026明日启幕</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>6月3日-5日，第十九届SNEC光伏储能展会将在上海国家会展中心举行。隆基、天合、通威、晶澳、爱旭等行业龙头将携最新技术亮相。</p>
        <div style={{marginTop:'12px',padding:'12px',background:'#f9f9f9',borderRadius:'6px',fontSize:'13px',color:'#666'}}>
          <b>头部企业亮点：</b><br/>
          ✅ <strong>隆基</strong>：BC+5S储能系统首秀<br/>
          ✅ <strong>天合</strong>：TOPCon+THBC双轮驱动<br/>
          ✅ <strong>通威</strong>：TNC 3.0四分片电池片
        </div>
      </div>

      {/* 储能政策 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🟢 储能商业逻辑彻底反转</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>2026年，储能行业迎来历史性转折——从"成本包袱"升级为"系统心脏"。容量电价+绿电直连强制配储双重政策驱动下，三重收益闭环形成。</p>
      </div>

      {/* 投资机会 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>📈 6月重点关注方向</h2>
        <div style={{padding:'12px',background:'#f9f9f9',borderRadius:'6px',fontSize:'13px',color:'#666'}}>
          <b>🔍 四大关注方向：</b><br/>
          1️⃣ <strong>SNEC参展商</strong><br/>
          2️⃣ <strong>储能集成商</strong><br/>
          3️⃣ <strong>辅材&设备</strong><br/>
          4️⃣ <strong>绿电直连受益</strong>
        </div>
      </div>

      {/* 底部引导 */}
      <div style={{padding:'16px',background:'#f0f4ff',borderRadius:'8px',margin:'16px',textAlign:'center'}}>
        <a href="https://solar.miyucaicai.cn" style={{display:'inline-block',background:'linear-gradient(135deg,#667eea,#764ba2)',color:'#fff',padding:'12px 28px',borderRadius:'25px',fontSize:'15px',textDecoration:'none',fontWeight:'600'}}>光伏储能地图站 →</a>
      </div>
    </div>
  )
}
