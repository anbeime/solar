import { NextRequest, NextResponse } from "next/server";

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`;

interface Subscriber {
  id: number;
  company: string;
  phone: string;
  email: string;
  subscribeTime: string;
  status: string;
}

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    const res = await fetch(JSONBIN_URL, {
      headers: {
        "X-Master-Key": JSONBIN_API_KEY!,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.record || [];
  } catch (e) {
    console.error("获取订阅失败:", e);
    return [];
  }
}

async function saveSubscribers(subscribers: Subscriber[]): Promise<boolean> {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: "PUT",
      headers: {
        "X-Master-Key": JSONBIN_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscribers),
    });
    return res.ok;
  } catch (e) {
    console.error("保存订阅失败:", e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
      return NextResponse.json(
        { success: false, message: "服务配置错误，请稍后重试" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { company, phone, email } = body;

    if (!company || !phone || !email) {
      return NextResponse.json(
        { success: false, message: "请填写完整信息" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "请输入有效的邮箱地址" },
        { status: 400 },
      );
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { success: false, message: "请输入有效的手机号码" },
        { status: 400 },
      );
    }

    const subscribers = await getSubscribers();
    const emailLower = email.trim().toLowerCase();

    const exists = subscribers.find((s) => s.email === emailLower);
    if (exists) {
      return NextResponse.json(
        { success: false, message: "该邮箱已订阅" },
        { status: 400 },
      );
    }

    const newSubscriber: Subscriber = {
      id: Date.now(),
      company: company.trim(),
      phone: phone.trim(),
      email: emailLower,
      subscribeTime: new Date().toISOString(),
      status: "active",
    };

    subscribers.push(newSubscriber);
    const saved = await saveSubscribers(subscribers);

    if (!saved) {
      return NextResponse.json(
        { success: false, message: "保存失败，请稍后重试" },
        { status: 500 },
      );
    }

    console.log("📧 新订阅:", newSubscriber);

    return NextResponse.json({
      success: true,
      message: "订阅成功！",
      subscriberId: newSubscriber.id,
    });
  } catch (error) {
    console.error("订阅错误:", error);
    return NextResponse.json(
      { success: false, message: "服务器错误，请稍后重试" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "订阅API，请使用POST请求" },
    { status: 200 },
  );
}
