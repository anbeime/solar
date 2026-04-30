import { NextResponse } from 'next/server';
import { getPVForecast } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { history, capacity_kw } = body;

    if (!history || !Array.isArray(history) || history.length < 24) {
      return NextResponse.json(
        { error: 'Need at least 24 data points for forecast' },
        { status: 400 },
      );
    }

    const result = await getPVForecast(history, capacity_kw || 100);
    return NextResponse.json({ success: true, forecast: result });
  } catch (error) {
    return NextResponse.json(
      { error: `Forecast failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}
