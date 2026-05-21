import { NextResponse } from "next/server";

export async function GET() {
  // 检查数据库连接（可选，不阻塞）
  let dbStatus: { connected: boolean; error?: string } = {
    connected: false,
    error: "Not configured",
  };
  try {
    const { checkDBHealth } = await import("@/lib/db/client");
    dbStatus = await checkDBHealth();
  } catch {
    // DB 未配置，不影响整体健康
  }

  // 检查预测服务
  let forecastStatus = "unknown";
  try {
    const forecastUrl = process.env.FORECAST_API_URL || "http://localhost:8001";
    const resp = await fetch(`${forecastUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    }).catch(() => null);
    forecastStatus = resp?.ok ? "ok" : "degraded";
  } catch {
    forecastStatus = "degraded";
  }

  const allOk = dbStatus.connected;
  const status = allOk ? "ok" : "degraded";

  return NextResponse.json({
    status,
    service: "光伏储能地图站",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    components: {
      web: { status: "ok" },
      ai: { status: "ok", provider: "nvidia/zhipuai" },
      database: {
        status: dbStatus.connected ? "ok" : "degraded",
        error: dbStatus.error,
      },
      forecast: {
        status: forecastStatus,
        url: process.env.FORECAST_API_URL || "http://localhost:8001",
      },
    },
  });
}