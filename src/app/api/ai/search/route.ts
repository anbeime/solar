import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid query' },
        { status: 400 }
      );
    }

    const result = await chatWithAI({ message: query });

    return NextResponse.json({
      success: true,
      results: [{ content: result.content, sources: result.sources }],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}