/**
 * AI 智能助手服务
 * - 使用外部LLM (NVIDIA/智谱AI)
 * - 支持网站内容抓取
 * - 支持搜索本地数据
 * - 支持工具调用
 */

import { AI_PROVIDERS } from './ai-providers';
import type { Project, BiddingItem, AwardItem } from './types';

const DEFAULT_PROVIDER = 'nvidia';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AIChatRequest {
  message: string;
  provider?: 'nvidia' | 'zhipuai';
  model?: string;
}

export interface AIChatResponse {
  content: string;
  sources?: string[];
  toolCalls?: string[];
}

// ===== 工具定义 =====

const AVAILABLE_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_projects',
      description: '搜索光伏储能项目数据库',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
          province: { type: 'string', description: '省份筛选' },
          type: { type: 'string', description: '项目类型：光伏/储能/风电' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_bidding',
      description: '搜索招标信息',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
          province: { type: 'string', description: '省份筛选' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_awards',
      description: '搜索中标信息',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
          province: { type: 'string', description: '省份筛选' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'fetch_url',
      description: '抓取指定URL的网页内容',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: '要抓取的网页URL' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' },
        },
        required: ['city'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_electricity_price',
      description: '获取指定省份的电价信息',
      parameters: {
        type: 'object',
        properties: {
          province: { type: 'string', description: '省份名称' },
        },
        required: ['province'],
      },
    },
  },
];

// ===== 数据加载 =====

let projectsCache: Project[] = [];
let biddingCache: BiddingItem[] = [];
let awardsCache: AwardItem[] = [];

async function loadData() {
  if (projectsCache.length === 0) {
    try {
      const res = await fetch('/data/projects.json');
      projectsCache = await res.json();
    } catch { projectsCache = []; }
  }
  if (biddingCache.length === 0) {
    try {
      const res = await fetch('/data/bidding.json');
      biddingCache = await res.json();
    } catch { biddingCache = []; }
  }
  if (awardsCache.length === 0) {
    try {
      const res = await fetch('/data/awards.json');
      awardsCache = await res.json();
    } catch { awardsCache = []; }
  }
}

// ===== 工具执行 =====

async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  await loadData();

  switch (name) {
    case 'search_projects': {
      const keyword = String(args.keyword || '').toLowerCase();
      const province = String(args.province || '');
      const type = String(args.type || '');
      let results = projectsCache;
      if (keyword) {
        results = results.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.company?.toLowerCase().includes(keyword) ||
          p.summary?.toLowerCase().includes(keyword)
        );
      }
      if (province) {
        results = results.filter(p => p.province === province);
      }
      if (type) {
        results = results.filter(p => p.type === type);
      }
      return { success: true, data: results.slice(0, 20) };
    }

    case 'search_bidding': {
      const keyword = String(args.keyword || '').toLowerCase();
      const province = String(args.province || '');
      let results = biddingCache;
      if (keyword) {
        results = results.filter(b => 
          b.title.toLowerCase().includes(keyword) ||
          b.summary?.toLowerCase().includes(keyword)
        );
      }
      if (province) {
        results = results.filter(b => b.province === province);
      }
      return { success: true, data: results.slice(0, 20) };
    }

    case 'search_awards': {
      const keyword = String(args.keyword || '').toLowerCase();
      const province = String(args.province || '');
      let results = awardsCache;
      if (keyword) {
        results = results.filter(a => 
          a.title.toLowerCase().includes(keyword) ||
          a.summary?.toLowerCase().includes(keyword)
        );
      }
      if (province) {
        results = results.filter(a => a.province === province);
      }
      return { success: true, data: results.slice(0, 20) };
    }

    case 'fetch_url': {
      const url = String(args.url || '');
      if (!url) return { success: false, error: 'URL不能为空' };
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const resp = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        const text = await resp.text();
        const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch?.[1] || '未知标题';
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const body = bodyMatch?.[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000) || '';
        return { success: true, data: { title, url, content: body } };
      } catch (e) {
        return { success: false, error: `抓取失败: ${e instanceof Error ? e.message : '未知错误'}` };
      }
    }

    case 'get_weather': {
      const city = String(args.city || '北京');
      try {
        const resp = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        const data = await resp.json();
        const current = data.current_condition?.[0] || {};
        return { success: true, data: { city, temp: current.temp_C, weather: current.weatherDesc?.[0]?.value } };
      } catch {
        return { success: false, error: '天气服务暂不可用' };
      }
    }

    case 'get_electricity_price': {
      const province = String(args.province || '北京');
      const prices: Record<string, { peak: number; flat: number; valley: number }> = {
        '北京': { peak: 1.25, flat: 0.82, valley: 0.38 },
        '上海': { peak: 1.20, flat: 0.78, valley: 0.35 },
        '广东': { peak: 1.18, flat: 0.75, valley: 0.32 },
        '江苏': { peak: 1.15, flat: 0.72, valley: 0.30 },
      };
      const p = prices[province] || { peak: 1.05, flat: 0.65, valley: 0.25 };
      return { success: true, data: { province, peak: p.peak, flat: p.flat, valley: p.valley } };
    }

    default:
      return { success: false, error: `未知工具: ${name}` };
  }
}

// ===== LLM 调用 =====

async function callLLM(
  providerKey: string,
  messages: ChatMessage[],
  tools?: unknown[]
): Promise<{ content: string; toolCalls?: unknown[] }> {
  const provider = AI_PROVIDERS[providerKey];
  if (!provider) throw new Error(`Unknown provider: ${providerKey}`);

  const model = providerKey === 'nvidia' ? 'minimaxai/minimax-m2.7' : 'glm-4.7-flash';

  const resp = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.3,
      max_tokens: 8192,
      tools: tools?.length ? tools : undefined,
    }),
    signal: AbortSignal.timeout(120000),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`LLM API error: ${resp.status} - ${err}`);
  }

  const data = await resp.json();
  const msg = data.choices?.[0]?.message;
  return { content: msg?.content || '', toolCalls: msg?.tool_calls };
}

// ===== 主函数 =====

export async function chatWithAI(request: AIChatRequest): Promise<AIChatResponse> {
  const providerKey = request.provider || DEFAULT_PROVIDER;

  const systemPrompt = `你是光伏储能行业的智能助手，专门帮助用户解答关于光伏、储能、风电、充电桩等新能源项目的问题。

你可以使用以下工具：
1. search_projects - 搜索项目数据库
2. search_bidding - 搜索招标信息
3. search_awards - 搜索中标信息
4. fetch_url - 抓取网页内容进行分析
5. get_weather - 获取天气信息
6. get_electricity_price - 获取电价信息

当用户提问时，先判断是否需要调用工具获取信息，然后综合分析回答。
如果用户询问具体项目、招标、中标信息，请先搜索数据库。
如果用户提到具体网址，请使用fetch_url抓取内容。
回答要专业、准确，用中文。`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: request.message },
  ];

  try {
    // 第一次调用 - 可能触发工具
    const response = await callLLM(providerKey, messages, AVAILABLE_TOOLS);

    let finalContent = response.content;

    // 如果有工具调用，执行工具
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolResults: string[] = [];
      const sources: string[] = [];

      for (const tc of response.toolCalls as Array<{ function: { name: string; arguments: string } }>) {
        try {
          const args = JSON.parse(tc.function.arguments || '{}');
          const result = await executeTool(tc.function.name, args);
          toolResults.push(`[${tc.function.name}] ${JSON.stringify(result.data || result.error)}`);
          if (result.data && tc.function.name.includes('search')) {
            const arr = result.data as Array<{ name?: string; title?: string }>;
            sources.push(...arr.slice(0, 3).map(item => item.name || item.title || '').filter(Boolean));
          }
        } catch (e) {
          toolResults.push(`[${tc.function.name}] 执行失败: ${e}`);
        }
      }

      if (toolResults.length > 0) {
        // 第二次调用 - 用工具结果回答
        const followUpMessages = [
          ...messages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: `以下是工具返回的信息：\n${toolResults.join('\n')}\n\n请根据这些信息回答用户问题。` },
        ];
        const followUp = await callLLM(providerKey, followUpMessages);
        finalContent = followUp.content;
      }

      return { content: finalContent, sources: sources.filter(Boolean) };
    }

    return { content: finalContent };
  } catch (error) {
    return {
      content: `抱歉，服务暂时不可用：${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}