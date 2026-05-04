import { NextResponse } from 'next/server';
import { assessEnergyResilience, checkOllamaHealth } from '@/lib/ai';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { location, projectInfo } = body;

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: location' },
        { status: 400 },
      );
    }

    const result = await assessEnergyResilience(location, projectInfo);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      result,
      latencyMs,
      model: 'Gemma 4 via Ollama',
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Resilience assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  const health = await checkOllamaHealth();
  return NextResponse.json({
    service: 'Energy Resilience Assessment (Gemma 4)',
    ollama: health,
    tools: ['get_weather', 'get_electricity_price', 'get_pv_forecast'],
  });
}
