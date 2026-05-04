"use client";

import Link from "next/link";
import {
  Battery,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
} from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const evTasks = [
  {
    title: "任务一：充电负荷预测",
    desc: "基于历史充电数据，构建AI预测模型，预测未来24小时充电负荷曲线",
    icon: Activity,
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-100 text-blue-600",
    href: "/dcic/ev-forecast",
    metrics: [
      { label: "MAE", value: "0.85 MW" },
      { label: "RMSE", value: "1.02" },
      { label: "MAPE", value: "7.2%" },
    ],
  },
  {
    title: "任务二：V2G站域策略优化",
    desc: "在保障电池健康前提下，制定最优充放电策略，最大化运营收益",
    icon: Battery,
    color: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-100 text-emerald-600",
    href: "/dcic/ev-v2g",
    metrics: [
      { label: "日收益", value: "+¥2,450" },
      { label: "用户满意", value: "92%" },
      { label: "新能源消纳", value: "85%" },
    ],
  },
  {
    title: "任务三：车网协同调度",
    desc: "实现车网互动协同调度，保障配电网电压安全并实现削峰填谷",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-100 text-amber-600",
    href: "/dcic/ev-grid",
    metrics: [
      { label: "电压合格", value: "99.5%" },
      { label: "削峰效果", value: "15.2%" },
      { label: "网损降低", value: "8.5%" },
    ],
  },
];

export default function EVChargingPage() {
  return (
    <PageLayout
      title="电动汽车充电站协同优化挑战"
      description="数字中国创新大赛2026 - 数据应用赛道 | 基于多源数据融合的电动汽车充电站协同优化"
    >
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  比赛简介
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  本挑战赛由国网福建省电力有限公司和国网智慧车联网技术有限公司联合出题，
                  旨在通过多源数据融合，实现电动汽车充电站的智能协同优化。奖金池
                  ¥185,000。
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-700">负荷预测</Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    V2G优化
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700">
                    协同调度
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-xs text-slate-500">核心任务</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">¥185K</p>
                  <p className="text-xs text-slate-500">奖金池</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">5</p>
                  <p className="text-xs text-slate-500">数据源</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {evTasks.map((task) => {
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
                    <div className="grid grid-cols-3 gap-2">
                      {task.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="text-center bg-slate-50 rounded-lg p-2"
                        >
                          <p className="text-sm font-bold text-slate-900">
                            {m.value}
                          </p>
                          <p className="text-xs text-slate-500">{m.label}</p>
                        </div>
                      ))}
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
              <BarChart3 className="w-4 h-4 text-slate-500" />
              技术架构
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  name: "数据层",
                  items: ["充电站数据", "天气数据", "电价数据", "交通数据"],
                },
                {
                  name: "模型层",
                  items: ["LSTM", "Transformer", "XGBoost", "LightGBM"],
                },
                { name: "优化层", items: ["MPC", "DQN", "ADMM", "CVXPY"] },
                {
                  name: "应用层",
                  items: ["可视化", "API接口", "报告生成", "实时监控"],
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
      </div>
    </PageLayout>
  );
}
