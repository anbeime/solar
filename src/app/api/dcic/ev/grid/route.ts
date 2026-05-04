import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    gridMetrics: {
      voltageQualifiedRate: 99.5,
      peakReduction: 15.2,
      lossReduction: 8.5,
      convergenceTime: 0.5,
    },
    voltageDistribution: Array.from({ length: 33 }, (_, i) => ({
      node: i + 1,
      voltage: 1.0 - 0.01 * Math.abs(i - 16) + (Math.random() - 0.5) * 0.01,
    })),
    loadProfile: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      original: 3000 + 1500 * Math.sin((2 * Math.PI * (i - 8)) / 24),
      optimized:
        3000 +
        1500 *
          Math.sin((2 * Math.PI * (i - 8)) / 24) *
          (i >= 9 && i <= 18 ? 0.88 : i < 6 ? 1.15 : 1),
    })),
  });
}
