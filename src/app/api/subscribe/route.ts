import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, phone, email } = body;

    // 验证必填字段
    if (!company || !phone || !email) {
      return NextResponse.json(
        { success: false, message: '请填写完整信息' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { success: false, message: '请输入有效的手机号码' },
        { status: 400 }
      );
    }

    // 订阅数据
    const subscriber = {
      id: Date.now(),
      company: company.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      subscribeTime: new Date().toISOString(),
      status: 'active'
    };

    // 保存到订阅列表文件
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const subscribersFile = path.join(dataDir, 'subscribers.json');

    let subscribers: any[] = [];
    
    try {
      if (existsSync(subscribersFile)) {
        const existingData = await readFile(subscribersFile, 'utf-8');
        subscribers = JSON.parse(existingData);
      }
    } catch (e) {
      subscribers = [];
    }

    // 检查是否已存在相同邮箱
    const exists = subscribers.find((s: any) => s.email === subscriber.email);
    if (exists) {
      return NextResponse.json(
        { success: false, message: '该邮箱已订阅' },
        { status: 400 }
      );
    }

    // 添加新订阅
    subscribers.push(subscriber);

    // 确保目录存在
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // 保存
    await writeFile(subscribersFile, JSON.stringify(subscribers, null, 2));

    console.log('📧 新订阅:', subscriber);

    return NextResponse.json({
      success: true,
      message: '订阅成功！',
      subscriberId: subscriber.id
    });

  } catch (error) {
    console.error('订阅错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: '订阅API，请使用POST请求' },
    { status: 200 }
  );
}
