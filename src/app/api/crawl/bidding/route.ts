import { NextResponse } from 'next/server';
import { crawlBidding } from '@/lib/crawl';

export const maxDuration = 60; // 允许最长60秒

export async function POST() {
  try {
    const result = await crawlBidding();
    return NextResponse.json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { success: false, message: `招标爬取接口异常: ${errMsg}` },
      { status: 500 }
    );
  }
}
