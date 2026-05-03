"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Building2,
  CalendarDays,
  Search,
  ExternalLink,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/page-layout";
import { SimpleStatCards } from "@/components/stat-cards";
import type { BiddingItem } from "@/lib/types";

export default function BiddingPage() {
  const [items, setItems] = useState<BiddingItem[]>([]);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("全部");
  const [status, setStatus] = useState("全部");

  useEffect(() => {
    fetch("/data/bidding.json")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  const provinces = [
    "全部",
    ...Array.from(new Set(items.map((i) => i.province).filter(Boolean))).sort(),
  ];

  const filtered = items.filter((b) => {
    const mp = province === "全部" || b.province === province;
    const ms = status === "全部" || b.status === status;
    const mq =
      !search ||
      b.title.includes(search) ||
      (b.company && b.company.includes(search)) ||
      (b.summary && b.summary.includes(search));
    return mp && ms && mq;
  });

  const activeCount = filtered.filter((b) => b.status === "报名中").length;

  return (
    <PageLayout
      title="招标公告"
      description="最新光伏储能招标公告，每条均标注原始出处"
    >
      <SimpleStatCards
        items={[
          {
            value: filtered.length,
            label: "招标公告",
            color: "text-purple-600",
          },
          { value: activeCount, label: "报名中", color: "text-amber-600" },
          {
            value: filtered.filter((b) => b.amount).length,
            label: "含预算信息",
            color: "text-blue-600",
          },
        ]}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="搜索招标标题、公司..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["全部", "报名中", "已截止"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((b) => (
          <Card
            key={b.id}
            className="hover:shadow-md transition-shadow border border-slate-200/80 shadow-sm"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">
                    {b.title}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {b.category && (
                      <Badge variant="outline" className="text-xs">
                        {b.category}
                      </Badge>
                    )}
                    <Badge
                      variant={b.status === "报名中" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {b.status}
                    </Badge>
                    {b.province && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {b.province}
                      </span>
                    )}
                    {b.capacity && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {b.capacity}
                      </span>
                    )}
                    {b.amount && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {b.amount}
                      </span>
                    )}
                    {b.company && <span>企业：{b.company}</span>}
                    {b.date && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {b.date}
                      </span>
                    )}
                  </div>
                  {b.summary && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                      {b.summary}
                    </p>
                  )}
                </div>
              </div>
              {b.sourceUrl && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <a
                    href={b.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    查看原始出处 - {b.sourceName}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
