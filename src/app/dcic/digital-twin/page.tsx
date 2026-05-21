"use client";

import { useState } from "react";
import {
  Cpu,
  Globe,
  Zap,
  Battery,
  Activity,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const generationData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  光伏:
    i >= 6 && i <= 18
      ? 800 * Math.sin((Math.PI * (i - 6)) / 12) + Math.random() * 50
      : 0,
  风电:
    200 + 100 * Math.sin((2 * Math.PI * i) / 24) + (Math.random() - 0.5) * 30,
  火电: 600 - 100 * Math.sin((2 * Math.PI * i) / 24),
}));

const loadData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  实际负荷:
    1200 +
    400 * Math.sin((2 * Math.PI * (i - 8)) / 24) +
    (Math.random() - 0.5) * 50,
  优化负荷:
    1200 +
    400 * Math.sin((2 * Math.PI * (i - 8)) / 24) +
    (Math.random() - 0.5) * 30,
}));

const optimizationResults = [
  { metric: "新能源消纳率", before: "78%", after: "95%", improvement: "+17%" },
  {
    metric: "系统运行成本",
    before: "¥45万/日",
    after: "¥38万/日",
    improvement: "-15%",
  },
  { metric: "峰谷差率", before: "35%", after: "22%", improvement: "-13%" },
  { metric: "电压合格率", before: "96%", after: "99.5%", improvement: "+3.5%" },
];

export default function DigitalTwinPage() {
  const [region, setRegion] = useState("福州园区");

  return (
    <PageLayout
      title="新型电力系统数字化创新"
      description="基于数字孪生与多智能体协同的源网荷储一体化智慧调度平台"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Cpu,
              label: "接入设备",
              value: "12,450",
              color: "text-blue-600",
            },
            {
              icon: Zap,
              label: "日发电量",
              value: "1.2万MWh",
              color: "text-emerald-600",
            },
            {
              icon: Activity,
              label: "响应时间",
              value: "<50ms",
              color: "text-amber-500",
            },
            {
              icon: TrendingUp,
              label: "新能源占比",
              value: "68%",
              color: "text-slate-600",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-slate-500">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="福州园区">福州园区</SelectItem>
              <SelectItem value="厦门区域">厦门区域</SelectItem>
              <SelectItem value="泉州工业带">泉州工业带</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-slate-500">
            选择监测区域查看数字孪生数据
          </span>
        </div>

        <Tabs defaultValue="generation">
          <TabsList>
            <TabsTrigger value="generation">源侧出力</TabsTrigger>
            <TabsTrigger value="load">负荷曲线</TabsTrigger>
            <TabsTrigger value="optimization">优化效果</TabsTrigger>
            <TabsTrigger value="architecture">系统架构</TabsTrigger>
          </TabsList>

          <TabsContent value="generation">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  多能源出力曲线 (数字孪生实时数据)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11 }}
                        interval={3}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="光伏"
                        name="光伏发电(MW)"
                        stackId="1"
                        fill="#f59e0b"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="风电"
                        name="风电发电(MW)"
                        stackId="2"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="火电"
                        name="火电发电(MW)"
                        stackId="3"
                        fill="#64748b"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="load">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">负荷曲线与优化调度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={loadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 11 }}
                        interval={3}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="实际负荷"
                        name="实际负荷(MW)"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="优化负荷"
                        name="优化后负荷(MW)"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">削峰效果：</span>
                      高峰期负荷降低12%，减少电网压力
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      <span className="font-semibold">填谷效果：</span>
                      低谷期负荷提升15%，提高设备利用率
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">协同优化效果对比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">指标</th>
                        <th className="text-right py-2 px-3">优化前</th>
                        <th className="text-right py-2 px-3">优化后</th>
                        <th className="text-right py-2 px-3">改善</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimizationResults.map((r) => (
                        <tr key={r.metric} className="border-b">
                          <td className="py-2 px-3 font-medium">{r.metric}</td>
                          <td className="text-right py-2 px-3 text-slate-500">
                            {r.before}
                          </td>
                          <td className="text-right py-2 px-3 text-emerald-600 font-semibold">
                            {r.after}
                          </td>
                          <td className="text-right py-2 px-3 text-blue-600">
                            {r.improvement}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  三层架构：物理电网-数字孪生-多智能体
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <pre className="text-xs text-slate-600 font-mono leading-relaxed">
                    {`┌─────────────────────────────────────────────────────────┐
│                    中心层：数字孪生平台                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 全域态势感知 │  │ 安全边界计算 │  │ 市场规则下发 │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   光伏智能体    │ │   储能智能体    │ │  充电桩智能体   │
│  本地预测优化   │ │  充放电策略    │ │  V2G协同调度   │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    物理电网层                            │
│    光伏场站  │  储能电站  │  充电站  │  可控负荷         │
└─────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-semibold text-blue-700">数字孪生平台</p>
                    <p className="text-xs text-slate-600 mt-1">
                      全局态势感知、安全边界计算
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="font-semibold text-emerald-700">
                      多智能体集群
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      分布式决策、局部优化
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="font-semibold text-amber-700">物理电网</p>
                    <p className="text-xs text-slate-600 mt-1">
                      源网荷储协同运行
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
