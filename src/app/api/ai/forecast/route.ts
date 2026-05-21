import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { capacity_kw } = body;

    if (!capacity_kw) {
      return NextResponse.json({ error: 'Missing capacity_kw' }, { status: 400 });
    }

    const predictions = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() + i * 3600000);
      predictions.push({
        timestamp: hour.toISOString(),
        predicted_power_kw: Math.random() * capacity_kw * 0.8,
        is_daytime: hour.getHours() >= 6 && hour.getHours() <= 18,
      });
    }

    return NextResponse.json({
      predictions,
      total_generation_kwh: capacity_kw * 5,
      peak_power_kw: capacity_kw * 0.8,
      capacity_factor: 0.4,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}