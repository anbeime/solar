import Link from "next/link";
import { FileText, Calendar, Tag } from "lucide-react";

const ARTICLES = [
  {
    id: "ai-storage-20260603",
    title: "国家能源局重磅发布！51个AI+能源场景催生储能三大核心赛道",
    slug: "ai-storage-51-scenes",
    date: "2026-06-03",
    category: "政策解读",
    excerpt:
      "虚拟电厂、电力交易、预测性运维——从「硬件内卷」到「智能运营」的价值重构",
    tags: ["AI+储能", "虚拟电厂VPP", "电力交易"],
  },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            📰 光伏储能行业资讯
          </h1>
          <p className="text-gray-500 mt-1">最新行业动态、政策解读、项目追踪</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {article.date}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-cyan-600">
                  <Link href={`/news/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">更多资讯即将上线...</p>
          <a
            href="https://solar.miyucaicai.cn"
            className="inline-block mt-3 text-cyan-600 hover:underline"
          >
            ← 返回首页
          </a>
        </div>
      </main>
    </div>
  );
}
