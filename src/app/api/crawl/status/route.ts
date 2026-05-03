import { NextResponse } from 'next/server';
import { getLastCrawlResult } from '@/lib/crawler';

export async function GET() {
  const last = getLastCrawlResult();
  return NextResponse.json({
    success: true,
    lastCrawl: last,
  });
}
