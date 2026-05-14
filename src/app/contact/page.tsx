import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Github, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const SITE_URL = "https://solar.miyucaicai.cn";

export const metadata: Metadata = {
  title: "联系我们",
  description:
    "联系TOPGO SOLAR光伏储能数据平台，获取商务合作、数据定制等服务支持。",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">联系我们</h1>
          <p className="text-slate-600 mt-2">
            如有商务合作或问题反馈，欢迎联系我们
          </p>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="w-5 h-5 text-blue-600" />
                电子邮件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                data@{SITE_URL.replace("https://", "")}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                工作时间：周一至周五 9:00-18:00
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Github className="w-5 h-5 text-blue-600" />
                GitHub
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href="https://github.com/anbeime/solar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                github.com/anbeime/solar
              </a>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="w-5 h-5 text-blue-600" />
                网站
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">{SITE_URL}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-2">商务合作</h3>
            <p className="text-sm text-slate-600">
              我们提供光伏储能数据API接口、数据定制、行业报告等专业服务。
              如有合作意向，欢迎发送邮件至上方邮箱。
            </p>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  );
}
