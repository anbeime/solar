"use client";

import { useState } from "react";
import { Sun, Activity, Target, TrendingUp, Clock } from "lucide-react";
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

const solarStations = [
  { id: "113997366155018885", name: "光伏电站 A", capacity: 300.0 },
  { id: "113997367312946163", name: "光伏电站 B", capacity: 100.0 },
  { id: "113997367346200913", name: "光伏电站 C", capacity: 10.0 },
  { id: "113997367354200675", name: "光伏电站 D", capacity: 20.48 },
  { id: "113997367354200693", name: "光伏电站 E", capacity: 44.0 },
];

const generateSolarData = (baseCapacity: number) =>
  Array.from({ length: 96 }, (_, i) => {
    const hour = i / 4;
    const isDay = hour >= 6 && hour <= 18;
    const solarFactor = isDay ? Math.sin((Math.PI * (hour - 6)) / 12) : 0;
    const power = isDay
      ? baseCapacity * solarFactor * (0.85 + (Math.random() - 0.5) * 0.1)
      : 0;
    return {
      time: `${Math.floor(hour).toString().padStart(2, "0")}:${((hour % 1) * 60).toString().padStart(2, "0")}`,
      actual: power.toFixed(2),
      predicted: isDay ? power * (1 + (Math.random() - 0.5) * 0.03) : 0,
    };
  });

const stationMetrics = [
  { name: "光伏电站 A", capacity: 300.0, nmaeShort: 4.2, nmaeUltra: 2.8 },
  { name: "光伏电站 B", capacity: 100.0, nmaeShort: 4.5, nmaeUltra: 3.0 },
  { name: "光伏电站 C", capacity: 10.0, nmaeShort: 5.1, nmaeUltra: 3.5 },
  { name: "光伏电站 D", capacity: 20.48, nmaeShort: 4.8, nmaeUltra: 3.2 },
  { name: "光伏电站 E", capacity: 44.0, nmaeShort: 4.4, nmaeUltra: 2.9 },
];

export default function PowerSolarPage() {
  const [station, setStation] = useState("113997366155018885");
  const [forecastType, setForecastType] = useState("24h");

  const selectedStationData =
    solarStations.find((s) => s.id === station) || solarStations[0];
  const chartData = generateSolarData(selectedStationData.capacity);
  const displayData =
    forecastType === "24h" ? chartData.slice(0, 96) : chartData.slice(0, 16);

  return (
    <PageLayout
      title="光伏功率预测"
      description="基于时序大模型预测光伏场站未来4小时超短期和24小时短期功率"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Sun,
              label: "光伏电站数",
              value: "5",
              color: "text-amber-500",
            },
            {
              icon: Activity,
              label: "总装机容量",
              value: "474.48 MW",
              color: "text-emerald-600",
            },
            {
              icon: Target,
              label: "短期NMAE",
              value: "< 5%",
              color: "text-amber-500",
            },
            {
              icon: TrendingUp,
              label: "超短期NMAE",
              value: "< 3%",
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
              {solarStations.map((s) => (
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
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.2}
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
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">光伏特性：</span>
                    光伏发电受光照影响明显，夜间功率为0，白天呈抛物线分布，预测需考虑天气因素
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">各光伏电站NMAE指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">光伏电站</th>
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
                                s.nmaeShort < 5
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
                                s.nmaeUltra < 3
                                  ? "text-emerald-600"
                                  : "text-amber-600"
                              }
                            >
                              {s.nmaeUltra}%
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${s.nmaeShort < 5 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {s.nmaeShort < 5 ? "优秀" : "良好"}
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
