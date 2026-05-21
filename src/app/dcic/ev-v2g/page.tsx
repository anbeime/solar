"use client";

import { Battery, Sun, DollarSign, HeartPulse, TrendingUp } from "lucide-react";
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
  BarChart,
  Bar,
  ComposedChart,
} from "recharts";

const chargeData = Array.from({ length: 24 }, (_, i) => {
  const solar = i >= 6 && i <= 18 ? 50 * Math.sin((Math.PI * (i - 6)) / 12) : 0;
  const isPeak = (i >= 10 && i <= 14) || (i >= 18 && i <= 21);
  const chargePower = i < 6 ? Math.random() * 5 + 5 : 0;
  const dischargePower = isPeak ? Math.random() * 4 + 3 : 0;
  return {
    hour: `${i.toString().padStart(2, "0")}:00`,
    solar,
    charge: chargePower,
    discharge: dischargePower,
    price: [
      0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.8, 0.8, 0.8, 1.2, 1.2, 1.2, 1.2, 1.2,
      0.8, 0.8, 0.8, 1.2, 1.2, 1.2, 0.8, 0.3, 0.3,
    ][i],
  };
});

const optimizationResults = [
  {
    optimizer: "集中式优化",
    revenue: 2450,
    satisfaction: 92,
    renewable: 85,
    batteryHealth: 0.95,
  },
  {
    optimizer: "分布式ADMM",
    revenue: 2380,
    satisfaction: 88,
    renewable: 82,
    batteryHealth: 0.93,
  },
  {
    optimizer: "规则策略",
    revenue: 1890,
    satisfaction: 75,
    renewable: 68,
    batteryHealth: 0.9,
  },
];

export default function EVV2GPage() {
  return (
    <PageLayout
      title="任务二：V2G站域策略优化"
      description="在保障用户电池健康度与出行需求的前提下，充分利用光伏等可再生能源，制定最优充放电策略"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: DollarSign,
              label: "日运营收益",
              value: "+¥2,450",
              delta: "+28%",
              color: "text-emerald-600",
            },
            {
              icon: HeartPulse,
              label: "用户满意度",
              value: "92%",
              delta: "+15%",
              color: "text-blue-600",
            },
            {
              icon: Sun,
              label: "新能源消纳",
              value: "85%",
              delta: "+22%",
              color: "text-amber-500",
            },
            {
              icon: Battery,
              label: "电池健康指数",
              value: "0.95",
              delta: "良好",
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
                <p className="text-xs text-emerald-600">{stat.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="strategy">
          <TabsList>
            <TabsTrigger value="strategy">充放电策略</TabsTrigger>
            <TabsTrigger value="solar">光伏消纳</TabsTrigger>
            <TabsTrigger value="comparison">优化对比</TabsTrigger>
          </TabsList>

          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  V2G充放电策略与电价曲线
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chargeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="charge"
                        name="充电功率(kW)"
                        fill="#10b981"
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="discharge"
                        name="放电功率(kW)"
                        fill="#ef4444"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="price"
                        name="电价(元/kWh)"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">策略说明</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>谷时充电(00:00-06:00)：电价低时为车辆充电，储存电能</li>
                    <li>
                      峰时放电(10:00-14:00,
                      18:00-21:00)：电价高时向电网放电，获取收益
                    </li>
                    <li>光伏优先消纳：白天优先使用光伏发电，减少购电成本</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solar">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">光伏出力与消纳曲线</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chargeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="solar"
                        name="光伏出力(kW)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="#f59e0b"
                        fillOpacity={0.3}
                      />
                      <Line
                        type="monotone"
                        dataKey="charge"
                        name="充电功率(kW)"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">优化效果评估</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={optimizationResults}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="optimizer" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" name="日收益(¥)" fill="#10b981" />
                      <Bar
                        dataKey="satisfaction"
                        name="用户满意度(%)"
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">优化器</th>
                        <th className="text-right py-2 px-3">日收益</th>
                        <th className="text-right py-2 px-3">用户满意度</th>
                        <th className="text-right py-2 px-3">新能源消纳</th>
                        <th className="text-right py-2 px-3">电池健康</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optimizationResults.map((r) => (
                        <tr key={r.optimizer} className="border-b">
                          <td className="py-2 px-3">{r.optimizer}</td>
                          <td className="text-right py-2 px-3 text-emerald-600">
                            +¥{r.revenue}
                          </td>
                          <td className="text-right py-2 px-3">
                            {r.satisfaction}%
                          </td>
                          <td className="text-right py-2 px-3">
                            {r.renewable}%
                          </td>
                          <td className="text-right py-2 px-3">
                            {r.batteryHealth}
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
