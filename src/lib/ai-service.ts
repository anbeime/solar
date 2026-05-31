/**
 * AI 智能助手服务
 * - 使用外部LLM (智谱AI/NVIDIA)
 * - 支持网站内容抓取
 * - 支持搜索本地数据
 * - 支持工具调用
 * - 增强错误处理和日志
 */

import { AI_PROVIDERS } from './ai-providers';
import type { Project, BiddingItem, AwardItem } from './types';

// 默认优先使用智谱AI (更稳定)，NVIDIA作为备选
const DEFAULT_PROVIDER = 'zhipuai';
const FALLBACK_PROVIDER = 'nvidia';

// 日志辅助
function log(level: 'info' | 'warn' | 'error', msg: string, data?: unknown) {
  const prefix = `[AI-Service ${new Date().toISOString()}]`;
  const payload = data ? ` ${JSON.stringify(data).slice(0, 500)}` : '';
  console.log(`${prefix} [${level.toUpperCase()}] ${msg}${payload}`);
}

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
      name: 'search_qa',
      description: '搜索问答知识库（推荐优先使用）- 包含最新的光伏储能项目、招标、中标等结构化问答数据，覆盖行业动态和热点话题',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: '搜索关键词' },
          category: { type: 'string', description: '分类筛选：project/bidding/award/charger/industry' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_projects',
      description: '搜索光伏储能项目数据库（原始数据）',
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
let qaCache: Array<{ question: string; answer: string; category: string; tags: string[]; source: string; date: string }> = [];

interface QAItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  source: string;
  date: string;
}

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
  // 加载问答知识库
  if (qaCache.length === 0) {
    try {
      const res = await fetch('/data/qa-knowledge.json');
      qaCache = await res.json();
    } catch { qaCache = []; }
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

  // 检查 API Key 是否配置
  if (!provider.apiKey) {
    log('error', `API Key 未配置: ${providerKey}`);
    throw new Error(`API Key 未配置，请在 Vercel 环境变量中设置 ${providerKey === 'nvidia' ? 'NVIDIA_API_KEY' : 'ZHIPUAI_API_KEY'}`);
  }

  // 模型选择：支持多模型 fallback
  let models: string[];
  if (providerKey === 'nvidia') {
    models = ['meta/llama-3.1-70b-instruct', 'minimaxai/minimax-m2.7'];
  } else {
    models = ['glm-4-flash', 'glm-4-plus', 'glm-4.7-flash'];
  }
  const model = models[0];

  log('info', `调用LLM: provider=${providerKey}, model=${model}, messages=${messages.length}, hasTools=${!!tools?.length}`);

  const reqBody = {
    model,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    temperature: 0.3,
    max_tokens: 4096,
    tools: tools?.length ? tools : undefined,
  };

  try {
    const resp = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(reqBody),
      signal: AbortSignal.timeout(60000),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      log('error', `LLM API 错误: ${providerKey}/${model} status=${resp.status}`, { error: errText.slice(0, 300) });
      throw new Error(`LLM API (${providerKey}) 错误 ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const data = await resp.json();
    const msg = data.choices?.[0]?.message;
    const content = msg?.content || '';
    const toolCalls = msg?.tool_calls;

    // 警告空内容
    if (!content && !toolCalls) {
      log('warn', `LLM 返回空内容: ${providerKey}/${model}`, { rawResponse: JSON.stringify(data).slice(0, 300) });
    } else {
      log('info', `LLM 响应成功: ${providerKey}/${model} contentLen=${content.length} hasToolCalls=${!!toolCalls?.length}`);
    }

    return { content, toolCalls };
  } catch (e) {
    if (e instanceof Error && e.message.includes('API Key')) throw e;
    log('error', `LLM 调用异常: ${providerKey}/${model}`, { error: e instanceof Error ? e.message : String(e) });
    throw e;
  }
}

/**
 * 带 fallback 的 LLM 调用 - 主 provider 失败时自动切换
 */
async function callLLMWithFallback(
  primaryProvider: string,
  messages: ChatMessage[],
  tools?: unknown[]
): Promise<{ content: string; toolCalls?: unknown[]; usedProvider: string }> {
  // 先尝试主 provider
  try {
    const result = await callLLM(primaryProvider, messages, tools);
    return { ...result, usedProvider: primaryProvider };
  } catch (e) {
    log('warn', `主 Provider ${primaryProvider} 失败，尝试 fallback...`, { error: e instanceof Error ? e.message : String(e) });
  }

  // 尝试 fallback provider
  if (primaryProvider !== FALLBACK_PROVIDER) {
    try {
      const result = await callLLM(FALLBACK_PROVIDER, messages, tools);
      log('info', `Fallback Provider ${FALLBACK_PROVIDER} 成功`);
      return { ...result, usedProvider: FALLBACK_PROVIDER };
    } catch (fallbackErr) {
      log('error', `Fallback Provider 也失败`, { error: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr) });
    }
  }

  // 都失败，抛出原始错误
  throw new Error(`所有 AI 服务均不可用。请检查环境变量 ZHIPUAI_API_KEY / NVIDIA_API_KEY 是否正确配置。`);
}

// ===== 主函数 =====

export async function chatWithAI(request: AIChatRequest): Promise<AIChatResponse> {
  const providerKey = request.provider || DEFAULT_PROVIDER;
  log('info', `收到聊天请求: provider=${providerKey}, messageLen=${request.message?.length || 0}`);

  const systemPrompt = `你是「光伏储能地图站」的智能问答助手，专门帮助用户解答关于光伏、储能、风电、充电桩等新能源项目和行业的问题。

## 你的能力
1. **搜索问答知识库** (search_qa) - 最重要！包含最新的项目、招标、中标等结构化问答数据
2. 搜索原始项目数据库（光伏/储能/风电项目）
3. 搜索招标和中标信息
4. 抓取网页内容进行分析
5. 查询天气和电价信息
6. 回答行业知识问题

## 回答规范
- **必须用中文回答**，回答不能为空
- 如果搜索到数据，以清晰的列表或表格形式展示
- 如果没有搜到相关数据，坦诚告知并给出建议
- 专业术语要解释清楚
- 回答结构化，分点陈述
- 保持友好专业的语气

## 工具使用策略（重要！）
- **用户问任何关于项目/招标/中标/行业动态的问题 → 必须先调用 search_qa 工具**
- search_qa 没有结果时 → 再用 search_projects/search_bidding/search_awards
- 用户给网址 → 用 fetch_url 抓取
- 用户问纯行业知识（如技术原理、政策解读）→ 可直接基于你的知识回答
- 用户问天气/电价 → 调用对应工具`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: request.message },
  ];

  try {
    // 第一次调用 - 可能触发工具（带 fallback）
    const response = await callLLMWithFallback(providerKey, messages, AVAILABLE_TOOLS);
    log('info', `首次 LLM 调用完成: provider=${response.usedProvider}, contentLen=${response.content?.length || 0}, hasTools=${!!response.toolCalls?.length}`);

    let finalContent = response.content;

    // 如果有工具调用，执行工具
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolResults: string[] = [];
      const sources: string[] = [];

      for (const tc of response.toolCalls as Array<{ function: { name: string; arguments: string } }>) {
        try {
          const args = JSON.parse(tc.function.arguments || '{}');
          log('info', `执行工具: ${tc.function.name}`, args);
          const result = await executeTool(tc.function.name, args);
          const resultStr = JSON.stringify(result.data || result.error);
          toolResults.push(`[${tc.function.name}] ${resultStr.slice(0, 2000)}`);
          if (result.data && tc.function.name.includes('search')) {
            const arr = result.data as Array<{ name?: string; title?: string }>;
            sources.push(...arr.slice(0, 3).map(item => item.name || item.title || '').filter(Boolean));
          }
        } catch (e) {
          log('warn', `工具执行失败: ${tc.function.name}`, { error: e instanceof Error ? e.message : String(e) });
          toolResults.push(`[${tc.function.name}] 执行失败: ${e}`);
        }
      }

      if (toolResults.length > 0) {
        // 第二次调用 - 用工具结果回答（也带 fallback）
        const followUpMessages: ChatMessage[] = [
          ...messages,
          { role: 'assistant' as const, content: response.content || '(正在查询数据...)' },
          { role: 'user' as const, content: `以下是工具返回的信息：\n${toolResults.join('\n')}\n\n请根据这些信息详细回答用户的问题。如果数据为空或没有相关信息，请直接基于你的专业知识回答。回答不能为空。` },
        ];
        const followUp = await callLLMWithFallback(providerKey, followUpMessages);
        finalContent = followUp.content;
        log('info', `二次 LLM 调用完成: contentLen=${finalContent?.length || 0}`);
      }

      // 最终内容检查
      if (!finalContent || finalContent.trim().length === 0) {
        finalContent = '抱歉，暂时无法获取详细信息。您可以尝试换个方式提问，或者稍后再试。';
        log('warn', '最终内容为空，使用 fallback 回复');
      }

      return { content: finalContent, sources: sources.filter(Boolean) };
    }

    // 无工具调用时也要检查内容
    if (!finalContent || finalContent.trim().length === 0) {
      finalContent = '我已收到您的问题，但暂时无法生成回复。请确认 API Key 配置正确后重试。';
      log('warn', '无工具调用但内容为空');
    }

    return { content: finalContent };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    log('error', `chatWithAI 异常: ${errMsg}`);
    return {
      content: `抱歉，AI 服务暂时不可用。原因：${errMsg}\n\n请检查：\n1. Vercel 环境变量中是否配置了 ZHIPUAI_API_KEY 或 NVIDIA_API_KEY\n2. API Key 是否有效且有余额`,
    };
  }
}