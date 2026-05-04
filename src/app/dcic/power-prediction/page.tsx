"use client";

import Link from "next/link";
import { Wind, Sun, Activity, Target, TrendingUp, Clock } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const predictionTasks = [
  {
    title: "风电功率预测",
    desc: "基于时序大模型预测风电场未来4小时超短期和24小时短期功率",
    icon: Wind,
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100 text-blue-600",
    href: "/dcic/power-wind",
    stations: 5,
    capacity: "801.5 MW",
    nmaeShort: "< 8%",
    nmaeUltra: "< 5%",
  },
  {
    title: "光伏功率预测",
    desc: "基于时序大模型预测光伏场站未来4小时超短期和24小时短期功率",
    icon: Sun,
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 text-amber-600",
    href: "/dcic/power-solar",
    stations: 5,
    capacity: "474.48 MW",
    nmaeShort: "< 5%",
    nmaeUltra: "< 3%",
  },
];

export default function PowerPredictionPage() {
  return (
    <PageLayout
      title="新能源功率预测挑战"
      description="数字中国创新大赛2026 - 人工智能赛道 | 基于时序大模型的新能源微观气象要素与功率预测"
    >
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  赛题简介
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  基于时序大模型的新能源微观气象要素与功率预测，由国网福建省电力有限公司出题。
                  目标是对5个风电场和5个光伏场站进行超短期(4h)和短期(24h)功率预测。
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-700">风电预测</Badge>
                  <Badge className="bg-amber-100 text-amber-700">
                    光伏预测
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    时序大模型
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">10</p>
                  <p className="text-xs text-slate-500">场站</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">1276</p>
                  <p className="text-xs text-slate-500">MW总量</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">NMAE</p>
                  <p className="text-xs text-slate-500">评估指标</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictionTasks.map((task) => {
            const Icon = task.icon;
            return (
              <Link key={task.title} href={task.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className={`h-1.5 bg-gradient-to-r ${task.color}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${task.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">{task.desc}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <p className="text-sm font-bold text-slate-900">
                          {task.stations}
                        </p>
                        <p className="text-xs text-slate-500">场站数</p>
                      </div>
                      <div className="text-center bg-slate-50 rounded-lg p-2">
                        <p className="text-sm font-bold text-slate-900">
                          {task.capacity}
                        </p>
                        <p className="text-xs text-slate-500">总装机</p>
                      </div>
                      <div className="text-center bg-blue-50 rounded-lg p-2">
                        <p className="text-sm font-bold text-blue-600">
                          {task.nmaeShort}
                        </p>
                        <p className="text-xs text-slate-500">短期NMAE</p>
                      </div>
                      <div className="text-center bg-emerald-50 rounded-lg p-2">
                        <p className="text-sm font-bold text-emerald-600">
                          {task.nmaeUltra}
                        </p>
                        <p className="text-xs text-slate-500">超短期NMAE</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              技术方案
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  name: "数据预处理",
                  items: ["缺失值填充", "异常值检测", "数据标准化"],
                },
                {
                  name: "特征工程",
                  items: ["气象特征", "时间特征", "滞后特征", "滑动窗口"],
                },
                {
                  name: "模型架构",
                  items: ["PatchTST", "iTransformer", "LSTM", "XGBoost"],
                },
                {
                  name: "优化策略",
                  items: ["多尺度预测", "多场站联合", "模型集成"],
                },
              ].map((layer) => (
                <div key={layer.name} className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-slate-700 mb-2">
                    {layer.name}
                  </h3>
                  <ul className="space-y-1">
                    {layer.items.map((item) => (
                      <li
                        key={item}
                        className="text-xs text-slate-500 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 bg-slate-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-slate-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              赛程安排
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { phase: "A榜评测", date: "2025.11-12", desc: "功率预测提交" },
                { phase: "B榜评测", date: "2025.12", desc: "模型封装提交" },
                { phase: "决赛答辩", date: "2026.01", desc: "现场演示" },
                { phase: "颁奖典礼", date: "2026.02", desc: "获奖公示" },
              ].map((p, i) => (
                <div key={p.phase} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.phase}</p>
                    <p className="text-xs text-slate-500">
                      {p.date} | {p.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
