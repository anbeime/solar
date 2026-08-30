'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Zap,
  TrendingUp,
  Clock,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageLayout } from '@/components/page-layout';
import { useSiteData } from '@/hooks/use-data';
import { getTypeStyle } from '@/lib/data';

const PAGE_SIZE = 30;

export default function ProjectsPage() {
  const { projects, provinces, types, loading } = useSiteData();
  const [selectedProvince, setSelectedProvince] = useState('全部');
  const [selectedType, setSelectedType] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchP =
          selectedProvince === '全部' || p.province === selectedProvince;
        const matchT = selectedType === '全部' || p.type === selectedType;
        const q = searchQuery.trim();
        const matchS =
          !q ||
          p.name.includes(q) ||
          p.province.includes(q) ||
          (p.company ?? '').includes(q) ||
          (p.summary ?? '').includes(q);
        return matchP && matchT && matchS;
      }),
    [projects, selectedProvince, selectedType, searchQuery],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (curPage - 1) * PAGE_SIZE,
    curPage * PAGE_SIZE,
  );

  const reset = (fn: (v: string) => void) => (v: string) => {
    fn(v);
    setPage(1);
  };

  return (
    <PageLayout
      title="光伏储能项目库"
      description={`共 ${projects.length} 条项目数据，覆盖全国各省光伏、储能与光储一体化项目`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="搜索项目名称、省份、公司..."
            value={searchQuery}
            onChange={(e) => reset(setSearchQuery)(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={selectedType} onValueChange={reset(setSelectedType)}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedProvince}
          onValueChange={reset(setSelectedProvince)}
        >
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        匹配 {filtered.length} 条 · 第 {curPage}/{totalPages} 页
      </p>

      <div className="space-y-3">
        {pageItems.map((p) => (
          <Card
            key={p.id}
            className="hover:shadow-md transition-shadow border border-slate-200/80 shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2">
                    {p.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500">
                    {p.type && (
                      <Badge variant="outline" className={getTypeStyle(p.type)}>
                        {p.type}
                      </Badge>
                    )}
                    {p.province && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {p.province}
                      </span>
                    )}
                    {p.capacity && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {p.capacity}
                      </span>
                    )}
                    {p.amount && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {p.amount}
                      </span>
                    )}
                    {p.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {p.company}
                      </span>
                    )}
                    {p.date && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.date}
                      </span>
                    )}
                  </div>
                  {p.summary && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {p.summary.slice(0, 120)}
                    </p>
                  )}
                </div>
              </div>
              {p.sourceUrl && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    查看原始出处
                  </a>
                  <span className="text-xs text-slate-400">
                    来源：{p.sourceName}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!loading && filtered.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">未找到匹配的项目</p>
            </CardContent>
          </Card>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((v) => Math.max(1, v - 1))}
            disabled={curPage <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            上一页
          </button>
          <span className="text-xs text-slate-500">
            {curPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
            disabled={curPage >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50"
          >
            下一页
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </PageLayout>
  );
}
