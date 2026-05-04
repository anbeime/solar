'use client';

import { ExternalLink, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DATA_SOURCE_LINKS } from '@/lib/constants';

/**
 * 数据来源展示卡片
 */
export function DataSourceCard() {
  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          数据来源
        </CardTitle>
        <CardDescription>所有数据均标注原始出处，支持回源验证</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="flex flex-wrap gap-2">
          {DATA_SOURCE_LINKS.map(s => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-100"
            >
              <ExternalLink className="w-3 h-3" />{s.name}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
