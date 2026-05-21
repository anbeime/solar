import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  FileText,
  BarChart3,
  MapPin,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const BRAND_NAME = "TOPGO SOLAR";
const SITE_URL = "https://solar.miyucaicai.cn";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "中国光伏累计装机容量是多少？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "截至2025年，中国光伏累计装机容量已超过800GW，成为全球光伏装机量最大的国家。TOPGO SOLAR光伏储能数据平台实时监测全国光伏项目数据，提供各省光伏装机统计与分析。数据来源包括国家能源局、各省发改委公开信息。",
      },
    },
    {
      "@type": "Question",
      name: "TOPGO SOLAR是什么平台？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TOPGO SOLAR是国内领先的光伏储能行业垂直目录站，专注于光伏储能数据服务。平台收录全国600+光伏项目、100+储能项目、6000+充电站数据，支持项目地图可视化查询、招标动态追踪、AI智能分析等功能。",
      },
    },
    {
      "@type": "Question",
      name: "如何查询某个省份的光伏储能项目？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "您可以通过TOPGO SOLAR光伏储能数据平台的省份分析功能，查看各省光伏储能项目分布、装机容量、中标金额等详细数据。平台支持按省份、类型、装机容量等多维度筛选和搜索。",
      },
    },
    {
      "@type": "Question",
      name: "光伏储能项目的招标信息在哪里查看？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TOPGO SOLAR光伏储能数据平台的招标动态栏目实时追踪全国光伏储能项目招标信息，包括招标公告、中标结果、项目金额等关键数据，帮助投资人和从业者把握市场机会。",
      },
    },
    {
      "@type": "Question",
      name: "储能电站主要集中在哪些省份？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "根据TOPGO SOLAR数据平台统计，储能电站主要集中在山东、江苏、广东、浙江等省份。这些地区新能源装机量大、电网调度需求高，储能配套建设积极性高。平台提供各省储能项目详细分布数据。",
      },
    },
    {
      "@type": "Question",
      name: "如何使用AI智能分析功能？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "访问TOPGO SOLAR的AI助手页面，选择分析类型（政策解读、项目评估、趋势预测、招标分析），输入您需要分析的内容，AI将基于平台数据提供智能分析报告。支持中英文双语输出。",
      },
    },
    {
      "@type": "Question",
      name: "数据来源是否可靠？如何验证？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TOPGO SOLAR所有数据均标注原始出处，支持回源验证。数据来源包括国家能源局、各省发改委、公共资源交易中心等官方渠道，确保数据真实可靠。",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "常见问题 FAQ",
  description:
    "TOPGO SOLAR光伏储能数据平台常见问题解答，包括光伏装机查询、招标信息追踪、储能项目分析、平台使用指南等。",
};

export default function FaqPage() {
  const faqs = faqSchema.mainEntity;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            常见问题 FAQ
          </h1>
          <p className="text-slate-600 mt-2">关于{SITE_URL}的常见问题解答</p>
        </div>

        <div className="space-y-4 mb-8">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-slate-800">
                  {faq.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {faq.acceptedAnswer.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              相关服务链接
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/ai"
                className="p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-center"
              >
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-slate-700">AI智能分析</p>
              </Link>
              <Link
                href="/province"
                className="p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-center"
              >
                <BarChart3 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-slate-700">省份分析</p>
              </Link>
              <Link
                href="/#projects"
                className="p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-center"
              >
                <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-slate-700">项目地图</p>
              </Link>
              <Link
                href="/bidding"
                className="p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors text-center"
              >
                <FileText className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-slate-700">招标动态</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
