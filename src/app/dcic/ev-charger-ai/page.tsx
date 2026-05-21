"use client";

import { useState } from "react";
import {
  MapPin,
  Target,
  TrendingUp,
  Users,
  Star,
  Sparkles,
} from "lucide-react";
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const chargingData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  demand:
    20 +
    15 * Math.sin((2 * Math.PI * (i - 8)) / 24) +
    (Math.random() - 0.5) * 5,
  predicted: 20 + 15 * Math.sin((2 * Math.PI * (i - 8)) / 24),
}));

const clusterData = [
  {
    name: "科技园区域",
    lat: 22.54,
    lon: 113.94,
    count: 120,
    score: 4.2,
    cluster: 0,
  },
  {
    name: "南山中心区",
    lat: 22.53,
    lon: 113.93,
    count: 85,
    score: 4.5,
    cluster: 1,
  },
  {
    name: "西部沿海区",
    lat: 22.51,
    lon: 113.9,
    count: 48,
    score: 3.8,
    cluster: 2,
  },
];

const modelMetrics = [
  { model: "LSTM双层网络", mape: 16.76, r2: 0.91, rmse: 8.34, mae: 6.12 },
  { model: "Prophet", mape: 22.3, r2: 0.85, rmse: 10.5, mae: 7.8 },
  { model: "ARIMA", mape: 25.1, r2: 0.79, rmse: 12.1, mae: 9.2 },
  { model: "XGBoost", mape: 18.9, r2: 0.88, rmse: 9.2, mae: 6.8 },
];

const optimizationSuggestions = [
  {
    cluster: "科技园区域",
    status: "运营优化",
    suggestion: "建议优化运维响应速度，提升高峰期服务能力",
    color: "blue",
  },
  {
    cluster: "南山中心区",
    status: "保持现状",
    suggestion: "布局适中，维持现有运营策略",
    color: "emerald",
  },
  {
    cluster: "西部沿海区",
    status: "建议增设",
    suggestion: "建议增设5-8个快充站点，预计覆盖提升25%",
    color: "amber",
  },
];

export default function EVChargerAIPage() {
  const [cluster, setCluster] = useState("全部");

  return (
    <PageLayout
      title="AI赋能充电桩智能布局优化"
      description="基于AI知数平台能源统计数据与高德地图空间数据的充电桩智能布局优化研究"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: MapPin,
              label: "充电桩总数",
              value: "253",
              color: "text-blue-600",
            },
            {
              icon: Target,
              label: "K-Means轮廓系数",
              value: "0.305",
              color: "text-emerald-600",
            },
            {
              icon: TrendingUp,
              label: "LSTM预测MAPE",
              value: "16.76%",
              color: "text-amber-500",
            },
            {
              icon: Sparkles,
              label: "覆盖率提升",
              value: "+25%",
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

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-blue-100 text-blue-700">
                K-Means空间聚类
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700">
                LSTM时序预测
              </Badge>
              <Badge className="bg-amber-100 text-amber-700">
                多源数据融合
              </Badge>
              <Badge className="bg-purple-100 text-purple-700">
                实证分析验证
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mt-3">
              创新性整合AI知数平台能源统计数据与高德地图API空间数据，以深圳市南山区253个充电桩为研究对象，
              通过K-Means聚类识别空间分布特征，LSTM深度学习模型预测充电需求时序规律。
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="demand">
          <TabsList>
            <TabsTrigger value="demand">需求预测</TabsTrigger>
            <TabsTrigger value="clusters">空间聚类</TabsTrigger>
            <TabsTrigger value="metrics">模型性能</TabsTrigger>
            <TabsTrigger value="suggestions">优化建议</TabsTrigger>
          </TabsList>

          <TabsContent value="demand">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  充电需求时序预测 (LSTM双层网络)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chargingData}>
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
                        dataKey="demand"
                        name="实际需求"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="LSTM预测"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    模型成功捕捉工作日早晚高峰(
                    <strong>8:00-9:00, 18:00-20:00</strong>)需求规律，
                    预测精度达到业界先进水平(MAPE&lt;20%, R²&gt;0.9)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clusters">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  K-Means空间聚类分析 (K=3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis
                        dataKey="lon"
                        name="经度"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        dataKey="lat"
                        name="纬度"
                        tick={{ fontSize: 11 }}
                      />
                      <ZAxis dataKey="count" name="充电桩数量" />
                      <Tooltip />
                      <Legend />
                      <Scatter
                        name="科技园区域"
                        data={clusterData.filter((c) => c.cluster === 0)}
                        fill="#3b82f6"
                      />
                      <Scatter
                        name="南山中心区"
                        data={clusterData.filter((c) => c.cluster === 1)}
                        fill="#10b981"
                      />
                      <Scatter
                        name="西部沿海区"
                        data={clusterData.filter((c) => c.cluster === 2)}
                        fill="#f59e0b"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {clusterData.map((c) => (
                    <div key={c.name} className="bg-slate-50 rounded-lg p-3">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        充电桩: {c.count} | 评分: {c.score}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  时序预测模型性能对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">模型</th>
                        <th className="text-right py-2 px-3">MAPE(%)</th>
                        <th className="text-right py-2 px-3">R²</th>
                        <th className="text-right py-2 px-3">RMSE</th>
                        <th className="text-right py-2 px-3">MAE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelMetrics.map((m) => (
                        <tr key={m.model} className="border-b">
                          <td className="py-2 px-3 font-medium">{m.model}</td>
                          <td className="text-right py-2 px-3">
                            <span
                              className={
                                m.mape < 20
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }
                            >
                              {m.mape}
                            </span>
                          </td>
                          <td className="text-right py-2 px-3">{m.r2}</td>
                          <td className="text-right py-2 px-3">{m.rmse}</td>
                          <td className="text-right py-2 px-3">{m.mae}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    LSTM双层网络在所有指标上表现最优，是本研究的推荐模型
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">区域化优化建议</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationSuggestions.map((s) => (
                    <div
                      key={s.cluster}
                      className={`p-4 rounded-lg border ${
                        s.color === "blue"
                          ? "bg-blue-50 border-blue-200"
                          : s.color === "emerald"
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{s.cluster}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            s.color === "blue"
                              ? "border-blue-300 text-blue-700"
                              : s.color === "emerald"
                                ? "border-emerald-300 text-emerald-700"
                                : "border-amber-300 text-amber-700"
                          }`}
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{s.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
