import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "TOPGO SOLAR光伏储能数据平台隐私政策",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900">隐私政策</h1>
          <p className="text-slate-500 text-sm mt-1">最后更新：2026年5月</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              1. 信息收集
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台为公开数据查询平台，用户无需注册即可使用大部分功能。我们可能会收集以下信息：访问日志（IP地址、访问时间、访问页面）、浏览器类型、设备信息。以上信息仅用于平台统计分析和性能优化。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              2. Cookie使用
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台使用Cookie进行会话管理和用户体验优化。Cookie是存储在用户本地终端的小型文本文件，用于记住用户偏好设置。用户可以通过浏览器设置拒绝Cookie，但这可能影响部分功能使用。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              3. 第三方服务
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台使用Vercel作为部署托管服务，可能收集与部署相关的技术日志信息。本平台不主动向任何第三方出售或共享用户个人信息。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              4. 数据安全
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台采用HTTPS加密传输，定期更新安全策略，防止数据泄露和未授权访问。但互联网传输存在固有风险，本平台不对因不可抗力或第三方原因导致的数据泄露负责。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              5. 用户权利
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              作为公开数据平台，本平台不收集可识别个人身份的信息。如用户对本平台数据有疑问或建议，欢迎通过联系页面反馈。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              6. 政策更新
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              本平台保留随时更新本隐私政策的权利。更新后的政策将在本页面发布，建议用户定期查看。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              7. 联系方式
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              如对本隐私政策有任何疑问，请联系我们：data@solar.miyucaicai.cn
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
