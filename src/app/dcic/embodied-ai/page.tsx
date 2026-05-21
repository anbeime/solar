"use client";

import {
  Bot,
  Plane,
  Monitor,
  Cpu,
  Shield,
  Eye,
  Activity,
  Users,
} from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const robotTypes = [
  {
    type: "空中侦察机器人",
    icon: Plane,
    count: 3,
    role: "无人机空中巡检、变焦监测",
    color: "text-blue-600",
  },
  {
    type: "地面巡检机器人",
    icon: Monitor,
    count: 5,
    role: "变电站地面巡视、红外测温",
    color: "text-emerald-600",
  },
  {
    type: "精细操作机器人",
    icon: Bot,
    count: 2,
    role: "开关操作、拔插手车、螺栓拧紧",
    color: "text-amber-500",
  },
];

const taskAllocation = [
  {
    phase: "任务接收",
    tasks: ["任务指令解析", "环境感知", "安全评估"],
    duration: "2min",
  },
  {
    phase: "协同规划",
    tasks: ["任务分解", "路径规划", "资源分配"],
    duration: "3min",
  },
  {
    phase: "协同执行",
    tasks: ["空中侦察", "地面配合", "精细操作"],
    duration: "15min",
  },
  {
    phase: "结果校验",
    tasks: ["操作确认", "状态回传", "报告生成"],
    duration: "2min",
  },
];

const capabilities = [
  {
    name: "多模态感知融合",
    items: ["视觉+力觉融合", "激光雷达SLAM", "红外热成像"],
  },
  { name: "智能决策", items: ["多模态大模型推理", "强化学习策略", "规则引擎"] },
  { name: "精细操作", items: ["模仿学习控制", "力位混合控制", "视觉伺服"] },
  { name: "协同通信", items: ["5G低延时通信", "边云协同", "多机编队"] },
];

const scoreCriteria = [
  { dimension: "完整性", score: 18, max: 20, desc: "多机协同体系完整" },
  { dimension: "创新性", score: 17, max: 20, desc: "新型协同机制" },
  { dimension: "可行性", score: 16, max: 20, desc: "仿真验证充分" },
  { dimension: "实用性", score: 17, max: 20, desc: "真实场景适配" },
  { dimension: "展示效果", score: 18, max: 20, desc: "Demo演示清晰" },
];

export default function EmbodiedAIPage() {
  return (
    <PageLayout
      title="具身智能电网高风险作业"
      description="具身智能在电网高风险作业环境下的自主作业设计 - 多机器人协同电力作业系统"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Bot,
              label: "机器人总数",
              value: "10台",
              color: "text-blue-600",
            },
            {
              icon: Activity,
              label: "任务成功率",
              value: "96.5%",
              color: "text-emerald-600",
            },
            {
              icon: Shield,
              label: "安全响应",
              value: "<100ms",
              color: "text-amber-500",
            },
            {
              icon: Cpu,
              label: "决策延迟",
              value: "<200ms",
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

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              核心创新点
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-purple-100 text-purple-700">
                多机器人协同
              </Badge>
              <Badge className="bg-blue-100 text-blue-700">具身智能</Badge>
              <Badge className="bg-emerald-100 text-emerald-700">
                多模态感知
              </Badge>
              <Badge className="bg-amber-100 text-amber-700">自主决策</Badge>
            </div>
            <p className="text-sm text-slate-600">
              设计多机器人协同体系架构，实现空中侦察、地面巡检、精细操作的三级协同。
              融合视觉-力觉多模态感知，基于多模态大模型驱动决策推理，解决电网高风险作业中的自主作业难题。
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="architecture">
          <TabsList>
            <TabsTrigger value="architecture">系统架构</TabsTrigger>
            <TabsTrigger value="robots">机器人分工</TabsTrigger>
            <TabsTrigger value="tasks">任务流程</TabsTrigger>
            <TabsTrigger value="scores">评分分析</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  多机器人协同体系架构
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-6 rounded-lg">
                  <pre className="text-xs text-slate-600 font-mono leading-relaxed">
                    {`┌────────────────────────────────────────────────────────────┐
│                    多模态大模型决策层                         │
│        (GPT-4V/Qwen-VL 视觉理解 + 任务推理)                   │
└─────────────────────────┬──────────────────────────────────┘
                            │
┌─────────────────────────┴──────────────────────────────────┐
│                    协同调度中间层                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ 任务分解引擎 │  │ 冲突消解器  │  │ 动态调度器   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────┬──────────────┬────────────────────────────┘
                  │              │
    ┌─────────────┼──────────────┼─────────────┐
    ▼             ▼              ▼             ▼
┌────────┐  ┌────────┐    ┌────────┐   ┌────────┐
│空中侦察│  │地面巡检│    │精细操作│   │安全监控│
│ 机器人 │  │ 机器人 │    │ 机器人 │   │ 机器人 │
│ (UAV)  │  │ (UGV)  │    │ (MA)   │   │ (Monitor)│
└────────┘  └────────┘    └────────┘   └────────┘`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="robots">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">机器人角色分工</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {robotTypes.map((r) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.type} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className={`w-6 h-6 ${r.color}`} />
                          <div>
                            <p className="font-semibold text-sm">{r.type}</p>
                            <p className="text-xs text-slate-500">
                              数量: {r.count}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">{r.role}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {capabilities.map((c) => (
                    <div key={c.name} className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-sm text-blue-700 mb-2">
                        {c.name}
                      </h4>
                      <ul className="space-y-1">
                        {c.items.map((item) => (
                          <li key={item} className="text-xs text-slate-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">典型作业任务流程</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {taskAllocation.map((phase, i) => (
                    <div key={phase.phase} className="relative">
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mb-3">
                          {i + 1}
                        </div>
                        <h3 className="font-semibold text-sm mb-2">
                          {phase.phase}
                        </h3>
                        <p className="text-xs text-purple-600 mb-3">
                          耗时: {phase.duration}
                        </p>
                        <ul className="space-y-1">
                          {phase.tasks.map((t) => (
                            <li key={t} className="text-xs text-slate-500">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {i < 3 && (
                        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-slate-300 z-10">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">评审维度得分分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoreCriteria.map((s) => (
                    <div key={s.dimension} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-20">
                        {s.dimension}
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-4"
                          style={{ width: `${(s.score / s.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-purple-600 w-16 text-right">
                        {s.score}/{s.max}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <span className="font-semibold">总分预估: </span>
                    86/100 (目标: 国标95分以上)
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    完整性: 多机协同体系完整 | 创新性: 新型协同机制 | 可行性:
                    仿真验证充分
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
