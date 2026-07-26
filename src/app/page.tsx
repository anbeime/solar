"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  FileText,
  Trophy,
  BarChart3,
  Plug,
  BookOpen,
  Sun,
  Battery,
  Zap,
  TrendingUp,
  Building2,
  Clock,
  Search,
  Activity,
  ExternalLink,
  Globe,
  Brain,
  LayoutDashboard,
  Eye,
  Bot,
  Shield,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSiteData } from "@/hooks/use-data";
import { getTypeStyle } from "@/lib/data";
import { DATA_SOURCE_LINKS } from "@/lib/constants";
import type { Project } from "@/lib/types";

// ===== 品牌配置 =====
const BRAND_NAME = "TOPGO SOLAR";
const SITE_NAME = "TOPGO SOLAR 光伏储能数据平台";
const SITE_URL = "https://solar.miyucaicai.cn";

// ===== 导航卡片配置 =====
const navCards = [
  {
    title: "项目地图",
    desc: `${BRAND_NAME}收录全国光伏储能项目分布`,
    icon: MapPin,
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100 text-blue-600",
    href: "/map",
  },
  {
    title: "招标动态",
    desc: "最新光伏储能招标公告信息",
    icon: FileText,
    color: "from-purple-500 to-indigo-500",
    iconBg: "bg-purple-100 text-purple-600",
    href: "/bidding",
  },
  {
    title: "中标公示",
    desc: "中标结果与金额公示",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 text-amber-600",
    href: "/awards",
  },
  {
    title: "省份分析",
    desc: "各省份光伏储能项目数据统计",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-100 text-emerald-600",
    href: "/province",
  },
  {
    title: "充电桩",
    desc: "新能源汽车充电站分布查询",
    icon: Plug,
    color: "from-green-500 to-lime-500",
    iconBg: "bg-green-100 text-green-600",
    href: "/chargers",
  },
  {
    title: "行业资讯",
    desc: "最新政策解读、项目追踪",
    icon: BookOpen,
    color: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-100 text-rose-600",
    href: "/news",
  },
  {
    title: "数据看板",
    desc: `${BRAND_NAME}可视化数据分析仪表盘`,
    icon: LayoutDashboard,
    color: "from-indigo-500 to-violet-500",
    iconBg: "bg-indigo-100 text-indigo-600",
    href: "/dashboard",
  },
  {
    title: "AI助手",
    desc: `${BRAND_NAME}智能分析与趋势预测`,
    icon: Brain,
    color: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-100 text-rose-600",
    href: "/ai",
  },
  {
    title: "行业报告",
    desc: `${BRAND_NAME}${SITE_NAME}行业研究报告`,
    icon: BookOpen,
    color: "from-slate-500 to-gray-500",
    iconBg: "bg-slate-100 text-slate-600",
    href: "#reports",
  },
];

// ===== DCIC AI应用卡片配置 =====

const dcicCards = [
  {
    title: "充电站优化",
    desc: "负荷预测 / V2G优化 / 协同调度",
    icon: Battery,
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100 text-blue-600",
    href: "/dcic/ev-charging",
  },
  {
    title: "功率预测",
    desc: "风电 / 光伏 超短期+短期预测",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 text-amber-600",
    href: "/dcic/power-prediction",
  },
  {
    title: "数字孪生",
    desc: "源网荷储一体化调度平台",
    icon: Activity,
    color: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-100 text-emerald-600",
    href: "/dcic/digital-twin",
  },
  {
    title: "缺陷检测",
    desc: "输电线路巡检缺陷智能识别",
    icon: Eye,
    color: "from-red-500 to-pink-500",
    iconBg: "bg-red-100 text-red-600",
    href: "/dcic/power-inspection",
  },
  {
    title: "充电桩布局",
    desc: "K-Means+LSTM智能选址",
    icon: MapPin,
    color: "from-purple-500 to-indigo-500",
    iconBg: "bg-purple-100 text-purple-600",
    href: "/dcic/ev-charger-ai",
  },
  {
    title: "具身AI",
    desc: "多机器人协同高风险作业",
    icon: Bot,
    color: "from-cyan-500 to-blue-500",
    iconBg: "bg-cyan-100 text-cyan-600",
    href: "/dcic/embodied-ai",
  },
  {
    title: "信创能源",
    desc: "国产化源网荷储协同平台",
    icon: Shield,
    color: "from-slate-500 to-gray-500",
    iconBg: "bg-slate-100 text-slate-600",
    href: "/dcic/xinchuang-energy",
  },
];

export default function Home() {
  const { projects, bidding, awards, stats, provinces, types, loading } =
    useSiteData();
  const [selectedProvince, setSelectedProvince] = useState("全部");
  const [selectedType, setSelectedType] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        const matchP =
          selectedProvince === "全部" || p.province === selectedProvince;
        const matchT = selectedType === "全部" || p.type === selectedType;
        const matchS =
          !searchQuery ||
          p.name.includes(searchQuery) ||
          p.province.includes(searchQuery) ||
          p.company?.includes(searchQuery) ||
          p.summary?.includes(searchQuery);
        return matchP && matchT && matchS;
      }),
    [projects, selectedProvince, selectedType, searchQuery],
  );

  const navStats: Record<string, string> = useMemo(
    () => ({
      项目地图: `${stats.totalProjects} 项目`,
      招标动态: `${stats.biddingCount} 招标`,
      中标公示: `${stats.awardsCount}+ 中标`,
      省份分析: `${stats.provinceCount} 省统计`,
      充电桩: `${stats.chargerCount} 设施`,
      数据看板: "可视化",
      AI助手: "智能分析",
      行业报告: "资料库",
    }),
    [stats],
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      {/* Hero 区域 */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              {SITE_NAME}
            </h1>
            <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto">
              {BRAND_NAME}
              提供全国光伏储能项目实时数据监测，支持招标动态追踪、充电桩查询、AI智能分析与行业趋势预测
            </p>
          </div>

          {/* 核心指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: Activity,
                value: stats.totalProjects,
                label: "项目总数",
                color: "text-blue-400",
              },
              {
                icon: Sun,
                value:
                  stats.pvCapGW > 0 ? stats.pvCapGW.toFixed(1) : stats.pvCount,
                label: stats.pvCapGW > 0 ? "GW 光伏装机" : "个光伏项目",
                color: "text-yellow-400",
              },
              {
                icon: Battery,
                value:
                  stats.esCapGWh > 0
                    ? stats.esCapGWh.toFixed(1)
                    : stats.esCount,
                label: stats.esCapGWh > 0 ? "GWh 储能装机" : "个储能项目",
                color: "text-emerald-400",
              },
              {
                icon: TrendingUp,
                value: stats.biddingCount,
                label: "招标公告",
                color: "text-purple-400",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
              >
                <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
                <p className="text-2xl md:text-3xl font-bold">
                  {loading ? "-" : item.value}
                </p>
                <p className="text-xs text-blue-200 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 导航卡片 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-1.5rem] relative z-20 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {navStats[card.title]}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500">{card.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI智能应用 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI智能应用
          </h2>
          <span className="text-xs text-slate-400">7个智能应用</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {dcicCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${card.color}`} />
                  <CardContent className="p-3">
                    <div
                      className={`p-1.5 rounded-lg ${card.iconBg} w-fit mb-2`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs mb-0.5">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-tight">
                      {card.desc}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 项目数据列表 */}
      <section
        id="projects"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            项目数据
          </h2>
          <span className="text-xs text-slate-400">
            共 {filteredProjects.length} 条
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="搜索项目名称、省份、公司..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-24 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-24 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredProjects.slice(0, 30).map((p) => (
            <Card
              key={p.id}
              className="hover:shadow-md transition-shadow border border-slate-200/80 shadow-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2">
                      {p.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500">
                      {p.type && (
                        <Badge
                          variant="outline"
                          className={getTypeStyle(p.type)}
                        >
                          {p.type}
                        </Badge>
                      )}
                      {p.province && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {p.province}
                        </span>
                      )}
                      {p.capacity && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {p.capacity}
                        </span>
                      )}
                      {p.amount && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {p.amount}
                        </span>
                      )}
                      {p.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {p.company}
                        </span>
                      )}
                      {p.date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.date}
                        </span>
                      )}
                    </div>
                    {p.summary && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {p.summary.slice(0, 120)}
                      </p>
                    )}
                  </div>
                </div>
                {p.sourceUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={p.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      查看原始出处
                    </a>
                    <span className="text-xs text-slate-400">
                      来源：{p.sourceName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredProjects.length === 0 && !loading && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">未找到匹配的项目</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 行业报告 */}
      <section
        id="reports"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-600" />
              {BRAND_NAME}行业报告与数据洞察
            </CardTitle>
            <CardDescription>
              {BRAND_NAME}光伏储能行业研究报告、政策解读、市场分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  title: "充电桩云平台开发之一：充电桩和云平台的通信协议全貌",
                  tag: "白皮书",
                  date: "2026-04-01",
                  source: "微信文章",
                  url: "https://mp.weixin.qq.com/s/U3NR74LWsowMoawOCQuQBg",
                },
                {
                  title: "当AI遇上新能源：10家改变能源行业的创新公司",
                  tag: "季报",
                  date: "2026-03-20",
                  source: "微信文章",
                  url: "https://mp.weixin.qq.com/s/zaP-ZoJx0i6kwnCFmzlQOQ",
                },
                {
                  title: "马斯克高调庆祝特斯拉能源成为全球最大储能供应商",
                  tag: "指南",
                  date: "2026-03-15",
                  source: "微信文章",
                  url: "https://mp.weixin.qq.com/s/Z_pEg_D_aOFDIvma6wDq1Q",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="bg-white/80 rounded-lg p-3 border border-rose-100 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-rose-100 text-rose-700 text-xs">
                      {r.tag}
                    </Badge>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1.5">
                    {r.title}
                  </p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    查看原始出处 - {r.source}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 行业报告 + 数据来源 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        {/* 数据来源 */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              数据来源：{BRAND_NAME}
            </CardTitle>
            <CardDescription>
              {BRAND_NAME}数据均标注原始出处，支持回源验证
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="flex flex-wrap gap-2">
              {DATA_SOURCE_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-100"
                >
                  <Globe className="w-3 h-3" />
                  {s.name}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex-1" />
      <SiteFooter />
    </div>
  );
}
