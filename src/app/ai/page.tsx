"use client";

import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Send,
  Loader2,
  Sun,
  FileText,
  TrendingUp,
  BarChart3,
  Zap,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageLayout } from "@/components/page-layout";
import type { AIAnalysisResult, AnalysisType } from "@/lib/types";

interface AnalysisEntry {
  id: string;
  type: AnalysisType;
  content: string;
  result: AIAnalysisResult | null;
  loading: boolean;
  timestamp: string;
}

const ANALYSIS_TYPES = [
  {
    key: "policy" as const,
    label: "政策解读",
    icon: FileText,
    desc: "分析政策文件，提取核心要点",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "project" as const,
    label: "项目评估",
    icon: Sun,
    desc: "评估项目投资价值与风险",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "trend" as const,
    label: "趋势预测",
    icon: TrendingUp,
    desc: "行业趋势分析与预测",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "bidding" as const,
    label: "招标分析",
    icon: BarChart3,
    desc: "招标信息解读与建议",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const RISK_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};
const SENTIMENT_COLORS = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-slate-100 text-slate-700",
  negative: "bg-red-100 text-red-700",
};
const SENTIMENT_LABELS = {
  positive: "积极",
  neutral: "中性",
  negative: "消极",
};

const PRESET_QUESTIONS = [
  {
    type: "policy" as const,
    text: "国家能源局2026年新能源发展规划中，光伏储能领域的核心政策方向是什么？",
  },
  {
    type: "trend" as const,
    text: "2026年光伏储能行业有哪些值得关注的发展趋势？",
  },
  {
    type: "bidding" as const,
    text: "近期光伏储能招标项目的竞争态势如何？投标有哪些建议？",
  },
  {
    type: "project" as const,
    text: "大型光伏储能项目的投资价值如何评估？需要关注哪些风险点？",
  },
];

export default function AIPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>("policy");
  const [inputContent, setInputContent] = useState("");
  const [entries, setEntries] = useState<AnalysisEntry[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<{
    available: boolean;
    models: string[];
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/analyze")
      .then((r) => r.json())
      .then((data) => setOllamaStatus(data.ollama))
      .catch(() => setOllamaStatus({ available: false, models: [] }));
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries]);

  const handleAnalyze = async (content?: string, type?: AnalysisType) => {
    const text = content || inputContent;
    if (!text.trim()) return;
    const aType = type || analysisType;

    const entry: AnalysisEntry = {
      id: Date.now().toString(),
      type: aType,
      content: text,
      result: null,
      loading: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setEntries((prev) => [...prev, entry]);
    if (!content) setInputContent("");

    try {
      const resp = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: aType, content: text }),
      });
      const data = await resp.json();
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, result: data.result, loading: false } : e,
        ),
      );
    } catch {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                result: {
                  summary: "分析请求失败，请检查AI服务是否可用",
                  keyPoints: ["请确认Ollama服务已启动", "检查网络连接"],
                  riskLevel: "medium" as const,
                  recommendations: [
                    "启动Ollama: ollama serve",
                    "拉取模型: ollama pull qwen2.5:7b",
                  ],
                  sentiment: "neutral" as const,
                },
                loading: false,
              }
            : e,
        ),
      );
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI智能助手</h1>
            <p className="text-sm text-slate-500">
              基于Ollama LLM的光伏储能行业智能分析
            </p>
          </div>
        </div>

        {/* 服务状态 */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${ollamaStatus?.available ? "bg-green-500" : "bg-slate-300"}`}
          />
          <span className="text-xs text-slate-500">
            {ollamaStatus === null
              ? "检测中..."
              : ollamaStatus.available
                ? `Ollama已连接 (${ollamaStatus.models.length}个模型)`
                : "Ollama未连接 - 将使用降级分析"}
          </span>
        </div>

        {/* 分析类型选择 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {ANALYSIS_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setAnalysisType(t.key)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${analysisType === t.key ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <div className={`p-1.5 rounded-lg ${t.bg} w-fit mb-2`}>
                  <Icon className={`w-4 h-4 ${t.color}`} />
                </div>
                <p className="text-sm font-medium text-slate-900">{t.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 预设问题 */}
        {entries.length === 0 && (
          <div className="mb-6">
            <p className="text-xs text-slate-500 mb-3">试试这些问题：</p>
            <div className="grid md:grid-cols-2 gap-2">
              {PRESET_QUESTIONS.map((q, i) => {
                const typeInfo = ANALYSIS_TYPES.find((t) => t.key === q.type);
                return (
                  <button
                    key={i}
                    onClick={() => handleAnalyze(q.text, q.type)}
                    className="text-left p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs text-slate-600 hover:text-blue-700"
                  >
                    <Badge variant="outline" className="text-[10px] mb-1.5">
                      {typeInfo?.label}
                    </Badge>
                    <p className="line-clamp-2">{q.text}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 输入区 */}
        <Card className="mb-6 border-slate-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Textarea
                placeholder={`输入需要分析的内容...\n例如：粘贴一段光伏政策新闻、招标公告、项目信息等`}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                className="min-h-[100px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                    handleAnalyze();
                }}
              />
              <Button
                onClick={() => handleAnalyze()}
                disabled={!inputContent.trim()}
                className="self-end bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Ctrl+Enter 发送分析
            </p>
          </CardContent>
        </Card>

        {/* 数据概览 */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              光伏储能行业数据概览
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">800+</p>
                <p className="text-xs text-slate-500">全国光伏项目</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">100+</p>
                <p className="text-xs text-slate-500">储能电站</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">6000+</p>
                <p className="text-xs text-slate-500">充电桩设施</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">52.4</p>
                <p className="text-xs text-slate-500">GW光伏装机</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              数据来源：TOPGO SOLAR光伏储能数据平台（solar.miyucaicai.cn）
            </p>
          </CardContent>
        </Card>

        {/* FAQ 常见问题 */}
        <Card className="mb-6 border-slate-200">
          <CardContent className="p-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              常见问题（FAQ）
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  中国光伏累计装机容量是多少？
                </p>
                <p className="text-xs text-slate-600">
                  截至2025年，中国光伏累计装机容量已超过800GW。TOPGO
                  SOLAR光伏储能数据平台实时监测全国光伏项目数据，提供各省光伏装机统计与分析。
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  储能电站主要集中在哪些省份？
                </p>
                <p className="text-xs text-slate-600">
                  储能电站主要集中在山东、江苏、广东、浙江等省份。这些地区新能源装机量大、电网调度需求高，储能配套建设积极性高。
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  如何查询某个省份的光伏储能项目？
                </p>
                <p className="text-xs text-slate-600">
                  您可以通过TOPGO
                  SOLAR光伏储能数据平台的省份分析功能，查看各省光伏储能项目分布、装机容量、中标金额等详细数据。
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800 mb-1">
                  光伏储能项目的招标信息在哪里查看？
                </p>
                <p className="text-xs text-slate-600">
                  TOPGO
                  SOLAR光伏储能数据平台的招标动态栏目实时追踪全国光伏储能项目招标信息，包括招标公告、中标结果、项目金额等关键数据。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分析结果列表 */}
        <div
          ref={scrollRef}
          className="space-y-4 max-h-[600px] overflow-y-auto"
        >
          {entries.map((entry) => (
            <Card key={entry.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {
                          ANALYSIS_TYPES.find((t) => t.key === entry.type)
                            ?.label
                        }
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {entry.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {entry.content}
                    </p>
                  </div>
                </div>

                {entry.loading ? (
                  <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-slate-500">AI分析中...</span>
                  </div>
                ) : entry.result ? (
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-slate-700">
                      {entry.result.summary}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={RISK_COLORS[entry.result.riskLevel]}>
                        风险:{" "}
                        {entry.result.riskLevel === "low"
                          ? "低"
                          : entry.result.riskLevel === "medium"
                            ? "中"
                            : "高"}
                      </Badge>
                      <Badge
                        className={SENTIMENT_COLORS[entry.result.sentiment]}
                      >
                        情绪: {SENTIMENT_LABELS[entry.result.sentiment]}
                      </Badge>
                    </div>
                    {entry.result.keyPoints.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          核心要点
                        </p>
                        <ul className="space-y-1">
                          {entry.result.keyPoints.map((point, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-600 flex items-start gap-1.5"
                            >
                              <Sparkles className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {entry.result.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          建议
                        </p>
                        <ul className="space-y-1">
                          {entry.result.recommendations.map((rec, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-slate-600 flex items-start gap-1.5"
                            >
                              <Zap className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}

          {entries.length === 0 && (
            <Card className="border-dashed border-slate-300">
              <CardContent className="p-8 text-center">
                <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">输入内容开始AI分析</p>
                <p className="text-xs text-slate-400 mt-1">
                  支持政策解读、项目评估、趋势预测、招标分析
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
