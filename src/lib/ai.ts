/**
 * AI 分析服务 - 接入 Ollama LLM 实现智能分析
 * 
 * 功能:
 * 1. 政策智能解读 - 分析政策文件、提取要点、影响评估
 * 2. 项目评估 - 分析项目信息、投资价值、风险评估
 * 3. 趋势预测 - 行业趋势分析、市场预测
 * 4. 招标分析 - 招标项目解读、竞争态势分析
 * 5. 光伏发电预测 - 调用 PatchTST 模型 API
 */

import { AI_PROMPTS } from './constants';
import type { AIAnalysisRequest, AIAnalysisResult, ForecastDataPoint, ForecastResult } from './types';

// ===== Ollama 配置 =====

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const FORECAST_API_URL = process.env.FORECAST_API_URL || 'http://localhost:8001';

// ===== Ollama LLM 调用 =====

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

async function callOllama(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  const body: OllamaGenerateRequest = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
    options: {
      temperature: options?.temperature ?? 0.3,
      num_predict: options?.maxTokens ?? 2000,
    },
  };

  const resp = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });

  if (!resp.ok) {
    throw new Error(`Ollama API error: ${resp.status} ${resp.statusText}`);
  }

  const data: OllamaGenerateResponse = await resp.json();
  return data.response;
}

// ===== AI 分析接口 =====

/**
 * 检查 Ollama 服务是否可用
 */
export async function checkOllamaHealth(): Promise<{ available: boolean; models: string[]; error?: string }> {
  try {
    const resp = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) {
      return { available: false, models: [], error: `API ${resp.status}` };
    }
    const data = await resp.json();
    const models: string[] = (data.models || []).map((m: any) => m.name);
    return { available: true, models };
  } catch (error) {
    return { available: false, models: [], error: error instanceof Error ? error.message : '连接失败' };
  }
}

/**
 * 执行 AI 分析
 */
export async function performAIAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
  const template = AI_PROMPTS[request.type];
  const prompt = template.replace('{content}', request.content || '');

  try {
    const response = await callOllama(prompt, { temperature: 0.3 });

    // 解析 LLM 返回的文本，提取结构化信息
    return parseAIResponse(response);
  } catch (error) {
    // 如果 Ollama 不可用，返回基于规则的降级分析
    return fallbackAnalysis(request);
  }
}

/**
 * 解析 AI 响应为结构化结果
 */
function parseAIResponse(response: string): AIAnalysisResult {
  const lines = response.split('\n').filter(l => l.trim());

  // 提取要点
  const keyPoints: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\d+[.、]\s*(.+)/);
    if (m && m[1].length > 5) {
      keyPoints.push(m[1].trim());
    }
  }

  // 提取风险级别
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (/高风险|风险较大|风险较高/.test(response)) riskLevel = 'high';
  else if (/风险较低|低风险|风险较小/.test(response)) riskLevel = 'low';

  // 提取建议
  const recommendations: string[] = [];
  const recSection = response.match(/建议[：:]?\s*([\s\S]*?)(?=风险|$)/);
  if (recSection) {
    for (const line of recSection[1].split('\n')) {
      const m = line.match(/^[-*]\s*(.+)/);
      if (m) recommendations.push(m[1].trim());
    }
  }

  // 情感分析
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (/利好|积极|增长|机遇|发展前景/.test(response)) sentiment = 'positive';
  else if (/利空|消极|下降|风险|挑战/.test(response)) sentiment = 'negative';

  return {
    summary: lines.slice(0, 3).join(' ').slice(0, 300),
    keyPoints: keyPoints.slice(0, 5),
    riskLevel,
    recommendations: recommendations.slice(0, 5),
    sentiment,
  };
}

/**
 * 降级分析 - 当 Ollama 不可用时基于关键词的规则分析
 */
function fallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
  const content = request.content || '';
  const keyPoints: string[] = [];

  // 基于关键词提取要点
  if (/光伏/.test(content)) keyPoints.push('涉及光伏产业相关内容');
  if (/储能/.test(content)) keyPoints.push('涉及储能技术或项目');
  if (/招标|采购/.test(content)) keyPoints.push('涉及招标采购流程');
  if (/投资|金额|亿元/.test(content)) keyPoints.push('涉及投资金额信息');
  if (/并网|投产/.test(content)) keyPoints.push('项目处于并网或投产阶段');
  if (/政策|规划/.test(content)) keyPoints.push('涉及政策法规或规划');

  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (/风险|不确定|变动/.test(content)) riskLevel = 'high';
  else if (/稳定|确定|成熟/.test(content)) riskLevel = 'low';

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (/增长|利好|发展|机遇/.test(content)) sentiment = 'positive';
  else if (/下降|利空|挑战|困难/.test(content)) sentiment = 'negative';

  return {
    summary: 'AI服务暂不可用，以下为基于规则的关键词分析结果。',
    keyPoints,
    riskLevel,
    recommendations: ['建议启动AI服务获取更深入分析', '可关注相关政策的最新动态', '注意行业技术路线变化'],
    sentiment,
  };
}

// ===== 光伏发电预测 =====

export async function getPVForecast(
  historyData: Array<{
    pv_power: number;
    ghi: number;
    dni: number;
    dhi: number;
    temp_c: number;
    wind_speed: number;
    cloud_cover: number;
  }>,
  capacityKw: number = 100,
): Promise<ForecastResult> {
  try {
    const resp = await fetch(`${FORECAST_API_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: historyData,
        site_id: 'default',
        capacity_kw: capacityKw,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      throw new Error(`Forecast API error: ${resp.status}`);
    }

    const data = await resp.json();
    return {
      predictions: data.predictions || [],
      total_generation_kwh: data.total_generation_kwh || 0,
      peak_power_kw: data.peak_power_kw || 0,
      capacity_factor: data.capacity_factor || 0,
    };
  } catch (error) {
    // 降级：返回基于简单日历模型的预测
    return generateSimpleForecast(historyData, capacityKw);
  }
}

/**
 * 简单日历预测模型 - 降级方案
 */
function generateSimpleForecast(
  historyData: Array<{ pv_power: number; ghi: number; temp_c: number; cloud_cover: number }>,
  capacityKw: number,
): ForecastResult {
  const predictions: ForecastDataPoint[] = [];
  const recentPower = historyData.slice(-96).map(d => d.pv_power);
  const avgPower = recentPower.length > 0 ? recentPower.reduce((a, b) => a + b, 0) / recentPower.length : 0;

  const now = new Date();
  let totalKwh = 0;
  let peakKw = 0;

  for (let i = 0; i < 96; i++) {
    const ts = new Date(now.getTime() + i * 15 * 60 * 1000);
    const hour = ts.getHours() + ts.getMinutes() / 60;

    // 简单正弦模型：6:00-18:00有发电
    let power = 0;
    if (hour >= 6 && hour <= 18) {
      const solarAngle = Math.sin(Math.PI * (hour - 6) / 12);
      power = capacityKw * solarAngle * 0.85;
    }

    totalKwh += power * 0.25; // 15min = 0.25h
    if (power > peakKw) peakKw = power;

    predictions.push({
      timestamp: ts.toISOString(),
      predicted_power_kw: Math.round(power * 100) / 100,
      is_daytime: hour >= 6 && hour <= 18,
    });
  }

  return {
    predictions,
    total_generation_kwh: Math.round(totalKwh * 100) / 100,
    peak_power_kw: Math.round(peakKw * 100) / 100,
    capacity_factor: totalKwh / (capacityKw * 24),
  };
}

// ===== 智能搜索 =====

export interface SmartSearchResult {
  query: string;
  results: Array<{
    id: string;
    title: string;
    summary: string;
    relevance: number;
    type: string;
  }>;
  aiSummary?: string;
}

/**
 * 智能搜索 - 结合关键词搜索 + AI 摘要
 */
export async function smartSearch(
  query: string,
  allData: Array<{ id: string; title: string; summary: string; type: string }>,
  topK: number = 10,
): Promise<SmartSearchResult> {
  // 1. 关键词匹配
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const scored = allData.map(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += 10;
      // 标题匹配加权
      if (item.title.toLowerCase().includes(kw)) score += 5;
    }
    return { ...item, relevance: score };
  });

  const results = scored
    .filter(s => s.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, topK);

  // 2. AI 摘要（如果可用）
  let aiSummary: string | undefined;
  if (results.length > 0) {
    try {
      const context = results.slice(0, 5).map(r => r.title).join('\n');
      const response = await callOllama(
        `用一段话总结以下光伏储能相关信息的关键要点：\n\n${context}`,
        { temperature: 0.3, maxTokens: 300 },
      );
      aiSummary = response.trim();
    } catch {
      // AI 不可用，跳过摘要
    }
  }

  return { query, results, aiSummary };
}
