import { NextResponse } from 'next/server';
import { performAIAnalysis, checkAIHealth } from '@/lib/ai';
import type { AIAnalysisRequest } from '@/lib/types';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body: AIAnalysisRequest = await request.json();

    if (!body.type || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, content' },
        { status: 400 },
      );
    }

    const validTypes = ['policy', 'project', 'trend', 'bidding', 'resilience'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid analysis type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 },
      );
    }

    const result = await performAIAnalysis(body);
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      result,
      latencyMs,
      model: 'MiniMax M2.7 via NVIDIA NIM',
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  const health = await checkAIHealth();
  return NextResponse.json({
    service: 'AI Analysis (NVIDIA NIM)',
    ai: health,
  });
}
