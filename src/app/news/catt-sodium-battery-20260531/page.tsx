export const metadata = {
  title: '宁德时代钠电池Q4量产！外资4倍认购绿债涌入储能赛道',
  description: '钠离子电池商业化加速，储能成本有望进一步下探'
}

export default function Page() {
  return (
    <div style={{maxWidth:'640px',margin:'0 auto',background:'#fff',borderRadius:'12px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.08)'}}>
      {/* 封面图 */}
      <div style={{position:'relative'}}>
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800" style={{width:'100%',display:'block'}} alt="宁德时代钠电池"/>
      </div>

      {/* 标题区 */}
      <div style={{padding:'20px 16px 12px'}}>
        <h1 style={{margin:0,fontSize:'22px',lineHeight:'1.4',color:'#1a1a1a',fontWeight:'700'}}>宁德时代钠电池Q4量产！外资4倍认购涌入储能</h1>
        <div style={{marginTop:'10px',fontSize:'13px',color:'#999'}}>
          <span>光伏储能地图站</span>&nbsp;|&nbsp;<span>2026-05-31</span>
        </div>
      </div>

      {/* 导语 */}
      <div style={{padding:'0 16px 16px',borderBottom:'1px solid #eee'}}>
        <p style={{margin:0,fontSize:'15px',color:'#555'}}>宁德时代官宣钠电池今年Q4规模量产，外资4倍超额认购绿色主权债券直指储能赛道，南网储能强势涨停。</p>
      </div>

      {/* 数据卡片 */}
      <div style={{padding:'16px',background:'#f0f9ff',borderRadius:'8px',margin:'16px'}}>
        <div style={{fontSize:'13px',color:'#666',marginBottom:'12px'}}>📊 今日市场数据</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#06b6d4'}}>8900MW</div>
            <div style={{fontSize:'12px',color:'#999'}}>NEA光伏装机</div>
          </div>
          <div style={{background:'#fff',padding:'12px',borderRadius:'6px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:'#10b981'}}>6504MWh</div>
            <div style={{fontSize:'12px',color:'#999'}}>BJX储能容量</div>
          </div>
        </div>
      </div>

      {/* 热点一：钠电池 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🔵 宁德时代钠电池Q4量产</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>宁德时代首席科学家吴凯明确表示：第二代"钠新"电池将于<strong style={{color:'#06b6d4'}}>今年Q4正式规模化供货</strong>，成本直降30%-40%，-40℃环境下容量保持率仍超90%。</p>
        <div style={{marginTop:'12px',padding:'12px',background:'#f9f9f9',borderRadius:'6px',fontSize:'13px',color:'#666'}}>
          <b>三大杀手锏：</b><br/>
          ✅ 成本优势：成本0.35-0.45元/Wh<br/>
          ✅ 低温性能：-40℃仍能正常放电<br/>
          ✅ 安全稳定：针刺、火烧不起火不爆炸
        </div>
      </div>

      {/* 热点二：外资布局 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🟠 外资4倍认购涌入储能</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>5月28日，财政部在香港发行60亿元绿色主权债券，<strong style={{color:'#f59e0b'}}>最终认购金额远超预期，超额认购倍数达4倍</strong>。全部投向绿电、储能、特高压等领域。</p>
      </div>

      {/* 热点三：南网储能涨停 */}
      <div style={{padding:'0 16px 20px'}}>
        <h2 style={{margin:'0 0 12px',fontSize:'17px',color:'#1a1a1a'}}>🟢 南网储能强势涨停</h2>
        <p style={{margin:0,fontSize:'14px',color:'#555',textAlign:'justify'}}>5月29日，<strong style={{color:'#10b981'}}>南网储能（600995）强势涨停</strong>，主力资金净买入3.39亿元。东吴证券给予"买入"评级。</p>
      </div>

      {/* 底部引流 */}
      <div style={{padding:'16px',background:'#fafafa',borderTop:'1px solid #eee',textAlign:'center'}}>
        <a href="https://solar.miyucaicai.cn" style={{display:'inline-block',background:'#06b6d4',color:'#fff',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',textDecoration:'none',margin:'4px'}}>🌞 光伏储能地图站</a>
      </div>
    </div>
  )
}
