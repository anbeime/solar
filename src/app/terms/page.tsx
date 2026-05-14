import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "服务条款",
  description: "TOPGO SOLAR光伏储能数据平台服务条款",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">服务条款</h1>
          <p className="text-slate-500 text-sm mt-1">最后更新：2026年5月</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              1. 服务说明
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              TOPGO
              SOLAR（以下简称"本站"）是一个光伏储能行业数据平台，提供全国光伏储能项目信息、招标动态、充电桩分布等数据的查询和分析服务。本站致力于为新能源行业从业者、投资者、研究人员提供专业、可靠的数据支持。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              2. 数据来源与免责声明
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台数据来源于国家能源局、各省发改委、公共资源交易中心等官方渠道，并标注原始出处。但本站不对数据的完整性、准确性、时效性作出任何承诺。用户在使用数据时应自行核实，以官方最新发布为准。本平台不对因使用本站数据而产生的任何直接或间接损失负责。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              3. 知识产权
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台及其内容（包括但不限于文本、图形、logo、数据）的知识产权归本平台所有。未经授权，任何人不得复制、修改、传播本平台内容。本站引用第三方数据均标注来源，版权归原作者所有。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              4. 用户行为
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              用户在使用本平台时，应遵守中国法律法规，不得利用本平台从事任何违法活动。用户应对其行为负责，因用户行为导致的任何法律责任由用户自行承担。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              5. 服务变更与终止
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台保留随时修改或中断服务的权利，恕不另行通知。本平台不对因服务变更或中断而导致的任何损失负责。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              6. 联系方式
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              如对本服务条款有任何疑问，请联系我们：data@solar.miyucaicai.cn
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
