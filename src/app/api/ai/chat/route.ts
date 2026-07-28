import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, provider, model } = body;

    if (!message) {
      return NextResponse.json(
        { content: '消息不能为空，请输入您的问题。' },
        { status: 400 }
      );
    }

    const result = await chatWithAI({ message, provider, model });

    // 双保险: 即使 chatWithAI 返回空 content 也给个兜底, 避免前端显示空白
    if (!result.content || result.content.trim().length === 0) {
      return NextResponse.json({
        content: '抱歉，暂时无法生成回复。请稍后重试，或换个方式提问。',
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : '未知错误';
    console.error('[AI Chat] 异常:', errMsg);
    // 返回 content 而非 error, 确保前端能正常显示 (前端只读 data.content)
    return NextResponse.json(
      {
        content: `抱歉，AI 服务暂时不可用。原因：${errMsg}\n\n建议：\n1. 稍后重试\n2. 换个简单的问题\n3. 检查 API Key 配置`,
      },
      { status: 500 }
    );
  }
}