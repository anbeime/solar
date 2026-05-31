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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Microsoft YaHei', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
            ☀️ TOPGO SOLAR
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
            光伏储能行业数据平台
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 24px;">
            欢迎订阅，${subscriber.company}！🎉
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 20px;">
            感谢您订阅 TOPGO SOLAR 光伏储能数据平台。我们将为您提供：
          </p>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <div style="display: flex; align-items: flex-start; margin: 15px 0;">
              <span style="background: #2563eb; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 12px; flex-shrink: 0;">1</span>
              <div>
                <h4 style="margin: 0; color: #1f2937; font-size: 16px;">📊 行业数据订阅</h4>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">光伏、储能、风电项目最新数据</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-start; margin: 15px 0;">
              <span style="background: #2563eb; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 12px; flex-shrink: 0;">2</span>
              <div>
                <h4 style="margin: 0; color: #1f2937; font-size: 16px;">📢 招标信息推送</h4>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">光伏储能招标公告第一时间送达</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-start; margin: 15px 0;">
              <span style="background: #2563eb; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 12px; flex-shrink: 0;">3</span>
              <div>
                <h4 style="margin: 0; color: #1f2937; font-size: 16px;">📈 市场分析报告</h4>
                <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px;">行业趋势分析与投资参考</p>
              </div>
            </div>
          </div>
          
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>📍 访问平台：</strong>
              <a href="https://solar.miyucaicai.cn" style="color: #2563eb;">solar.miyucaicai.cn</a>
            </p>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px; margin: 30px 0 0; text-align: center;">
            订阅时间：${new Date(subscriber.subscribeTime).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px;">
            此邮件由系统自动发送，请勿回复
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            TOPGO SOLAR 光伏储能数据平台 · solar.miyucaicai.cn
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(
    subscriber.email,
    "☀️ 欢迎订阅 TOPGO SOLAR 光伏储能资讯",
    html,
  );
}

export async function sendUpdateNotification(
  subscribers: Subscriber[],
  updateInfo: { date: string; count: number },
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Microsoft YaHei', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">📊 数据更新通知</h2>
        </div>
        
        <div style="padding: 30px;">
          <p style="color: #1f2937; font-size: 16px; margin: 0 0 20px;">
            亲爱的订阅用户，光伏储能数据已更新：
          </p>
          
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">更新时间</td>
                <td style="padding: 10px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: bold;">${updateInfo.date}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">新增项目</td>
                <td style="padding: 10px 0; color: #059669; font-size: 14px; text-align: right; font-weight: bold;">${updateInfo.count} 个</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">订阅用户</td>
                <td style="padding: 10px 0; color: #1f2937; font-size: 14px; text-align: right; font-weight: bold;">${subscribers.length} 人</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://solar.miyucaicai.cn" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;">
              查看最新数据 →
            </a>
          </div>
        </div>
        
        <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0;">
            TOPGO SOLAR 光伏储能数据平台 · solar.miyucaicai.cn
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const recipients = subscribers.map((s) => s.email).join(",");
  return sendEmail(recipients, "📊 TOPGO SOLAR 数据更新通知", html);
}
