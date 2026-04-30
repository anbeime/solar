import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Docker 部署需要 standalone 输出
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,

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
