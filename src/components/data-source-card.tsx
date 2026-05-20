'use client';

import { useState } from 'react';
import { ExternalLink, Globe, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DATA_SOURCE_LINKS, PROVINCE_PLATFORM_LINKS } from '@/lib/constants';

/**
 * 数据来源展示卡片 - 分组展示国家级+省级平台
 */
export function DataSourceCard() {
  const [showProvinces, setShowProvinces] = useState(false);

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-500" />
          数据来源
          <span className="ml-1 text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            {DATA_SOURCE_LINKS.length + PROVINCE_PLATFORM_LINKS.length}+
          </span>
        </CardTitle>
        <CardDescription>所有数据均标注原始出处，支持回源验证</CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        {/* 国家级/行业媒体 */}
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

        {/* 省级平台 - 可展开 */}
        <div className="mt-3">
          <button
            onClick={() => setShowProvinces(!showProvinces)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100 cursor-pointer"
          >
            <MapPin className="w-3 h-3" />
            省级公共资源交易平台 ({PROVINCE_PLATFORM_LINKS.length})
            {showProvinces ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showProvinces && (
            <div className="mt-2 flex flex-wrap gap-1.5 max-h-64 overflow-y-auto pr-1">
              {PROVINCE_PLATFORM_LINKS.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[11px] text-slate-500 hover:bg-green-50 hover:text-green-700 transition-colors border border-slate-100"
                >
                  {s.province}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
