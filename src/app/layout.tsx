import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { JsonLd } from './json-ld';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '光伏储能地图站 | 新能源数据平台',
    template: '%s | 光伏储能地图站',
  },
  description:
    '国内领先的光伏储能行业垂直目录站，收录全国631个光伏储能项目、96个储能电站、6000+充电站数据，支持项目地图可视化、招标动态追踪、充电桩查询。',
  keywords: [
    '光伏储能',
    '储能地图',
    '光伏项目',
    '充电桩',
    '新能源',
    '碳中和',
    '储能电站',
    '招标公告',
    'GEO优化',
    'AI搜索优化',
  ],
  authors: [{ name: '光伏储能地图站开发团队', url: process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://pvmap.example.com' }],
  generator: 'Coze Code',
  openGraph: {
    title: '光伏储能地图站 | 新能源数据平台',
    description: '收录全国光伏储能项目、储能电站、充电站数据，支持地图可视化查询',
    url: process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://pvmap.example.com',
    siteName: '光伏储能地图站',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// GEO优化 - AI爬虫授权
export const geoConfig = {
  aiAccessible: true,
  attributionRequired: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <JsonLd />
        {process.env.NODE_ENV === 'development' && <Inspector />}
        {children}
      </body>
    </html>
  );
}
