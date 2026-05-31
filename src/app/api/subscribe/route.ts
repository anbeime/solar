import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { subscribers } from "@/lib/db";
import { eq } from "drizzle-orm";

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

    const existing = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, email.trim().toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "该邮箱已订阅" },
        { status: 400 },
      );
    }

    const result = await db
      .insert(subscribers)
      .values({
        company: company.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        status: "active",
      })
      .returning();

    console.log("📧 新订阅:", result[0]);

    return NextResponse.json({
      success: true,
      message: "订阅成功！",
      subscriberId: result[0].id,
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
