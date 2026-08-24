import { Sun } from 'lucide-react';
import { DATA_SOURCE_LINKS, SITE_NAME } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md flex items-center justify-center">
              <Sun className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">{SITE_NAME}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://ai123.miyucaicai.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              🧠 知易AI
            </a>
            <a
              href="https://github.com/anbeime/skill"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              ⭐ 技能商店
            </a>
            {DATA_SOURCE_LINKS.slice(0, 6).map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
              >
                {s.name}
              </a>
            ))}
          </div>

          <p className="text-xs text-center md:text-right text-slate-600">
            数据来源均标注原始出处，支持回源验证
          </p>
        </div>
      </div>
    </footer>
  );
}
