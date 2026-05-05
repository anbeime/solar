import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location, projectInfo } = body;

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: location' },
        { status: 400 }
      );
    }

    const prompt = `请分析 ${location} 地区的能源韧性，评估光伏储能系统的灾害响应能力。项目信息：${projectInfo || '无'}`;
    const result = await chatWithAI({ message: prompt });

    return NextResponse.json({
      success: true,
      result: {
        summary: result.content,
        keyPoints: [],
        riskLevel: 'medium',
        recommendations: [],
        sentiment: 'neutral',
      },
      realtimeData: {},
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}