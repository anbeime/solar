import { NextResponse } from 'next/server';
import { crawlChinaPower, crawlNEA, getLastCrawlResult } from '@/lib/crawler';

export const maxDuration = 60;

export async function POST() {
  try {
    // 爬取项目类数据：中国电力网 + 国家能源局
    const [cpResult, neaResult] = await Promise.allSettled([
      crawlChinaPower(),
      crawlNEA(),
    ]);

    const results: Record<string, unknown> = {};
    let totalItems = 0;

    if (cpResult.status === 'fulfilled') {
      results.chinapower = cpResult.value;
      totalItems += cpResult.value.count;
    } else {
      results.chinapower = { success: false, message: cpResult.reason?.message || '爬取失败' };
    }

    if (neaResult.status === 'fulfilled') {
      results.nea = neaResult.value;
      totalItems += neaResult.value.count;
    } else {
      results.nea = { success: false, message: neaResult.reason?.message || '爬取失败' };
    }

    return NextResponse.json({
      success: true,
      message: `项目爬取完成: 共 ${totalItems} 条`,
      results,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { success: false, message: `项目爬取接口异常: ${errMsg}` },
      { status: 500 },
    );
  }
}
