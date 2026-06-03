import Link from "next/link";
import { ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react";

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/news" className="flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回资讯列表
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* 封面图 */}
          <div className="aspect-video bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-lg font-medium">国家能源局 · 51个AI+能源场景</span>
          </div>

          <div className="p-8">
            {/* 标题 */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              国家能源局重磅发布！51个AI+能源场景催生储能三大核心赛道
            </h1>

            {/* 元信息 */}
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-6 pb-6 border-b">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                2026-06-03
              </span>
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-xs">
                政策解读
              </span>
            </div>

            {/* 摘要 */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-4 mb-6 border-l-4 border-cyan-500">
              <p className="text-gray-700">
                <strong>2026年5月</strong>，国家能源局正式发布《中国"人工智能+"能源发展报告2026》，公布包含<strong>51个"人工智能+"能源高价值场景</strong>的清单。
              </p>
            </div>

            {/* 内容预览 */}
            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">一、国家能源局51个场景：储能行业的"新基建"指南</h2>
              <p className="text-gray-600 mb-4">
                这51个<strong>AI+能源高价值场景</strong>，涵盖8大核心方向，其中"<strong>能源新业态</strong>"（17个）、"<strong>电网智能化</strong>"（8个）、"<strong>新能源并网</strong>"（6个）与储能直接相关。
              </p>

              <h3 className="text-base font-semibold text-gray-800 mb-2">🚀 三大核心赛道</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                <li><strong>虚拟电厂（VPP）</strong>—— AI最大练兵场</li>
                <li><strong>电力交易算法</strong>—— 从"凭经验"到"算概率"</li>
                <li><strong>预测性运维</strong>—— 从"坏了修"到"预测防"</li>
              </ul>

              <h2 className="text-lg font-semibold text-gray-800 mb-3">二、谁将胜出？构建智能闭环的三大核心能力</h2>
              <div className="grid gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-medium text-blue-800">1️⃣ 数据获取与治理能力</p>
                  <p className="text-sm text-blue-600 mt-1">能源数据资产是智能的根基</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-medium text-purple-800">2️⃣ 算法迭代与工程化能力</p>
                  <p className="text-sm text-purple-600 mt-1">储能+大模型的落地能力</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="font-medium text-amber-800">3️⃣ 场景理解与商务闭环能力</p>
                  <p className="text-sm text-amber-600 mt-1">电力市场规则与运营能力</p>
                </div>
              </div>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
              <Tag className="w-4 h-4 text-gray-400 mt-1" />
              {["AI+储能", "虚拟电厂VPP", "电力交易", "预测性运维", "储能资产运营"].map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* 来源 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                📌 本文转载自光伏储能行业资讯，完整版请查看公众号
              </p>
              <a href="https://solar.miyucaicai.cn" className="inline-flex items-center gap-1 mt-2 text-cyan-600 text-sm">
                <ExternalLink className="w-3 h-3" />
                solar.miyucaicai.cn
              </a>
            </div>
          </div>
        </article>

        <div className="mt-6 text-center">
          <Link href="/news" className="text-cyan-600 hover:underline">
            ← 查看更多资讯
          </Link>
        </div>
      </main>
    </div>
  );
}
