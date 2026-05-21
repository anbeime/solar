import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, provider, model } = body;

    if (!message) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    const result = await chatWithAI({ message, provider, model });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}