'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { StatCardItem } from '@/lib/types';

interface StatCardsProps {
  items: StatCardItem[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

/**
 * 统计卡片组 - 用于各页面的汇总数据展示
 */
export function StatCards({ items, loading = false, columns = 4 }: StatCardsProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 mb-6`}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${item.bg || 'bg-slate-50'}`}>
                <Icon className={`w-5 h-5 ${item.color || 'text-slate-600'}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {loading ? '-' : item.value}
                </p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * 简单统计卡片 - 用于招标/中标等页面的简单数字展示
 */
export function SimpleStatCards({ items, loading = false }: { items: Array<{ value: number | string; label: string; color: string }>; loading?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {items.map((item, idx) => (
        <Card key={idx} className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{loading ? '-' : item.value}</p>
            <p className="text-xs text-slate-500">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
