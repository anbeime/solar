import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "24");

  const forecast = Array.from({ length: hours }, (_, i) => {
    const hour = i;
    const actual =
      5 + 2 * Math.sin((2 * Math.PI * hour) / 24) + (Math.random() - 0.5) * 0.6;
    const predicted =
      5 + 2 * Math.sin((2 * Math.PI * hour) / 24) + (Math.random() - 0.5) * 0.4;
    return {
      hour,
      actual: parseFloat(actual.toFixed(3)),
      predicted: parseFloat(predicted.toFixed(3)),
      confidence: {
        upper: parseFloat((predicted + 0.5).toFixed(3)),
        lower: parseFloat((predicted - 0.5).toFixed(3)),
      },
    };
  });

  return NextResponse.json({
    success: true,
    data: forecast,
    metrics: { mae: 0.78, rmse: 0.95, mape: 6.5 },
  });
}
