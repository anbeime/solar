"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SubscribeSection() {
  const [formData, setFormData] = useState({
    company: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "订阅失败，请稍后重试");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-emerald-700 mb-2">
              订阅成功！
            </h3>
            <p className="text-slate-600">
              感谢您的信任，我们将定期发送最新光伏储能行业动态到您的邮箱
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 shadow-xl rounded-xl">
        <CardHeader className="text-center pb-2">
          <Badge className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs mb-2">
            🔥 限时免费订阅
          </Badge>
          <CardTitle className="text-lg font-bold text-white mb-1">
            获取最新光伏储能行业动态
          </CardTitle>
          <p className="text-slate-400 text-xs">
            专业团队实时爬取整理 | 满足GEO标准 | 精美排版即开即用
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-200 font-medium flex items-center gap-1">
                  🏢 公司名称
                </label>
                <Input
                  type="text"
                  placeholder="请输入公司名称"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  required
                  className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-300 focus:border-cyan-400 focus:ring-cyan-400 h-11 px-4 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200 font-medium flex items-center gap-1">
                  📞 联系电话
                </label>
                <Input
                  type="tel"
                  placeholder="请输入联系电话"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-300 focus:border-cyan-400 focus:ring-cyan-400 h-11 px-4 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200 font-medium flex items-center gap-1">
                  📧 邮箱地址
                </label>
                <Input
                  type="email"
                  placeholder="请输入邮箱地址"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-slate-700/80 border-slate-500 text-white placeholder:text-slate-300 focus:border-cyan-400 focus:ring-cyan-400 h-11 px-4 rounded-lg"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2">
                {error}
              </div>
            )}

            <div className="text-center space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 shadow-lg shadow-cyan-500/25"
              >
                {loading ? "订阅中..." : "立即免费订阅"}
              </Button>
              <p className="text-xs text-slate-500">
                🔒 我们尊重您的隐私，不会向第三方透露您的信息
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
