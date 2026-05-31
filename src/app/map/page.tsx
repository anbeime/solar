"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLayout } from "@/components/page-layout";
import GaodeMap from "@/components/GaodeMap";
import { useSiteData } from "@/hooks/use-data";
import { ExternalLink, MapPin } from "lucide-react";
import type { Project } from "@/lib/types";

const PROJECT_TYPE_COLORS: Record<string, string> = {
  光伏: "bg-amber-500",
  储能: "bg-blue-500",
  风电: "bg-green-500",
  充电: "bg-red-500",
  氢能: "bg-purple-500",
  综合能源: "bg-indigo-500",
};

export default function MapPage() {
  const { projects, loading } = useSiteData();
  const [selectedType, setSelectedType] = useState<string>("全部");
  const [selectedProvince, setSelectedProvince] = useState<string>("全部");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchType = selectedType === "全部" || p.type === selectedType;
      const matchProvince =
        selectedProvince === "全部" || p.province === selectedProvince;
      const hasLocation = p.latitude && p.longitude;
      return matchType && matchProvince && hasLocation;
    });
  }, [projects, selectedType, selectedProvince]);

  const projectsWithLocation = useMemo(() => {
    return projects.filter((p) => p.latitude && p.longitude);
  }, [projects]);

  const provinces = useMemo(() => {
    const set = new Set(projects.map((p) => p.province).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              光伏储能项目地图
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              共 {projectsWithLocation.length} 个项目有定位信息
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <GaodeMap
                  projects={filteredProjects}
                  height="600px"
                  onProjectClick={handleProjectClick}
                />
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(PROJECT_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1 text-xs">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">筛选条件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500 mb-1 block">
                    项目类型
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="全部类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部类型</SelectItem>
                      <SelectItem value="光伏">光伏</SelectItem>
                      <SelectItem value="储能">储能</SelectItem>
                      <SelectItem value="风电">风电</SelectItem>
                      <SelectItem value="充电">充电</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-500 mb-1 block">
                    省份
                  </label>
                  <Select
                    value={selectedProvince}
                    onValueChange={setSelectedProvince}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="全部省份" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部省份</SelectItem>
                      {provinces.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {selectedProject && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">选中项目</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="font-medium text-slate-900 mb-2">
                    {selectedProject.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={PROJECT_TYPE_COLORS[selectedProject.type]}
                      >
                        {selectedProject.type}
                      </Badge>
                      <span className="text-slate-500">
                        {selectedProject.province}
                      </span>
                    </div>
                    {selectedProject.capacity && (
                      <p className="text-slate-600">
                        规模: {selectedProject.capacity}
                      </p>
                    )}
                    {selectedProject.company && (
                      <p className="text-slate-600">
                        企业: {selectedProject.company}
                      </p>
                    )}
                    {selectedProject.sourceUrl && (
                      <a
                        href={selectedProject.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        查看来源
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">项目列表</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {filteredProjects.slice(0, 50).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`w-full text-left p-2 rounded-lg border transition-colors ${
                        selectedProject?.id === p.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${PROJECT_TYPE_COLORS[p.type]}`}
                        />
                        <span className="text-sm font-medium truncate">
                          {p.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.province} • {p.type}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
