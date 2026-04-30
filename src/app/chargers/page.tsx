'use client';

import { useState, useEffect } from 'react';
import {
  Plug, Building2, CalendarDays, Search, ExternalLink,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import type { ChargerItem } from '@/lib/types';

export default function ChargersPage() {
  const [items, setItems] = useState<ChargerItem[]>([]);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('全部');

  useEffect(() => { fetch('/data/chargers.json').then(r => r.json()).then(setItems).catch(() => {}); }, []);

  const provinces = ['全部', ...Array.from(new Set(items.map(i => i.province).filter(Boolean))).sort()];

  const filtered = items.filter(c => {
    const mp = province === '全部' || c.province === province;
    const mq = !search || c.title.includes(search) || (c.company && c.company.includes(search)) || (c.summary && c.summary.includes(search));
    return mp && mq;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">充电设施</h1>
        <p className="text-sm text-slate-500 mb-6">充电站与充电桩相关资讯，每条均标注原始出处</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Input placeholder="搜索标题、公司..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 h-8 text-sm" />
          <Select value={province} onValueChange={setProvince}><SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger><SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
        </div>

        {filtered.length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="p-8 text-center"><Plug className="w-8 h-8 text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">暂无充电设施数据</p><p className="text-xs text-slate-400 mt-1">数据正在持续采集中</p></CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">{c.title}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {c.province && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{c.province}</span>}
                    {c.capacity && <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{c.capacity}</span>}
                    {c.company && <span>企业：{c.company}</span>}
                    {c.date && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{c.date}</span>}
                  </div>
                  {c.summary && <p className="text-xs text-slate-400 mt-2 line-clamp-3">{c.summary}</p>}
                  {c.sourceUrl && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                        <ExternalLink className="w-3 h-3" />查看原始出处 -> {c.sourceName}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
