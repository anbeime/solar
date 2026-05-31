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
  createdAt?: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
}

export type ProjectType =
  | "光伏"
  | "储能"
  | "风电"
  | "充电"
  | "氢能"
  | "综合能源";

export const PROVINCE_COORDS: Record<string, [number, number]> = {
  北京: [116.407394, 39.909235],
  天津: [117.201364, 39.131647],
  河北: [114.515964, 38.042287],
  山西: [112.549654, 37.872354],
  内蒙古: [111.765617, 40.817498],
  辽宁: [123.433611, 41.835769],
  吉林: [125.326575, 43.896168],
  黑龙江: [126.535797, 45.807635],
  上海: [121.473701, 31.230416],
  江苏: [118.76323, 32.06025],
  浙江: [120.153576, 30.287459],
  安徽: [117.284123, 31.861184],
  福建: [119.295616, 26.102439],
  江西: [115.858098, 28.682892],
  山东: [117.020539, 36.66854],
  河南: [113.631419, 34.753439],
  湖北: [114.341862, 30.546557],
  湖南: [112.944237, 28.228881],
  广东: [113.264385, 23.12908],
  海南: [110.19989, 20.04444],
  广西: [108.366943, 22.817318],
  重庆: [106.551556, 29.56301],
  四川: [104.07573, 30.651198],
  贵州: [106.707677, 26.598038],
  云南: [102.710749, 25.045303],
  西藏: [91.117212, 29.647535],
  陕西: [108.954238, 34.265574],
  甘肃: [103.826308, 36.059697],
  青海: [101.779823, 36.617216],
  宁夏: [106.259126, 38.472313],
  新疆: [87.627704, 43.793582],
  台湾: [121.562079, 25.033971],
  香港: [114.177374, 22.303562],
  澳门: [113.543873, 22.198695],
};

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
  createdAt?: string;
  updatedAt?: string;
}

export type BiddingStatus = "报名中" | "已截止";

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
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
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

// ===== 通用数据项（搜索用）=====
export interface SearchableItem {
  id: string;
  title: string;
  summary: string;
  type: string;
}

// ===== AI 分析 =====
export interface AIAnalysisRequest {
  type: "policy" | "project" | "trend" | "bidding" | "resilience";
  content: string;
  context?: string;
  provider?: "ollama" | "nvidia" | "zhipuai";
  model?: string;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
  sentiment: "positive" | "neutral" | "negative";
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

// ===== 页面布局 =====
export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

// ===== 统计卡片 =====
export interface StatCardItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
  color?: string;
  bg?: string;
}

// ===== 工具类型 =====
export type SortKey = "count" | "capacity" | "company";
export type NavPage =
  | "home"
  | "bidding"
  | "awards"
  | "province"
  | "chargers"
  | "dashboard"
  | "ai";
export type AnalysisType =
  | "policy"
  | "project"
  | "trend"
  | "bidding"
  | "resilience";
export type RiskLevel = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "negative";
