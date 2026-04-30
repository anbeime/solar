import { NextResponse } from 'next/server';
import { crawlAllSources } from '@/lib/crawler';

export async function POST(request: Request) {
  try {
    const results = await crawlAllSources();
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalItems = Object.values(results).reduce((s, r) => s + r.count, 0);

    return NextResponse.json({
      success: true,
      message: `爬取完成: ${successCount}/${Object.keys(results).length} 源成功, 共 ${totalItems} 条`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
