import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.2925.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "wasonbeer@2925.com",
    pass: process.env.SMTP_PASS,
  },
});

interface Subscriber {
  id: number;
  company: string;
  phone: string;
  email: string;
  subscribeTime: string;
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: '"TOPGO SOLAR" <wasonbeer@2925.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (e) {
    console.error("发送邮件失败:", e);
    return false;
  }
}

export async function sendWelcomeEmail(subscriber: Subscriber) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">欢迎订阅 TOPGO SOLAR</h2>
      <p>您好 <strong>${subscriber.company}</strong>，</p>
      <p>感谢您的订阅！您将收到：</p>
      <ul>
        <li>光伏储能行业最新动态</li>
        <li>招标中标信息推送</li>
        <li>项目数据分析报告</li>
      </ul>
      <p style="color: #666; font-size: 14px;">
        订阅时间：${new Date(subscriber.subscribeTime).toLocaleString("zh-CN")}
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">
        TOPGO SOLAR 光伏储能数据平台<br>
        solar.miyucaicai.cn
      </p>
    </div>
  `;

  return sendEmail(subscriber.email, "欢迎订阅 TOPGO SOLAR 光伏储能资讯", html);
}

export async function sendUpdateNotification(
  subscribers: Subscriber[],
  updateInfo: { date: string; count: number },
) {
  const subscriberList = subscribers
    .map((s) => `<li>${s.email} (${s.company})`)
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">📊 数据更新通知</h2>
      <p>TOPGO SOLAR 数据已更新：</p>
      <ul>
        <li><strong>更新时间：</strong>${updateInfo.date}</li>
        <li><strong>更新项目数：</strong>${updateInfo.count}</li>
      </ul>
      <p>查看详情：<a href="https://solar.miyucaicai.cn">solar.miyucaicai.cn</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">
        共 ${subscribers.length} 位订阅者
      </p>
    </div>
  `;

  const recipients = subscribers.map((s) => s.email).join(",");
  return sendEmail(recipients, "📊 TOPGO SOLAR 数据更新通知", html);
}
