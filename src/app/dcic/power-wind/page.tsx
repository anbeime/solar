"use client";

import { useState } from "react";
import { Wind, Activity, Target, TrendingUp, Clock } from "lucide-react";
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

const windStations = [
  { id: "113997366155018679", name: "风电场 A", capacity: 604.0 },
  { id: "113997367262314761", name: "风电场 B", capacity: 96.0 },
  { id: "113997367262314948", name: "风电场 C", capacity: 40.0 },
  { id: "113997367329423616", name: "风电场 D", capacity: 12.0 },
  { id: "113997367346200670", name: "风电场 E", capacity: 49.5 },
];

const generateWindData = (baseCapacity: number) =>
  Array.from({ length: 96 }, (_, i) => {
    const hour = i / 4;
    const power = Math.max(
      0,
      baseCapacity *
        (0.3 +
          0.4 * Math.sin((2 * Math.PI * hour) / 24) +
          0.2 * Math.sin((2 * Math.PI * hour) / 6) +
          (Math.random() - 0.5) * 0.15),
    );
    return {
      time: `${Math.floor(hour).toString().padStart(2, "0")}:${((hour % 1) * 60).toString().padStart(2, "0")}`,
      actual: power.toFixed(2),
      predicted: (power * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2),
    };
  });

const stationMetrics = [
  { name: "风电场 A", capacity: 604.0, nmaeShort: 7.2, nmaeUltra: 4.8 },
  { name: "风电场 B", capacity: 96.0, nmaeShort: 7.8, nmaeUltra: 5.2 },
  { name: "风电场 C", capacity: 40.0, nmaeShort: 8.1, nmaeUltra: 5.5 },
  { name: "风电场 D", capacity: 12.0, nmaeShort: 8.5, nmaeUltra: 5.8 },
  { name: "风电场 E", capacity: 49.5, nmaeShort: 7.5, nmaeUltra: 5.0 },
];

export default function PowerWindPage() {
  const [station, setStation] = useState("113997366155018679");
  const [forecastType, setForecastType] = useState("24h");

  const selectedStationData =
    windStations.find((s) => s.id === station) || windStations[0];
  const chartData = generateWindData(selectedStationData.capacity);
  const displayData =
    forecastType === "24h" ? chartData.slice(0, 96) : chartData.slice(0, 16);

  return (
    <PageLayout
      title="风电功率预测"
      description="基于时序大模型预测风电场未来4小时超短期和24小时短期功率"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Wind,
              label: "风电场数",
              value: "5",
              color: "text-blue-600",
            },
            {
              icon: Activity,
              label: "总装机容量",
              value: "801.5 MW",
              color: "text-emerald-600",
            },
            {
              icon: Target,
              label: "短期NMAE",
              value: "< 8%",
              color: "text-amber-500",
            },
            {
              icon: TrendingUp,
              label: "超短期NMAE",
              value: "< 5%",
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
          <Select value={station} onValueChange={setStation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {windStations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.capacity} MW)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={forecastType} onValueChange={setForecastType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">短期预测(24h)</SelectItem>
              <SelectItem value="4h">超短期预测(4h)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="forecast">
          <TabsList>
            <TabsTrigger value="forecast">功率预测</TabsTrigger>
            <TabsTrigger value="metrics">评估指标</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedStationData.name} -{" "}
                  {forecastType === "24h" ? "24小时" : "4小时"}功率预测
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11 }}
                        interval={forecastType === "24h" ? 11 : 3}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        name="实际功率(MW)"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                      />
                      <Area
                        type="monotone"
                        dataKey="predicted"
                        name="预测功率(MW)"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">各风电场NMAE指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">风电场</th>
                        <th className="text-right py-2 px-3">装机容量(MW)</th>
                        <th className="text-right py-2 px-3">短期NMAE(24h)</th>
                        <th className="text-right py-2 px-3">超短期NMAE(4h)</th>
                        <th className="text-left py-2 px-3">评级</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stationMetrics.map((s) => (
                        <tr key={s.name} className="border-b">
                          <td className="py-2 px-3 font-medium">{s.name}</td>
                          <td className="text-right py-2 px-3">{s.capacity}</td>
                          <td className="text-right py-2 px-3">
                            <span
                              className={
                                s.nmaeShort < 8
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }
                            >
                              {s.nmaeShort}%
                            </span>
                          </td>
                          <td className="text-right py-2 px-3">
                            <span
                              className={
                                s.nmaeUltra < 5
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }
                            >
                              {s.nmaeUltra}%
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${s.nmaeShort < 8 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {s.nmaeShort < 8 ? "优秀" : "良好"}
                            </span>
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
