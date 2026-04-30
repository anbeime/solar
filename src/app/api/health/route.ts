import { NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/lib/ai';

export async function GET() {
  const ollama = await checkOllamaHealth();

  return NextResponse.json({
    status: 'ok',
    service: '光伏储能地图站',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    components: {
      web: { status: 'ok' },
      ollama: {
        status: ollama.available ? 'ok' : 'degraded',
        models: ollama.models,
        error: ollama.error,
      },
      forecast: {
        status: 'unknown',
        url: process.env.FORECAST_API_URL || 'http://localhost:8001',
      },
    },
  });
}
