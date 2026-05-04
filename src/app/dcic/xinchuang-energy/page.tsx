"use client";

import Link from "next/link";
import { Cpu, Database, Cloud, Shield, Settings, Activity } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const modules = [
  {
    title: "国产化新能源管理系统",
    desc: "基于昇思MindSpore训练轻量化模型，对光伏、风电进行超短期功率预测",
    icon: Cpu,
    color: "from-blue-500 to-cyan-500",
    features: ["鲲鹏/飞腾芯片优化", "麒麟/UOS系统适配", "国产时序数据库"],
  },
  {
    title: "智慧能源平台与数字孪生",
    desc: "构建区域级能源系统数字孪生体，实现物理能源系统1:1高保真映射",
    icon: Database,
    color: "from-emerald-500 to-teal-500",
    features: ["三维渲染引擎", "高保真流场模拟", "国产微服务架构"],
  },
  {
    title: "源网荷储协同优化",
    desc: "多时间尺度优化调度，协调发电厂、可控负荷、储能电站、V2G资源",
    icon: Activity,
    color: "from-amber-500 to-orange-500",
    features: ["国产优化求解器", "国密算法加密", "容器化弹性伸缩"],
  },
  {
    title: "能源监控系统信创升级",
    desc: "SCADA/EMS系统国产化替代与智能化升级，AI图像识别与预警",
    icon: Shield,
    color: "from-purple-500 to-indigo-500",
    features: ["国产工控机", "AI加速卡适配", "国产关系型数据库"],
  },
];

const techStack = [
  { layer: "算力底座", items: ["鲲鹏920", "昇腾910", "飞腾芯片", "瑞芯微"] },
  {
    layer: "操作系统",
    items: ["openEuler", "麒麟高级服务器", "UOS", "麒麟桌面"],
  },
  { layer: "数据库", items: ["达梦数据库", "OceanBase", "TDengine", "IoTDB"] },
  {
    layer: "AI框架",
    items: ["昇思MindSpore", "PaddlePaddle", "TensorFlow", "PyTorch"],
  },
];

export default function XinchuangEnergyPage() {
  return (
    <PageLayout
      title="信创赛道-能源行业赛"
      description="基于信创全栈的'源-网-荷-储'协同优化与数字孪生平台"
    >
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  方案概述
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  构建完全运行于国产算力底座的能源行业全栈信创解决方案，深度融合数字孪生与AI技术，
                  实现从新能源发电预测、电网优化调度、负荷侧智能管理到储能协同控制的"源-网-荷-储"全链条自主可控。
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    国产化替代
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    数字孪生
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700">
                    智能调度
                  </Badge>
                  <Badge className="bg-purple-100 text-purple-700">
                    自主可控
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">4</p>
                  <p className="text-xs text-slate-500">核心模块</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">全栈</p>
                  <p className="text-xs text-slate-500">信创覆盖</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Card key={mod.title} className="h-full">
                <div className={`h-1.5 bg-gradient-to-r ${mod.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100`}>
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <CardTitle className="text-base">{mod.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{mod.desc}</p>
                  <ul className="space-y-1.5">
                    {mod.features.map((f) => (
                      <li
                        key={f}
                        className="text-xs text-slate-500 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              信创技术栈
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techStack.map((layer) => (
                <div key={layer.layer} className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-slate-700 mb-2">
                    {layer.layer}
                  </h3>
                  <ul className="space-y-1">
                    {layer.items.map((item) => (
                      <li key={item} className="text-xs text-slate-500">
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
