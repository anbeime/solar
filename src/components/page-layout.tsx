'use client';

import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import type { PageLayoutProps } from '@/lib/types';

/**
 * 通用页面布局 - 统一 Header + 内容 + Footer 结构
 */
export function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
        )}
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
