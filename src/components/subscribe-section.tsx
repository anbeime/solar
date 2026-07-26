"use client";

import { useState, useEffect } from "react";
import { Mail, X, Send, CheckCircle2, Loader2 } from "lucide-react";

export function SubscribeSection() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ESC 关闭弹窗 + 防止背景滚动
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

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
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    // 关闭后稍延迟重置成功状态，避免动画闪烁
    setTimeout(() => {
      setSuccess(false);
      setFormData({ company: "", phone: "", email: "" });
      setError("");
    }, 200);
  };

  return (
    <>
      {/* 右上角浮动按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-16 right-4 z-40 md:top-20 md:right-6 group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 transition-all"
        aria-label="免费订阅"
      >
        <Mail className="w-4 h-4" />
        <span className="text-sm font-semibold whitespace-nowrap">
          免费订阅
        </span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300" />
        </span>
      </button>

      {/* 弹窗 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={resetAndClose}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={resetAndClose}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 hover:bg-slate-100 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            {success ? (
              /* 订阅成功 */
              <div className="px-6 py-12 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  订阅成功！
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  感谢您的信任，我们将定期发送最新
                  <br />
                  光伏储能行业动态到您的邮箱
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-6 px-6 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
                >
                  完成
                </button>
              </div>
            ) : (
              /* 表单 */
              <div>
                {/* 头部 */}
                <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-rose-500 to-orange-500">
                      🔥 限时免费
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-tight">
                    获取最新光伏储能行业动态
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    专业团队实时整理 · 满足 GEO 标准 · 即开即用
                  </p>
                </div>

                {/* 表单字段 - 单列纵向布局，避免挤一团 */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <span>🏢</span> 公司名称
                    </label>
                    <input
                      type="text"
                      placeholder="请输入公司名称"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <span>📞</span> 联系电话
                    </label>
                    <input
                      type="tel"
                      placeholder="请输入手机号码"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <span>📧</span> 邮箱地址
                    </label>
                    <input
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none transition-all"
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold shadow-md shadow-rose-500/25 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        订阅中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        立即免费订阅
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    🔒 我们尊重您的隐私，不会向第三方透露您的信息
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
