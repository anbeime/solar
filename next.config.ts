import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Docker 部署需要 standalone 输出
  // 生产环境自动启用 standalone，开发环境不启用
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  allowedDevOrigins: ['*.dev.coze.site'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },

  // 实验性配置
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
