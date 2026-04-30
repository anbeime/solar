'use client';

import { useState, useEffect } from 'react';
import {
  Trophy, Building2, CalendarDays, Search, ExternalLink,
  Zap, TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import type { AwardItem } from '@/lib/types';

export default function AwardsPage() {
  const [items, setItems] = useState<AwardItem[]>([]);
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('全部');

  useEffect(() => { fetch('/data/awards.json').then(r => r.json()).then(setItems).catch(() => {}); }, []);

  const provinces = ['全部', ...Array.from(new Set(items.map(i => i.province).filter(Boolean))).sort()];

  const filtered = items.filter(a => {
    const mp = province === '全部' || a.province === province;
    const mq = !search || a.title.includes(search) || (a.company && a.company.includes(search)) || (a.summary && a.summary.includes(search));
    return mp && mq;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">中标公示</h1>
        <p className="text-sm text-slate-500 mb-6">光伏储能项目中标结果公示，每条均标注原始出处</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{filtered.length}</p><p className="text-xs text-slate-500">中标公示</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{filtered.filter(a => a.amount).length}</p><p className="text-xs text-slate-500">含金额信息</p></CardContent></Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Input placeholder="搜索中标标题、公司..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64 h-8 text-sm" />
          <Select value={province} onValueChange={setProvince}><SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger><SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
        </div>

        <div className="space-y-3">
          {filtered.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">{a.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {a.category && <Badge variant="outline" className="text-xs">{a.category}</Badge>}
                  <Badge variant="default" className="text-xs bg-green-600">{a.status}</Badge>
                  {a.province && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{a.province}</span>}
                  {a.capacity && <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{a.capacity}</span>}
                  {a.amount && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{a.amount}</span>}
                  {a.company && <span>企业：{a.company}</span>}
                  {a.date && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{a.date}</span>}
                </div>
                {a.summary && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{a.summary}</p>}
                {a.sourceUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700">
                      <ExternalLink className="w-3 h-3" />查看原始出处 -> {a.sourceName}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
