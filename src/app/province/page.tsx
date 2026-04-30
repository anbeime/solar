'use client';

import { useState, useMemo } from 'react';
import { BarChart3, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { useSiteData } from '@/hooks/use-data';
import { getTypeBarColor, getTypeDotColor } from '@/lib/data';
import type { SortKey } from '@/lib/types';

export default function ProvincePage() {
  const { projects, provinceStats, loading } = useSiteData();
  const [sortBy, setSortBy] = useState<SortKey>('count');

  const sorted = useMemo(() => {
    const arr = [...provinceStats];
    if (sortBy === 'count') arr.sort((a, b) => b.count - a.count);
    else if (sortBy === 'capacity') arr.sort((a, b) => b.capacityGW - a.capacityGW);
    else arr.sort((a, b) => b.companyCount - a.companyCount);
    return arr;
  }, [provinceStats, sortBy]);

  const totalProjects = projects.length;
  const totalProvinces = provinceStats.length;
  const totalCap = provinceStats.reduce((s, p) => s + p.capacityGW, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">省份分析</h1>
        <p className="text-sm text-slate-500 mb-6">按省份统计光伏储能项目分布</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{loading ? '-' : totalProvinces}</p><p className="text-xs text-slate-500">覆盖省份</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{loading ? '-' : totalProjects}</p><p className="text-xs text-slate-500">项目总数</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{totalCap.toFixed(1)} GW</p><p className="text-xs text-slate-500">总装机</p></CardContent></Card>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">排序：</span>
          {[
            { key: 'count' as SortKey, label: '项目数' },
            { key: 'capacity' as SortKey, label: '装机量' },
            { key: 'company' as SortKey, label: '企业数' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${sortBy === s.key ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {sorted.map((p, idx) => (
            <Card key={p.name} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx < 3 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm">{p.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>{p.count} 个项目</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{p.capacityGW.toFixed(1)} GW</span>
                      <span>{p.companyCount} 家企业</span>
                    </div>
                    <div className="flex gap-1 mt-2 h-2 rounded-full overflow-hidden bg-slate-100">
                      {Object.entries(p.types).map(([type, count]) => {
                        const pct = (count / p.count) * 100;
                        return <div key={type} className={getTypeBarColor(type)} style={{ width: `${pct}%` }} title={`${type}: ${count}`} />;
                      })}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(p.types).map(([type]) => (
                        <span key={type} className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${getTypeDotColor(type)}`} />{type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sorted.length === 0 && !loading && (
          <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><BarChart3 className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">暂无省份统计数据</p></CardContent></Card>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
