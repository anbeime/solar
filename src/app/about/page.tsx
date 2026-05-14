import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Sun,
  Battery,
  Zap,
  Globe,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const SITE_URL = "https://solar.miyucaicai.cn";

export const metadata: Metadata = {
  title: "关于我们",
  description:
    "TOPGO SOLAR是国内领先的光伏储能行业垂直目录站，专注于光伏储能数据服务，为新能源行业提供专业数据支持。",
};

export default function AboutPage() {
  const stats = [
    { label: "光伏项目", value: "600+", icon: Sun },
    { label: "储能项目", value: "100+", icon: Battery },
    { label: "充电桩", value: "6000+", icon: Zap },
    { label: "覆盖省份", value: "31", icon: Globe },
  ];

  const features = [
    {
      title: "数据全面",
      desc: "收录全国31个省份的光伏储能项目数据，包括项目名称、装机容量、投资金额、中标单位等关键信息。",
      icon: Database,
    },
    {
      title: "实时更新",
      desc: "招标动态、招标结果每日更新，确保用户获取最新行业信息，把握市场机会。",
      icon: TrendingUp,
    },
    {
      title: "AI智能分析",
      desc: "基于大语言模型的光伏储能行业AI分析助手，支持政策解读、项目评估、趋势预测。",
      icon: Brain,
    },
    {
      title: "开放共享",
      desc: "数据来源透明，标注原始出处，支持回源验证，推动行业数据开放共享。",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">关于我们</h1>
          <p className="text-slate-600 mt-2">
            TOPGO SOLAR - 国内领先的光伏储能数据平台
          </p>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">光伏储能数据平台</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-6">
              TOPGO
              SOLAR是国内领先的光伏储能行业垂直目录站，专注于光伏储能数据服务。
              平台收录全国600+光伏项目、100+储能项目、6000+充电站数据，为新能源行业提供专业数据支持。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/10 rounded-lg p-4">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-blue-200" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-blue-200">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-slate-900 mb-4">核心优势</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-slate-100 border-slate-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-slate-800 mb-2">联系我们</h3>
            <p className="text-sm text-slate-600 mb-4">
              如有商务合作、数据定制等需求，欢迎通过以下方式联系我们
            </p>
            <p className="text-sm text-slate-500">
              Email: data@{SITE_URL.replace("https://", "")}
            </p>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}

function Database({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
      />
    </svg>
  );
}

function Brain({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}
