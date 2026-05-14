/**
 * AI 分析服务 - 基于 NVIDIA NIM + MiniMax M2.7
 *
 * 功能:
 * 1. 政策智能解读 - 分析政策文件、提取要点、影响评估
 * 2. 项目评估 - 分析项目信息、投资价值、风险评估
 * 3. 趋势预测 - 行业趋势分析、市场预测
 * 4. 招标分析 - 招标项目解读、竞争态势分析
 * 5. 能源韧性评估 - 灾害响应/气候缓解 (核心功能)
 * 6. 光伏发电预测 - 调用 PatchTST 模型 API
 * 7. Function Calling - 天气/电价实时数据集成
 */

import { AI_PROMPTS, RESILIENCE_PROMPTS } from './constants';
import type { AIAnalysisRequest, AIAnalysisResult, ForecastDataPoint, ForecastResult } from './types';

// ===== NVIDIA NIM 配置 =====

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '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';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const NVIDIA_MODEL = 'minimaxai/minimax-m2.7';
const FORECAST_API_URL = process.env.FORECAST_API_URL || 'http://localhost:8001';

// ===== NVIDIA NIM OpenAI-Compatible Chat API =====

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

interface ChatResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

// ===== Function Calling 工具定义 =====

const AVAILABLE_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: '获取指定城市的当前天气信息，用于评估光伏发电条件和灾害风险',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称，如"北京"、"上海"' },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_electricity_price',
      description: '获取指定省份的当前电价信息，用于评估储能项目经济性',
      parameters: {
        type: 'object',
        properties: {
          province: { type: 'string', description: '省份名称' },
        },
        required: ['province'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_pv_forecast',
      description: '获取未来24小时光伏发电功率预测，基于PatchTST深度学习模型',
      parameters: {
        type: 'object',
        properties: {
          capacity_kw: { type: 'number', description: '装机容量(kW)' },
        },
        required: ['capacity_kw'],
      },
    },
  },
];

// ===== Tool 执行器 =====

async function executeToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_weather': {
      const city = String(args.city || '北京');
      try {
        const resp = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
          signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'SolarResilience/1.0' },
        });
        if (!resp.ok) return JSON.stringify({ error: '天气数据获取失败' });
        const data = await resp.json();
        const current = data.current_condition?.[0] || {};
        return JSON.stringify({
          city,
          temp_c: current.temp_C,
          humidity: current.humidity,
          weather: current.weatherDesc?.[0]?.value || '未知',
          wind_speed: current.windspeedKmph,
          cloud_cover: current.cloudcover,
          visibility: current.visibility,
          uv_index: current.uvIndex,
          disaster_risk: assessDisasterRisk(current),
        });
      } catch {
        return JSON.stringify({ city, error: '天气API不可用', offline: true });
      }
    }
    case 'get_electricity_price': {
      const province = String(args.province || '北京');
      const prices: Record<string, { peak: number; flat: number; valley: number }> = {
        '北京': { peak: 1.25, flat: 0.82, valley: 0.38 },
        '上海': { peak: 1.20, flat: 0.78, valley: 0.35 },
        '广东': { peak: 1.18, flat: 0.75, valley: 0.32 },
        '江苏': { peak: 1.15, flat: 0.72, valley: 0.30 },
        '山东': { peak: 1.10, flat: 0.68, valley: 0.28 },
      };
      const p = prices[province] || { peak: 1.05, flat: 0.65, valley: 0.25 };
      return JSON.stringify({
        province,
        peak_price: p.peak,
        flat_price: p.flat,
        valley_price: p.valley,
        unit: '元/kWh',
        storage_roi_estimate: ((p.peak - p.valley) * 365 * 2).toFixed(0) + ' 元/kWh/年',
      });
    }
    case 'get_pv_forecast': {
      const capacityKw = Number(args.capacity_kw) || 100;
      try {
        const result = await getPVForecast([], capacityKw);
        return JSON.stringify({
          total_generation_kwh: result.total_generation_kwh,
          peak_power_kw: result.peak_power_kw,
          capacity_factor: (result.capacity_factor * 100).toFixed(1) + '%',
        });
      } catch {
        return JSON.stringify({ error: '预测服务不可用', capacity_kw: capacityKw });
      }
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

function assessDisasterRisk(weather: Record<string, unknown>): { level: string; risks: string[] } {
  const risks: string[] = [];
  const windSpeed = parseInt(String(weather.windspeedKmph || '0'));
  const visibility = parseInt(String(weather.visibility || '10'));
  const uvIndex = parseInt(String(weather.uvIndex || '5'));

  if (windSpeed > 60) risks.push('大风风险：可能损坏光伏面板');
  if (visibility < 2) risks.push('低能见度：沙尘/雾霾影响发电效率');
  if (uvIndex > 8) risks.push('极端紫外线：面板过热风险');
  const desc = Array.isArray(weather.weatherDesc) ? (weather.weatherDesc as Array<{ value: string }>) : [];
  if (desc[0]?.value?.includes('thunder')) risks.push('雷暴风险：需断开逆变器');

  return {
    level: risks.length === 0 ? 'low' : risks.length <= 2 ? 'medium' : 'high',
    risks,
  };
}

// ===== 核心 NVIDIA NIM 调用函数 =====

async function callNvidiaChat(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number; useTools?: boolean },
): Promise<ChatResponse> {
  const body: Record<string, unknown> = {
    model: NVIDIA_MODEL,
    messages,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 2000,
    stream: false,
  };

  if (options?.useTools) {
    body.tools = AVAILABLE_TOOLS;
    body.tool_choice = 'auto';
  }

  const resp = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`NVIDIA NIM API error: ${resp.status} ${resp.statusText} ${errText}`);
  }

  return await resp.json() as ChatResponse;
}

// ===== AI 分析接口 =====

/**
 * 检查 NVIDIA NIM 服务是否可用
 */
export async function checkAIHealth(): Promise<{ available: boolean; model: string; error?: string }> {
  try {
    const resp = await fetch(`${NVIDIA_BASE_URL}/models`, {
      headers: { 'Authorization': `Bearer ${NVIDIA_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return { available: false, model: NVIDIA_MODEL, error: `API ${resp.status}` };
    return { available: true, model: NVIDIA_MODEL };
  } catch (error) {
    return { available: false, model: NVIDIA_MODEL, error: error instanceof Error ? error.message : '连接失败' };
  }
}

/** 兼容旧调用 */
export async function checkOllamaHealth() {
  const health = await checkAIHealth();
  return {
    available: health.available,
    models: health.available ? [NVIDIA_MODEL] : [],
    gemma4Detected: false,
    error: health.error,
  };
}

/**
 * 执行 AI 分析 (NVIDIA NIM MiniMax M2.7 + Function Calling)
 */
export async function performAIAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
  const template = request.type === 'resilience'
    ? RESILIENCE_PROMPTS[request.type as keyof typeof RESILIENCE_PROMPTS] || AI_PROMPTS.policy
    : AI_PROMPTS[request.type as keyof typeof AI_PROMPTS] || AI_PROMPTS.policy;
  const prompt = template.replace('{content}', request.content || '');

  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是光伏储能行业的AI分析师，基于MiniMax M2.7模型运行。你可以调用工具获取实时天气、电价和发电预测数据来增强分析质量。请用中文回答。',
      },
      { role: 'user', content: prompt },
    ];

    const response = await callNvidiaChat(messages, {
      temperature: 0.3,
      useTools: true,
    });

    const choice = response.choices?.[0];
    if (!choice) throw new Error('No response from AI');

    // 如果模型调用了工具，执行工具并追加结果
    let finalContent = choice.message.content;
    const toolCalls = choice.message.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      const toolResults: string[] = [];
      for (const tc of toolCalls) {
        try {
          const args = JSON.parse(tc.function.arguments || '{}');
          const result = await executeToolCall(tc.function.name, args);
          toolResults.push(`[工具 ${tc.function.name} 结果]: ${result}`);
        } catch { /* skip failed tool calls */ }
      }

      if (toolResults.length > 0) {
        const followUp = await callNvidiaChat([
          ...messages,
          { role: 'assistant', content: choice.message.content },
          { role: 'user', content: `以下是通过工具获取的实时数据：\n${toolResults.join('\n')}\n\n请结合这些实时数据，给出更精准的分析。` },
        ], { temperature: 0.3 });

        finalContent = followUp.choices?.[0]?.message?.content || finalContent;
      }
    }

    return parseAIResponse(finalContent);
  } catch (error) {
    return fallbackAnalysis(request);
  }
}

/**
 * 能源韧性评估 - 核心功能
 * 结合实时天气+电价+预测数据，评估能源系统韧性
 */
export async function assessEnergyResilience(
  location: string,
  projectInfo?: string,
): Promise<AIAnalysisResult & { realtimeData?: { weather: unknown; electricity: unknown } }> {
  try {
    // 先获取实时数据
    const [weatherStr, priceStr] = await Promise.all([
      executeToolCall('get_weather', { city: location }),
      executeToolCall('get_electricity_price', { province: location }),
    ]);

    const weather = JSON.parse(weatherStr);
    const electricity = JSON.parse(priceStr);

    const prompt = RESILIENCE_PROMPTS.resilience
      .replace('{location}', location)
      .replace('{weather_data}', weatherStr)
      .replace('{price_data}', priceStr)
      .replace('{project_info}', projectInfo || '无额外项目信息');

    const response = await callNvidiaChat([
      { role: 'system', content: '你是一位能源韧性评估专家，专注于光伏储能系统的灾害响应和气候适应能力评估。基于MiniMax M2.7模型运行。' },
      { role: 'user', content: prompt },
    ], { temperature: 0.3, useTools: true });

    const choice = response.choices?.[0];
    if (!choice) throw new Error('No response');

    const result = parseAIResponse(choice.message.content);

    return {
      ...result,
      realtimeData: { weather, electricity },
    };
  } catch (error) {
    return {
      summary: '能源韧性评估服务暂不可用，请检查NVIDIA NIM API配置。',
      keyPoints: ['需要NVIDIA NIM API Key支持', 'MiniMax M2.7模型提供分析能力'],
      riskLevel: 'medium',
      recommendations: ['检查NVIDIA_API_KEY环境变量', '确认NVIDIA NIM服务可用'],
      sentiment: 'neutral',
    };
  }
}

/**
 * 解析 AI 响应为结构化结果
 */
function parseAIResponse(response: string): AIAnalysisResult {
  const lines = response.split('\n').filter(l => l.trim());

  const keyPoints: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\d+[.、)\-]\s*(.+)/);
    if (m && m[1].length > 5) keyPoints.push(m[1].trim());
  }

  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (/高风险|风险较大|风险较高|严重/.test(response)) riskLevel = 'high';
  else if (/风险较低|低风险|风险较小|安全/.test(response)) riskLevel = 'low';

  const recommendations: string[] = [];
  const recSection = response.match(/建议[：:]?\s*([\s\S]*?)(?=风险|$)/);
  if (recSection) {
    for (const line of recSection[1].split('\n')) {
      const m = line.match(/^[-*]\s*(.+)/);
      if (m) recommendations.push(m[1].trim());
    }
  }

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (/利好|积极|增长|机遇|发展前景|韧性高/.test(response)) sentiment = 'positive';
  else if (/利空|消极|下降|风险|挑战|脆弱/.test(response)) sentiment = 'negative';

  return {
    summary: lines.slice(0, 3).join(' ').slice(0, 300),
    keyPoints: keyPoints.slice(0, 5),
    riskLevel,
    recommendations: recommendations.slice(0, 5),
    sentiment,
  };
}

/**
 * 降级分析 - 当 AI API 不可用时基于关键词的规则分析
 */
function fallbackAnalysis(request: AIAnalysisRequest): AIAnalysisResult {
  const content = request.content || '';
  const keyPoints: string[] = [];

  if (/光伏/.test(content)) keyPoints.push('涉及光伏产业相关内容');
  if (/储能/.test(content)) keyPoints.push('涉及储能技术或项目');
  if (/招标|采购/.test(content)) keyPoints.push('涉及招标采购流程');
  if (/投资|金额|亿元/.test(content)) keyPoints.push('涉及投资金额信息');
  if (/并网|投产/.test(content)) keyPoints.push('项目处于并网或投产阶段');
  if (/政策|规划/.test(content)) keyPoints.push('涉及政策法规或规划');
  if (/灾害|台风|暴雨|干旱/.test(content)) keyPoints.push('涉及自然灾害风险');

  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (/风险|不确定|变动|灾害/.test(content)) riskLevel = 'high';
  else if (/稳定|确定|成熟/.test(content)) riskLevel = 'low';

  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (/增长|利好|发展|机遇/.test(content)) sentiment = 'positive';
  else if (/下降|利空|挑战|困难/.test(content)) sentiment = 'negative';

  return {
    summary: 'AI服务暂不可用（降级模式）。NVIDIA NIM + MiniMax M2.7 提供云端AI分析能力。以下为基于规则的关键词分析结果。',
    keyPoints,
    riskLevel,
    recommendations: ['检查NVIDIA NIM API连接', '确认API Key有效', '可关注相关政策的最新动态'],
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
      body: JSON.stringify({ history: historyData, site_id: 'default', capacity_kw: capacityKw }),
      signal: AbortSignal.timeout(30000),
    });
    if (!resp.ok) throw new Error(`Forecast API error: ${resp.status}`);
    const data = await resp.json();
    return {
      predictions: data.predictions || [],
      total_generation_kwh: data.total_generation_kwh || 0,
      peak_power_kw: data.peak_power_kw || 0,
      capacity_factor: data.capacity_factor || 0,
    };
  } catch {
    return generateSimpleForecast(historyData, capacityKw);
  }
}

function generateSimpleForecast(
  historyData: Array<{ pv_power: number; ghi: number; temp_c: number; cloud_cover: number }>,
  capacityKw: number,
): ForecastResult {
  const predictions: ForecastDataPoint[] = [];
  const now = new Date();
  let totalKwh = 0;
  let peakKw = 0;

  for (let i = 0; i < 96; i++) {
    const ts = new Date(now.getTime() + i * 15 * 60 * 1000);
    const hour = ts.getHours() + ts.getMinutes() / 60;
    let power = 0;
    if (hour >= 6 && hour <= 18) {
      const solarAngle = Math.sin(Math.PI * (hour - 6) / 12);
      power = capacityKw * solarAngle * 0.85;
    }
    totalKwh += power * 0.25;
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
  results: Array<{ id: string; title: string; summary: string; relevance: number; type: string }>;
  aiSummary?: string;
}

export async function smartSearch(
  query: string,
  allData: Array<{ id: string; title: string; summary: string; type: string }>,
  topK: number = 10,
): Promise<SmartSearchResult> {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const scored = allData.map(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += 10;
      if (item.title.toLowerCase().includes(kw)) score += 5;
    }
    return { ...item, relevance: score };
  });

  const results = scored.filter(s => s.relevance > 0).sort((a, b) => b.relevance - a.relevance).slice(0, topK);

  let aiSummary: string | undefined;
  if (results.length > 0) {
    try {
      const context = results.slice(0, 5).map(r => r.title).join('\n');
      const response = await callNvidiaChat([
        { role: 'system', content: '用一段话总结以下光伏储能相关信息的关键要点。' },
        { role: 'user', content: context },
      ], { temperature: 0.3, maxTokens: 300 });
      aiSummary = response.choices?.[0]?.message?.content?.trim();
    } catch { /* AI 不可用 */ }
  }

  return { query, results, aiSummary };
}
