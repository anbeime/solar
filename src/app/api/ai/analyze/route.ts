import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, content } = body;

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, content' },
        { status: 400 }
      );
    }

    const result = await chatWithAI({ message: content });

    return NextResponse.json({
      success: true,
      result: {
        summary: result.content,
        keyPoints: [],
        riskLevel: 'medium' as const,
        recommendations: [],
        sentiment: 'neutral' as const,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Analysis',
    provider: 'nvidia/zhipuai',
  });
}