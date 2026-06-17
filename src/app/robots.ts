import { MetadataRoute } from 'next';

/**
 * Next.js App Router robots.ts
 * 注意：public/robots.txt 优先级高于本文件，两者保持同步。
 */
export default function robots(): MetadataRoute.Robots {
  const AI_BOTS = [
    // OpenAI
    'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
    // Anthropic
    'ClaudeBot', 'Claude-Web', 'anthropic-ai',
    // Google
    'Google-Extended',
    // Perplexity
    'PerplexityBot',
    // Common Crawl
    'CCBot',
    // 字节 / 豆包
    'Bytespider',
    // 百度 / 文心
    'Baiduspider', 'Baiduspider-render',
    // 阿里 / 通义 / 夸克
    'YisouSpider',
    // 360 智脑
    '360Spider', 'HaosouSpider',
    // 搜狗
    'Sogou web spider', 'Sogou inst spider',
    // Apple
    'Applebot', 'Applebot-Extended',
    // 必应 / Copilot
    'bingbot',
    // 其他 AI
    'MistralAI-User', 'DuckAssistBot', 'Diffbot', 'cohere-ai',
    'Amazonbot', 'Meta-ExternalAgent', 'FacebookBot',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // AI 引擎全部明确放行
      ...AI_BOTS.map((ua) => ({ userAgent: ua, allow: '/' })),
    ],
    sitemap: 'https://solar.miyucaicai.cn/sitemap.xml',
  };
}
