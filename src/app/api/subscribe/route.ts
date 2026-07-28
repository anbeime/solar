import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { sendWelcomeEmail, sendEmail } from "@/lib/email";

const ADMIN_EMAIL = "wasonbeer@2925.com";

// Vercel 生产环境文件系统只读, /tmp 可写但实例间不共享
// 优先用 /tmp, 退回项目 data 目录
const DATA_DIR =
  process.env.VERCEL === "1"
    ? path.join("/tmp", "data")
    : path.join(process.cwd(), "data");
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

    // 文件写入失败不阻塞订阅 (Vercel 只读文件系统会失败, 仅 log)
    try {
      await saveSubscribers(subscribers);
    } catch (saveErr) {
      console.warn(
        "⚠️ 订阅数据文件写入失败 (生产环境只读?), 订阅信息将通过邮件留存:",
        saveErr instanceof Error ? saveErr.message : saveErr,
      );
    }

    // 给管理员发通知邮件 (持久化订阅信息, 即使文件写不进去也不丢)
    const adminHtml = `
      <h2>🔔 新订阅通知</h2>
      <table style="border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 12px;color:#6b7280;">公司</td><td style="padding:8px 12px;font-weight:bold;">${newSubscriber.company}</td></tr>
        <tr><td style="padding:8px 12px;color:#6b7280;">电话</td><td style="padding:8px 12px;font-weight:bold;">${newSubscriber.phone}</td></tr>
        <tr><td style="padding:8px 12px;color:#6b7280;">邮箱</td><td style="padding:8px 12px;font-weight:bold;">${newSubscriber.email}</td></tr>
        <tr><td style="padding:8px 12px;color:#6b7280;">时间</td><td style="padding:8px 12px;">${newSubscriber.subscribeTime}</td></tr>
      </table>
    `;

    // 欢迎邮件 + 管理员通知 fire-and-forget, 不阻塞响应
    void Promise.allSettled([
      sendWelcomeEmail(newSubscriber),
      sendEmail(ADMIN_EMAIL, `🔔 新订阅: ${newSubscriber.company}`, adminHtml),
    ]).then((results) => {
      console.log("📧 邮件发送结果:", results.map(r => r.status).join(", "));
    });

    return NextResponse.json({
      success: true,
      message: "订阅成功！",
    });
  } catch (error: any) {
    console.error("订阅错误:", error?.message || error?.code || error);
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
