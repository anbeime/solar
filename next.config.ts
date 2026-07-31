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

  // nodemailer 等纯 Node 模块需标记为外部依赖, 否则 webpack 打包进
  // server bundle 会报错, 导致 /api/subscribe route 模块加载失败 (500)
  serverExternalPackages: ['nodemailer'],

  // 实验性配置
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
