/**
 * 数据工具函数 - 解析、转换、统计
 */

import type { Project, BiddingItem, AwardItem, ChargerItem, OverviewStats, ProvinceStat, ProjectType } from './types';
import { PROVINCES } from './constants';

// ===== 解析工具 =====

export function parseCapacityGW(cap: string): number {
  if (!cap) return 0;
  const m = cap.match(/([\d.]+)\s*(GW|GWh|MW|MWh|kW|kWh)/i);
  if (!m) return 0;
  const val = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit.startsWith('G')) return val;
  if (unit.startsWith('M')) return val / 1000;
  if (unit.startsWith('K')) return val / 1000000;
  return val;
}

export function extractProvince(text: string): string {
  for (const p of PROVINCES) {
    if (text.includes(p)) return p;
  }
  return '';
}

export function extractCapacity(text: string): string {
  const patterns = [
    /([\d.]+)\s*(GW|GWh|MW|MWh|kW|kWh)/i,
    /([\d.]+)\s*万千瓦/,
    /([\d.]+)\s*吉瓦/,
    /([\d.]+)\s*兆瓦/,
    /装机\s*([\d.]+)\s*(GW|MW|kW)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return `${m[1]}${m[2]}`;
  }
  return '';
}

export function extractAmount(text: string): string {
  const m = text.match(/([\d.]+)\s*(亿元|万元|万|元)/);
  if (!m) return '';
  return `${m[1]}${m[2]}`;
}

export function extractCompany(text: string): string {
  const patterns = [
    /(?:投资方|建设单位|业主|项目单位|中标方|中标单位|承包方|开发方|由|签约|承建|参建)[：:]\s*([^\s,，。；;]+(?:公司|集团|有限|股份|研究院|中心|局|厅|部|厂))/,
    /((?:中国|国|华|大|中)[^\s,，。；;]{2,20}?(?:公司|集团|有限|股份))/,
    /((?:省|市|区|县)[^\s,，。；;]{0,10}(?:能源|电力|电网|新能源)[^\s,，。；;]{0,10}?(?:公司|集团|有限|股份|局))/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  return '';
}

export function extractDate(text: string): string {
  const m = text.match(/(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const m2 = text.match(/(\d{4})[年](\d{1,2})[月]/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}`;
  return '';
}

// ===== 分类 =====

const PROJECT_KW = ['项目','电站','基地','装机','光伏','储能','充电站','并网','投产','开工','建设','落地','签约','发电','新能源','清洁能源','碳中和','碳达峰','绿电','可再生','氢能','抽蓄','电化学','锂电池','源网荷储','虚拟电厂','微电网','综合能源','零碳'];
const BIDDING_KW = ['招标','投标','采购','竞价','竞标','询价','比选','资格预审','标段','报名','截标','开标'];
const AWARD_KW = ['中标','成交','公示','候选人','预中标','中标结果','中标公告','入围'];
const CHARGER_KW = ['充电桩','充电站','充电设施','换电站','充电网','充电基础设施','充换电','超充','快充','新能源汽车充电'];

export function classifyArticle(title: string, summary: string): 'project' | 'bidding' | 'award' | 'charger' {
  const text = `${title} ${summary}`;
  if (CHARGER_KW.some(kw => text.includes(kw))) return 'charger';
  if (AWARD_KW.some(kw => text.includes(kw))) return 'award';
  if (BIDDING_KW.some(kw => text.includes(kw))) return 'bidding';
  if (PROJECT_KW.some(kw => text.includes(kw))) return 'project';
  return 'project';
}

export function determineType(title: string, summary: string): ProjectType {
  const text = `${title} ${summary}`;
  if (/储能|电池|锂电池|蓄能|抽水蓄能|电化学/.test(text)) return '储能';
  if (/光伏|太阳能|分布式光伏|集中式光伏|组件|硅片/.test(text)) return '光伏';
  if (/风电|风力发电|风场|风机/.test(text)) return '风电';
  if (/充电|充电桩|充电站|换电/.test(text)) return '充电';
  if (/氢能|制氢|储氢|燃料电池/.test(text)) return '氢能';
  return '综合能源';
}

export function determineStatus(title: string, summary: string, category: string): string {
  const text = `${title} ${summary}`;
  if (category === 'bidding') {
    if (/已截止|已开标|已结束/.test(text)) return '已截止';
    return '报名中';
  }
  if (category === 'award') return '已公示';
  return '';
}

// ===== 统计 =====

export function computeOverviewStats(
  projects: Project[],
  bidding: BiddingItem[],
  awards: AwardItem[],
  chargers: ChargerItem[],
): OverviewStats {
  const pvProjects = projects.filter(p => p.type === '光伏');
  const esProjects = projects.filter(p => p.type === '储能');
  const pvCap = pvProjects.reduce((s, p) => s + parseCapacityGW(p.capacity), 0);
  const esCap = esProjects.reduce((s, p) => s + parseCapacityGW(p.capacity), 0);
  const provinces = new Set(projects.map(p => p.province).filter(Boolean));

  return {
    totalProjects: projects.length,
    pvCount: pvProjects.length,
    esCount: esProjects.length,
    pvCapGW: pvCap,
    esCapGWh: esCap,
    provinceCount: provinces.size,
    biddingCount: bidding.length,
    biddingActive: bidding.filter(b => b.status === '报名中').length,
    awardsCount: awards.length,
    chargerCount: chargers.length,
  };
}

export function computeProvinceStats(projects: Project[]): ProvinceStat[] {
  const map = new Map<string, { count: number; capacityGW: number; companies: Set<string>; types: Map<string, number> }>();

  projects.forEach(p => {
    if (!p.province) return;
    const s = map.get(p.province) || { count: 0, capacityGW: 0, companies: new Set<string>(), types: new Map<string, number>() };
    s.count++;
    s.capacityGW += parseCapacityGW(p.capacity);
    if (p.company) s.companies.add(p.company);
    if (p.type) s.types.set(p.type, (s.types.get(p.type) || 0) + 1);
    map.set(p.province, s);
  });

  return Array.from(map.entries()).map(([name, s]) => ({
    name,
    count: s.count,
    capacityGW: s.capacityGW,
    companyCount: s.companies.size,
    types: Object.fromEntries(s.types),
  }));
}

// ===== 项目类型样式 =====

export function getTypeStyle(type: string): string {
  const styles: Record<string, string> = {
    '光伏': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    '储能': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    '风电': 'bg-blue-50 text-blue-700 border-blue-200',
    '充电': 'bg-green-50 text-green-700 border-green-200',
    '氢能': 'bg-purple-50 text-purple-700 border-purple-200',
    '综合能源': 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return styles[type] || styles['综合能源'];
}

export function getTypeBarColor(type: string): string {
  const colors: Record<string, string> = {
    '光伏': 'bg-amber-400',
    '储能': 'bg-blue-400',
    '风电': 'bg-cyan-400',
    '充电': 'bg-green-400',
    '氢能': 'bg-purple-400',
    '综合能源': 'bg-slate-400',
  };
  return colors[type] || 'bg-slate-400';
}

export function getTypeDotColor(type: string): string {
  const colors: Record<string, string> = {
    '光伏': 'bg-amber-400',
    '储能': 'bg-blue-400',
    '风电': 'bg-cyan-400',
    '充电': 'bg-green-400',
    '氢能': 'bg-purple-400',
    '综合能源': 'bg-slate-400',
  };
  return colors[type] || 'bg-slate-400';
}
