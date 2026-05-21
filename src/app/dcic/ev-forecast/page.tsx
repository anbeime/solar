"use client";

import { useState } from "react";
import { Activity, TrendingUp, Target, Zap } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  BarChart,
  Bar,
} from "recharts";

const forecastData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  actual:
    5 + 2 * Math.sin((2 * Math.PI * i) / 24) + (Math.random() - 0.5) * 0.6,
  predicted:
    5 + 2 * Math.sin((2 * Math.PI * i) / 24) + (Math.random() - 0.5) * 0.4,
  upper: 5 + 2 * Math.sin((2 * Math.PI * i) / 24) + 0.5,
  lower: 5 + 2 * Math.sin((2 * Math.PI * i) / 24) - 0.5,
}));

const modelMetrics = [
  { model: "XGBoost", mae: 0.92, rmse: 1.15, mape: 8.5 },
  { model: "LightGBM", mae: 0.88, rmse: 1.08, mape: 7.8 },
  { model: "LSTM", mae: 0.85, rmse: 1.02, mape: 7.2 },
  { model: "Transformer", mae: 0.82, rmse: 0.98, mape: 6.8 },
  { model: "集成模型", mae: 0.78, rmse: 0.95, mape: 6.5 },
];

const features = [
  { name: "小时特征", importance: 0.25 },
  { name: "历史负荷", importance: 0.22 },
  { name: "星期特征", importance: 0.15 },
  { name: "温度数据", importance: 0.12 },
  { name: "节假日", importance: 0.1 },
  { name: "滞后特征", importance: 0.08 },
  { name: "滚动均值", importance: 0.05 },
  { name: "月份特征", importance: 0.03 },
];

export default function EVForecastPage() {
  const [station, setStation] = useState("全部站点");
  const [model, setModel] = useState("集成模型");

  return (
    <PageLayout
      title="任务一：充电负荷预测"
      description="基于历史充电数据，构建AI预测模型，预测未来24小时充电负荷曲线"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Activity,
              label: "预测MAE",
              value: "0.78 MW",
              delta: "-12%",
              color: "text-blue-600",
            },
            {
              icon: Target,
              label: "预测精度",
              value: "93.5%",
              delta: "+3.2%",
              color: "text-emerald-600",
            },
            {
              icon: TrendingUp,
              label: "峰值预测",
              value: "8.5 MW",
              delta: "+5%",
              color: "text-amber-600",
            },
            {
              icon: Zap,
              label: "响应时间",
              value: "<100ms",
              delta: "正常",
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

        <div className="flex gap-4 items-center">
          <Select value={station} onValueChange={setStation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部站点">全部站点</SelectItem>
              <SelectItem value="站1">充电站 A</SelectItem>
              <SelectItem value="站2">充电站 B</SelectItem>
              <SelectItem value="站3">充电站 C</SelectItem>
            </SelectContent>
          </Select>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="集成模型">集成模型</SelectItem>
              <SelectItem value="LSTM">LSTM</SelectItem>
              <SelectItem value="Transformer">Transformer</SelectItem>
              <SelectItem value="XGBoost">XGBoost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="forecast">
          <TabsList>
            <TabsTrigger value="forecast">预测曲线</TabsTrigger>
            <TabsTrigger value="metrics">模型评估</TabsTrigger>
            <TabsTrigger value="features">特征分析</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">24小时负荷预测曲线</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        name="实际负荷"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#ef4444"
                        name="预测负荷"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="upper"
                        stroke="#94a3b8"
                        name="上限"
                        strokeDasharray="3 3"
                      />
                      <Line
                        type="monotone"
                        dataKey="lower"
                        stroke="#94a3b8"
                        name="下限"
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">模型评估指标对比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="mae" fill="#3b82f6" name="MAE" />
                      <Bar dataKey="rmse" fill="#10b981" name="RMSE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">模型</th>
                        <th className="text-right py-2 px-3">MAE</th>
                        <th className="text-right py-2 px-3">RMSE</th>
                        <th className="text-right py-2 px-3">MAPE (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelMetrics.map((m) => (
                        <tr key={m.model} className="border-b">
                          <td className="py-2 px-3">{m.model}</td>
                          <td className="text-right py-2 px-3">{m.mae}</td>
                          <td className="text-right py-2 px-3">{m.rmse}</td>
                          <td className="text-right py-2 px-3">{m.mape}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">特征重要性分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={features} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip />
                      <Bar dataKey="importance" fill="#8b5cf6" name="重要性" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
