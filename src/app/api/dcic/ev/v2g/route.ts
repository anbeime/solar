import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    v2gStrategies: {
      dailyRevenue: 2450,
      userSatisfaction: 92,
      renewableUtilization: 85,
      batteryHealthIndex: 0.95,
    },
    chargeSchedule: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      charge: i < 6 ? Math.random() * 5 + 5 : 0,
      discharge:
        (i >= 10 && i <= 14) || (i >= 18 && i <= 21)
          ? Math.random() * 4 + 3
          : 0,
      solarOutput:
        i >= 6 && i <= 18 ? 50 * Math.sin((Math.PI * (i - 6)) / 12) : 0,
      electricityPrice: [
        0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.8, 0.8, 0.8, 1.2, 1.2, 1.2, 1.2,
        1.2, 0.8, 0.8, 0.8, 1.2, 1.2, 1.2, 0.8, 0.3, 0.3,
      ][i],
    })),
  });
}
