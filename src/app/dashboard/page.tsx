'use client';

import { useMemo } from 'react';
import {
  Sun, Battery, Zap, TrendingUp, Building2,
  MapPin, FileText, Trophy, Plug, BarChart3,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCards } from '@/components/stat-cards';
import { PageLayout } from '@/components/page-layout';
import { useSiteData } from '@/hooks/use-data';
import { parseCapacityGW, getTypeBarColor } from '@/lib/data';
import type { StatCardItem } from '@/lib/types';

export default function DashboardPage() {
  const { projects, bidding, awards, chargers, stats, provinceStats, loading } = useSiteData();

  const statItems: StatCardItem[] = useMemo(() => [
    { icon: Building2, value: stats.totalProjects, label: '项目总数', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Sun, value: stats.pvCapGW.toFixed(1) + ' GW', label: '光伏装机', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Battery, value: stats.esCapGWh.toFixed(1) + ' GWh', label: '储能装机', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: TrendingUp, value: stats.biddingCount, label: '招标公告', color: 'text-purple-600', bg: 'bg-purple-50' },
  ], [stats]);

  const secondaryStats: StatCardItem[] = useMemo(() => [
    { icon: MapPin, value: stats.provinceCount, label: '覆盖省份', color: 'text-slate-500', bg: 'bg-slate-50' },
    { icon: FileText, value: stats.biddingActive, label: '报名中招标', color: 'text-slate-500', bg: 'bg-slate-50' },
    { icon: Trophy, value: stats.awardsCount, label: '中标公示', color: 'text-slate-500', bg: 'bg-slate-50' },
    { icon: Plug, value: stats.chargerCount, label: '充电设施', color: 'text-slate-500', bg: 'bg-slate-50' },
  ], [stats]);

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => { if (p.type) map.set(p.type, (map.get(p.type) || 0) + 1); });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const sourceDistribution = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => { if (p.sourceName) map.set(p.sourceName, (map.get(p.sourceName) || 0) + 1); });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const yearDistribution = useMemo(() => {
    const map = new Map<string, number>();
    projects.forEach(p => { if (p.date) { const y = p.date.slice(0, 4); if (/^\d{4}$/.test(y)) map.set(y, (map.get(y) || 0) + 1); } });
    return Array.from(map.entries()).sort();
  }, [projects]);

  const biddingStatusDist = useMemo(() => {
    const active = bidding.filter(b => b.status === '报名中').length;
    const closed = bidding.filter(b => b.status === '已截止').length;
    return [{ label: '报名中', count: active, color: 'bg-amber-400' }, { label: '已截止', count: closed, color: 'bg-slate-400' }];
  }, [bidding]);

  const topProvinces = useMemo(() => [...provinceStats].sort((a, b) => b.count - a.count).slice(0, 10), [provinceStats]);

  const topCompanies = useMemo(() => {
    const map = new Map<string, { count: number; capacity: number }>();
    projects.forEach(p => {
      if (p.company) {
        const existing = map.get(p.company) || { count: 0, capacity: 0 };
        existing.count++;
        existing.capacity += parseCapacityGW(p.capacity);
        map.set(p.company, existing);
      }
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [projects]);

  const maxProvinceCount = topProvinces[0]?.count || 1;
  const maxCompanyCount = topCompanies[0]?.count || 1;
  const maxTypeCount = typeDistribution[0]?.[1] || 1;
  const maxYearCount = yearDistribution.length > 0 ? Math.max(...yearDistribution.map(([,c]) => c)) : 1;

  return (
    <PageLayout title="数据看板" description="光伏储能行业数据可视化分析">
      {/* 核心指标 */}
      <StatCards items={statItems} loading={loading} />
      <StatCards items={secondaryStats} loading={loading} />

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 项目类型分布 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />项目类型分布
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-3">
              {typeDistribution.map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-16 text-right">{type}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getTypeBarColor(type)}`} style={{ width: `${(count / maxTypeCount) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-12">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 省份排行 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />省份项目排行 Top10
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              {topProvinces.map((p, idx) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx < 3 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</span>
                  <span className="text-xs text-slate-700 w-12">{p.name}</span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(p.count / maxProvinceCount) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8">{p.count}</span>
                  <span className="text-[10px] text-slate-400 w-16">{p.capacityGW.toFixed(1)} GW</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* 年份分布 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />年份项目分布
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="flex items-end gap-2 h-32">
              {yearDistribution.map(([year, count]) => (
                <div key={year} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500">{count}</span>
                  <div className="w-full bg-emerald-400 rounded-t" style={{ height: `${(count / maxYearCount) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[10px] text-slate-400">{year}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 数据来源分布 */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />数据来源分布
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              {sourceDistribution.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{source}</span>
                  <Badge variant="outline" className="text-xs">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 招标状态 + 投资方排行 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />招标状态分布
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-3">
              {biddingStatusDist.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 w-12">{item.label}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${bidding.length > 0 ? (item.count / bidding.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />投资方排行 Top10
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              {topCompanies.map((c, idx) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx < 3 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</span>
                  <span className="text-xs text-slate-700 flex-1 truncate">{c.name}</span>
                  <Badge variant="outline" className="text-[10px]">{c.count}个</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
