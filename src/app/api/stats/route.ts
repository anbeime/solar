import { NextResponse } from 'next/server';
import { computeOverviewStats, computeProvinceStats } from '@/lib/data';

// 简单内存缓存
let cachedStats: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  // 检查缓存
  if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedStats.data);
  }

  try {
    // 从 JSON 文件读取数据
    const [projects, bidding, awards, chargers] = await Promise.all([
      fetch(new URL('/data/projects.json', 'http://localhost:5000')).then(r => r.json()).catch(() => []),
      fetch(new URL('/data/bidding.json', 'http://localhost:5000')).then(r => r.json()).catch(() => []),
      fetch(new URL('/data/awards.json', 'http://localhost:5000')).then(r => r.json()).catch(() => []),
      fetch(new URL('/data/chargers.json', 'http://localhost:5000')).then(r => r.json()).catch(() => []),
    ]);

    const stats = computeOverviewStats(projects, bidding, awards, chargers);
    const provinceStats = computeProvinceStats(projects);

    // 类型分布
    const typeDistribution: Record<string, number> = {};
    projects.forEach((p: any) => {
      if (p.type) typeDistribution[p.type] = (typeDistribution[p.type] || 0) + 1;
    });

    // 来源分布
    const sourceDistribution: Record<string, number> = {};
    projects.forEach((p: any) => {
      if (p.sourceName) sourceDistribution[p.sourceName] = (sourceDistribution[p.sourceName] || 0) + 1;
    });

    const result = {
      overview: stats,
      provinceStats,
      typeDistribution,
      sourceDistribution,
      generatedAt: new Date().toISOString(),
    };

    cachedStats = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Stats computation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
