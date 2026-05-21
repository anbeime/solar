"use client";

import { Zap, Activity, TrendingUp, Shield } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const voltageData = Array.from({ length: 33 }, (_, i) => ({
  node: i + 1,
  voltage: 1.0 - 0.01 * Math.abs(i - 16) + (Math.random() - 0.5) * 0.01,
}));

const loadData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  original: 3000 + 1500 * Math.sin((2 * Math.PI * (i - 8)) / 24),
  optimized:
    3000 +
    1500 *
      Math.sin((2 * Math.PI * (i - 8)) / 24) *
      (i >= 9 && i <= 18 ? 0.88 : i < 6 ? 1.15 : 1),
}));

const schedulingResults = [
  {
    optimizer: "集中式优化",
    voltage: "99.8%",
    peakReduction: "15.2%",
    lossReduction: "8.5%",
    convergenceTime: "0.5s",
  },
  {
    optimizer: "分布式ADMM",
    voltage: "99.5%",
    peakReduction: "14.8%",
    lossReduction: "8.2%",
    convergenceTime: "2.3s",
  },
  {
    optimizer: "规则策略",
    voltage: "97.2%",
    peakReduction: "10.5%",
    lossReduction: "5.1%",
    convergenceTime: "0.1s",
  },
];

export default function EVGridPage() {
  return (
    <PageLayout
      title="任务三：车网协同调度"
      description="实现车网互动的协同调度，保障配电网电压安全并实现削峰填谷"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Shield,
              label: "电压合格率",
              value: "99.5%",
              delta: "+2.3%",
              color: "text-emerald-600",
            },
            {
              icon: TrendingUp,
              label: "削峰效果",
              value: "15.2%",
              delta: "达成",
              color: "text-blue-600",
            },
            {
              icon: Zap,
              label: "网损降低",
              value: "8.5%",
              delta: "显著",
              color: "text-amber-500",
            },
            {
              icon: Activity,
              label: "收敛时间",
              value: "0.5s",
              delta: "快速",
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
                <p className="text-xs text-slate-400">{stat.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="topology">
          <TabsList>
            <TabsTrigger value="topology">配电网拓扑</TabsTrigger>
            <TabsTrigger value="voltage">电压分布</TabsTrigger>
            <TabsTrigger value="peak">削峰填谷</TabsTrigger>
            <TabsTrigger value="results">调度效果</TabsTrigger>
          </TabsList>

          <TabsContent value="topology">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  配电网拓扑结构 (IEEE 33节点)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <pre className="text-xs text-slate-600 font-mono leading-relaxed">
                    {`                        [主变]
                           │
              ┌────────────┼────────────┐
              │            │            │
            [节点1]    [节点2]    [节点3]
              │            │            │
            ┌─┴─┐        ┌─┴─┐        ┌─┴─┐
           [站1]        [站2]        [站3]
             │            │            │
           ┌─┴─┐        ┌─┴─┐        ┌─┴─┐
         [EV1]        [EV2]        [EV3]`}
                  </pre>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border">
                      <p className="font-semibold">基准电压</p>
                      <p className="text-slate-600">12.66 kV</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="font-semibold">节点数</p>
                      <p className="text-slate-600">33 个</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="font-semibold">充电站</p>
                      <p className="text-slate-600">12 个接入点</p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="font-semibold">调度周期</p>
                      <p className="text-slate-600">15 分钟</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voltage">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">配电网节点电压分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={voltageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="node" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0.94, 1.06]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="voltage"
                        name="电压(p.u.)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => 1.05}
                        name="上限"
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => 0.95}
                        name="下限"
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    <span className="font-semibold">电压安全：</span>
                    所有节点电压均在 [0.95, 1.05] p.u. 范围内，电压合格率达
                    99.5%
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="peak">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">削峰填谷效果展示</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={loadData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="original"
                        name="原始负荷"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.1}
                      />
                      <Area
                        type="monotone"
                        dataKey="optimized"
                        name="优化后负荷"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">削峰区域：</span>
                      10:00-18:00 高峰时段负荷降低 12%
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-800">
                      <span className="font-semibold">填谷区域：</span>
                      00:00-06:00 低谷时段负荷提升 15%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">调度效果指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">优化器</th>
                        <th className="text-right py-2 px-3">电压合格率</th>
                        <th className="text-right py-2 px-3">削峰效果</th>
                        <th className="text-right py-2 px-3">网损降低</th>
                        <th className="text-right py-2 px-3">收敛时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedulingResults.map((r) => (
                        <tr key={r.optimizer} className="border-b">
                          <td className="py-2 px-3 font-medium">
                            {r.optimizer}
                          </td>
                          <td className="text-right py-2 px-3 text-emerald-600">
                            {r.voltage}
                          </td>
                          <td className="text-right py-2 px-3 text-blue-600">
                            {r.peakReduction}
                          </td>
                          <td className="text-right py-2 px-3 text-amber-600">
                            {r.lossReduction}
                          </td>
                          <td className="text-right py-2 px-3">
                            {r.convergenceTime}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
