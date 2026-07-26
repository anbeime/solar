import type { Metadata } from "next";
import { JsonLd } from "./json-ld";
import { SubscribeSection } from "@/components/subscribe-section";
import "./globals.css";

const SITE_URL = "https://solar.miyucaicai.cn";
const BRAND_NAME = "TOPGO SOLAR 光伏储能数据平台";

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} | 光伏储能数据平台`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: `${BRAND_NAME}是国内领先的光伏储能行业垂直目录站，收录全国光伏储能项目、储能电站、充电站数据，支持项目地图可视化查询、招标动态追踪、AI智能分析。数据来源可追溯，赋能新能源行业发展。`,
  keywords: [
    "蜜语彩彩",
    "光伏储能",
    "储能地图",
    "光伏地图",
    "光伏数据",
    "储能数据",
    "光伏项目",
    "充电桩",
    "新能源",
    "碳中和",
    "储能电站",
    "招标公告",
    "GEO优化",
    "AI搜索优化",
  ],
  authors: [
    {
      name: `${BRAND_NAME}开发团队`,
      url: SITE_URL,
    },
  ],
  generator: "Coze Code",
  openGraph: {
    title: `${BRAND_NAME} | 光伏储能数据平台`,
    description: `收录全国光伏储能项目、储能电站、充电站数据，支持地图可视化查询，${BRAND_NAME}为新能源行业提供专业数据服务`,
    url: SITE_URL,
    siteName: BRAND_NAME,
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
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
        {children}
        <SubscribeSection />
      </body>
    </html>
  );
}
