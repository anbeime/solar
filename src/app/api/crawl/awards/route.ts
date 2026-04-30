import { NextResponse } from 'next/server';
import { crawlAwards } from '@/lib/crawl';

export const maxDuration = 60;

export async function POST() {
  try {
    const result = await crawlAwards();
    return NextResponse.json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { success: false, message: `中标爬取接口异常: ${errMsg}` },
      { status: 500 }
    );
  }
}
