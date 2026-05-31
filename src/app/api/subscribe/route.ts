import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { sendWelcomeEmail } from "@/lib/email";

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

interface Subscriber {
  id: number;
  company: string;
  phone: string;
  email: string;
  subscribeTime: string;
  status: string;
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await import("fs/promises").then((fs) =>
      fs.mkdir(DATA_DIR, { recursive: true }),
    );
  }
}

async function getSubscribers(): Promise<Subscriber[]> {
  try {
    if (existsSync(SUBSCRIBERS_FILE)) {
      const data = await readFile(SUBSCRIBERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("读取订阅者失败:", e);
  }
  return [];
}

async function saveSubscribers(subscribers: Subscriber[]): Promise<void> {
  await ensureDataDir();
  await writeFile(
    SUBSCRIBERS_FILE,
    JSON.stringify(subscribers, null, 2),
    "utf-8",
  );
}

export async function POST(request: NextRequest) {
  try {
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
    await saveSubscribers(subscribers);

    await sendWelcomeEmail(newSubscriber);

    console.log("📧 新订阅:", newSubscriber);

    return NextResponse.json({
      success: true,
      message: "订阅成功！",
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
