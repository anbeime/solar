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
  nvidia: {
    name: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || '',
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
    apiKey: process.env.ZHIPUAI_API_KEY || '',
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

export const DEFAULT_PROVIDER = 'nvidia';

export function getProvider(providerKey: string): AIProvider | undefined {
  return AI_PROVIDERS[providerKey];
}

export function getDefaultProvider(): AIProvider {
  return AI_PROVIDERS[DEFAULT_PROVIDER] || AI_PROVIDERS.nvidia;
}