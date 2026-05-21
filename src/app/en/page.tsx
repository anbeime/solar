import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  FileText,
  BarChart3,
  Plug,
  Brain,
  BookOpen,
  Globe,
  Sun,
  Battery,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const SITE_URL = "https://solar.miyucaicai.cn";

export const metadata: Metadata = {
  title: "TOPGO SOLAR | China PV & Energy Storage Data Platform",
  description:
    "Leading China PV and energy storage industry directory. Track 600+ solar projects, 100+ storage projects, 6000+ EV chargers. Real-time bidding updates and AI-powered analysis.",
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      "zh-CN": SITE_URL,
      en: `${SITE_URL}/en`,
    },
  },
};

const navCards = [
  {
    title: "Project Map",
    desc: "Nationwide PV & storage project distribution",
    icon: MapPin,
    color: "from-blue-500 to-cyan-500",
    href: "/#projects",
  },
  {
    title: "Bidding",
    desc: "Latest PV & storage tender announcements",
    icon: FileText,
    color: "from-purple-500 to-indigo-500",
    href: "/bidding",
  },
  {
    title: "Province Analysis",
    desc: "Province-level project statistics",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500",
    href: "/province",
  },
  {
    title: "EV Chargers",
    desc: "Electric vehicle charging station map",
    icon: Plug,
    color: "from-green-500 to-lime-500",
    href: "/chargers",
  },
  {
    title: "AI Assistant",
    desc: "AI-powered industry analysis",
    icon: Brain,
    color: "from-rose-500 to-pink-500",
    href: "/ai",
  },
  {
    title: "Reports",
    desc: "Industry reports and research",
    icon: BookOpen,
    color: "from-slate-500 to-gray-500",
    href: "#reports",
  },
];

export default function EnglishHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              TOPGO SOLAR
            </h1>
            <p className="text-blue-200 text-sm md:text-base max-w-2xl mx-auto">
              China&apos;s Leading PV & Energy Storage Data Platform | Real-time
              project tracking, tender updates, AI analysis
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              {
                icon: Sun,
                value: "600+",
                label: "Solar Projects",
                color: "text-yellow-400",
              },
              {
                icon: Battery,
                value: "100+",
                label: "Storage Projects",
                color: "text-emerald-400",
              },
              {
                icon: Plug,
                value: "6000+",
                label: "EV Chargers",
                color: "text-blue-400",
              },
              {
                icon: TrendingUp,
                value: "31",
                label: "Provinces",
                color: "text-purple-400",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
              >
                <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
                <p className="text-2xl md:text-3xl font-bold">{item.value}</p>
                <p className="text-xs text-blue-200 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="group">
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />
                  <CardContent className="p-4">
                    <div className="p-2 bg-slate-100 rounded-lg w-fit mb-2">
                      <Icon className="w-5 h-5 text-slate-600" />
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-4">
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Data Sources
            </CardTitle>
            <CardDescription>
              All data is sourced from official channels including NEA,
              provincial governments, and public resource trading centers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>National Energy Administration (NEA)</Badge>
              <Badge>Provincial Development & Reform Commissions</Badge>
              <Badge>Public Resource Trading Centers</Badge>
              <Badge>State Grid Corporation of China</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-100 border-slate-200 mb-8">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-slate-800 mb-2">
              View Chinese Version
            </h3>
            <p className="text-sm text-slate-600 mb-4">访问中文版本</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Chinese Site
            </Link>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
