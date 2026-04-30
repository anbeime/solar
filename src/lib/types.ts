/**
 * 光伏储能地图站 - 统一类型定义
 */

// ===== 项目 =====
export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  province: string;
  capacity: string;
  amount: string;
  company: string;
  summary: string;
  date: string;
  sourceUrl: string;
  sourceName: string;
}

export type ProjectType = '光伏' | '储能' | '风电' | '充电' | '氢能' | '综合能源';

// ===== 招标 =====
export interface BiddingItem {
  id: string;
  title: string;
  province: string;
  category: string;
  summary: string;
  capacity: string;
  amount: string;
  company: string;
  date: string;
  status: BiddingStatus;
  sourceUrl: string;
  sourceName: string;
}

export type BiddingStatus = '报名中' | '已截止';

// ===== 中标 =====
export interface AwardItem {
  id: string;
  title: string;
  province: string;
  category: string;
  summary: string;
  capacity: string;
  amount: string;
  company: string;
  date: string;
  status: string;
  sourceUrl: string;
  sourceName: string;
}

// ===== 充电桩 =====
export interface ChargerItem {
  id: string;
  title: string;
  province: string;
  summary: string;
  capacity: string;
  company: string;
  date: string;
  sourceUrl: string;
  sourceName: string;
}

// ===== 通用 =====
export interface DataSource {
  name: string;
  url: string;
}

export interface CrawlResult {
  success: boolean;
  source: string;
  sourceUrl: string;
  count: number;
  data: Record<string, unknown>[];
  crawledAt: string;
  message: string;
}

// ===== 统计 =====
export interface OverviewStats {
  totalProjects: number;
  pvCount: number;
  esCount: number;
  pvCapGW: number;
  esCapGWh: number;
  provinceCount: number;
  biddingCount: number;
  biddingActive: number;
  awardsCount: number;
  chargerCount: number;
}

export interface ProvinceStat {
  name: string;
  count: number;
  capacityGW: number;
  companyCount: number;
  types: Record<string, number>;
}

// ===== AI 分析 =====
export interface AIAnalysisRequest {
  type: 'policy' | 'project' | 'trend' | 'bidding';
  content: string;
  context?: string;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// ===== 光伏预测 =====
export interface ForecastDataPoint {
  timestamp: string;
  predicted_power_kw: number;
  is_daytime: boolean;
}

export interface ForecastResult {
  predictions: ForecastDataPoint[];
  total_generation_kwh: number;
  peak_power_kw: number;
  capacity_factor: number;
}

// ===== 工具类型 =====
export type SortKey = 'count' | 'capacity' | 'company';
export type NavPage = 'home' | 'bidding' | 'awards' | 'province' | 'chargers' | 'dashboard' | 'ai';
