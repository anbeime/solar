import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "光储智脑一体机 · 招商方案",
  description:
    "光储智脑一体机（SolarBrain Box）——插电即用、数据不出站的光储充电站 AI 运营官。四岗位覆盖收益账本、设备健康值守、政策策略参谋、充电用户经营。",
};

export default function SolarBrainPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 w-full py-6">
        <div className="max-w-5xl mx-auto px-4 pb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </Link>
          <a
            href="https://github.com/anbeime/solar/tree/main/docs/solar-box"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"
          >
            <Download className="w-4 h-4" /> 下载方案书 PDF / 工程文件
          </a>
        </div>

        <iframe
          src="/solar-brain.html"
          title="光储智脑一体机招商方案书"
          className="w-full max-w-5xl mx-auto block border-0 bg-white shadow-sm rounded-lg mb-8"
          style={{ height: 1900 }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
