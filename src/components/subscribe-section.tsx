"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, QrCode } from "lucide-react";

export function SubscribeSection() {
  const [open, setOpen] = useState(false);

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

  const resetAndClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* 右上角浮动按钮 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-16 right-4 z-40 md:top-20 md:right-6 group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all"
        aria-label="加微信进群"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-semibold whitespace-nowrap">
          加微信进群
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
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
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

            {/* 头部 */}
            <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode className="w-5 h-5" />
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20">
                  💬 行业交流群
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight">
                扫码加微信，获取行业动态
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                光伏储能项目数据 · 招投标情报 · AI工具分享
              </p>
            </div>

            {/* 二维码 */}
            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src="/wechat-qr.jpg"
                  alt="微信二维码"
                  className="w-48 h-48 rounded-xl border-2 border-emerald-200 shadow-md"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
                  微信扫码
                </div>
              </div>
              <p className="text-sm text-slate-600 text-center mt-2">
                📱 微信扫码添加，备注「<span className="font-semibold text-emerald-600">光伏</span>」拉你进群
              </p>
              <p className="text-xs text-slate-400 text-center">
                🔒 尊重隐私，不发广告，不定期分享行业数据
              </p>
            </div>

            {/* 底部链接 */}
            <div className="px-6 pb-5 flex justify-center gap-4 text-xs">
              <a
                href="https://ai123.miyucaicai.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-emerald-600 transition-colors"
              >
                🧠 知易AI
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="https://github.com/anbeime/skill"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-emerald-600 transition-colors"
              >
                ⭐ 技能商店
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
