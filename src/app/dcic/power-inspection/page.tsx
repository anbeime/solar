"use client";

import { Eye, FileCheck, Cpu, Sparkles, CheckCircle } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "recharts";

const defectTypes = [
  { name: "绝缘子破损", count: 1250, percentage: 35 },
  { name: "导线断股", count: 890, percentage: 25 },
  { name: "金具锈蚀", count: 720, percentage: 20 },
  { name: "螺栓松动", count: 430, percentage: 12 },
  { name: "其他缺陷", count: 280, percentage: 8 },
];

const detectionData = [
  { method: "YOLOv8", precision: 92.5, recall: 89.3, f1: 90.9 },
  { method: "Faster R-CNN", precision: 90.1, recall: 87.8, f1: 88.9 },
  { method: "SSD", precision: 87.3, recall: 85.2, f1: 86.2 },
  { method: " RetinaNet", precision: 89.8, recall: 86.5, f1: 88.1 },
];

const qualityMetrics = [
  { metric: "数据准确性", score: 96, weight: 40 },
  { metric: "标注一致性", score: 94, weight: 30 },
  { metric: "模型检测率", score: 91, weight: 20 },
  { metric: "技术创新性", score: 88, weight: 10 },
];

const processSteps = [
  { phase: "数据清洗", tasks: ["模糊图像过滤", "光照归一化", "异常值处理"] },
  { phase: "智能标注", tasks: ["预标注生成", "多阶段质检", "交叉验证"] },
  { phase: "数据合成", tasks: ["GAN增强", "小样本学习", "样本平衡"] },
  { phase: "模型训练", tasks: ["YOLOv10训练", "知识蒸馏", "边缘部署"] },
];

export default function PowerInspectionPage() {
  return (
    <PageLayout
      title="输电线路巡检缺陷检测"
      description="赛题1：输电线路巡检缺陷数据集构建与智能识别系统"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "缺陷图像",
              value: "3,570",
              icon: Eye,
              color: "text-blue-600",
            },
            {
              label: "标注质量",
              value: "95%+",
              icon: FileCheck,
              color: "text-emerald-600",
            },
            {
              label: "检测精度",
              value: "92.5%",
              icon: Cpu,
              color: "text-amber-500",
            },
            {
              label: "检测效率",
              value: "50ms/图",
              icon: Sparkles,
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

        <Tabs defaultValue="defects">
          <TabsList>
            <TabsTrigger value="defects">缺陷分布</TabsTrigger>
            <TabsTrigger value="detection">检测模型</TabsTrigger>
            <TabsTrigger value="quality">质量评估</TabsTrigger>
            <TabsTrigger value="process">处理流程</TabsTrigger>
          </TabsList>

          <TabsContent value="defects">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">缺陷类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={defectTypes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" name="样本数" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {defectTypes.map((d) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 w-24">
                          {d.name}
                        </span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 rounded-full h-2"
                            style={{ width: `${d.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-500 w-16">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detection">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  目标检测模型性能对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="method" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="precision"
                        name="精确率(%)"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="recall"
                        name="召回率(%)"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="f1"
                        name="F1分数"
                        stroke="#f59e0b"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">模型</th>
                        <th className="text-right py-2 px-3">精确率</th>
                        <th className="text-right py-2 px-3">召回率</th>
                        <th className="text-right py-2 px-3">F1分数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detectionData.map((m) => (
                        <tr key={m.method} className="border-b">
                          <td className="py-2 px-3 font-medium">{m.method}</td>
                          <td className="text-right py-2 px-3 text-blue-600">
                            {m.precision}%
                          </td>
                          <td className="text-right py-2 px-3 text-emerald-600">
                            {m.recall}%
                          </td>
                          <td className="text-right py-2 px-3 text-amber-600">
                            {m.f1}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  数据集质量评估（目标：国标95分+）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {qualityMetrics.map((m) => (
                    <div
                      key={m.metric}
                      className="bg-slate-50 rounded-lg p-4 text-center"
                    >
                      <div className="relative w-20 h-20 mx-auto mb-2">
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke={m.score >= 95 ? "#10b981" : "#3b82f6"}
                            strokeWidth="8"
                            strokeDasharray={`${(m.score / 100) * 226} 226`}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                          {m.score}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{m.metric}</p>
                      <p className="text-xs text-slate-500">权重 {m.weight}%</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    自动化质检流程确保标注质量闭环管理，多阶段协同标注提升一致性和准确性
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">数据处理流水线</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {processSteps.map((step, i) => (
                    <div key={step.phase} className="relative">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mb-3">
                          {i + 1}
                        </div>
                        <h3 className="font-semibold text-sm mb-2">
                          {step.phase}
                        </h3>
                        <ul className="space-y-1">
                          {step.tasks.map((t) => (
                            <li key={t} className="text-xs text-slate-500">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {i < 3 && (
                        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-slate-300">
                          →
                        </div>
                      )}
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
