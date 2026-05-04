export interface AIModel {
  name: string;
  tool_call: boolean;
  limit?: {
    context: number;
    output: number;
  };
}

export interface AIProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  models: Record<string, AIModel>;
  headers?: Record<string, string>;
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  ollama: {
    name: 'Ollama (本地)',
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    apiKey: '',
    models: {
      'gemma3:27b': {
        name: 'Gemma 3 27B',
        tool_call: true,
        limit: { context: 128000, output: 8192 },
      },
      'qwen2.5:14b': {
        name: 'Qwen 2.5 14B',
        tool_call: true,
        limit: { context: 128000, output: 8192 },
      },
    },
  },
  nvidia: {
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || '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',
    models: {
      'minimaxai/minimax-m2.7': {
        name: 'MiniMax M2.7',
        tool_call: true,
        limit: { context: 1000000, output: 8192 },
      },
    },
  },
  zhipuai: {
    name: '智谱AI (GLM)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: process.env.ZHIPUAI_API_KEY || 'd68afc047d2b47179fccca96e52ca57c.XDODZVHpC70KMfos',
    models: {
      'glm-4.7-flash': {
        name: 'GLM-4.7-Flash',
        tool_call: true,
        limit: { context: 1000000, output: 8192 },
      },
      'glm-4-plus': {
        name: 'GLM-4-Plus',
        tool_call: true,
        limit: { context: 1000000, output: 8192 },
      },
    },
  },
};

export const DEFAULT_PROVIDER = process.env.DEFAULT_AI_PROVIDER || 'ollama';

export function getProvider(providerKey: string): AIProvider | undefined {
  return AI_PROVIDERS[providerKey];
}

export function getDefaultProvider(): AIProvider {
  return AI_PROVIDERS[DEFAULT_PROVIDER] || AI_PROVIDERS.ollama;
}