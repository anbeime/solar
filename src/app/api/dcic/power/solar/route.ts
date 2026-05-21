import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId") || "113997366155018885";
  const hours = parseInt(searchParams.get("hours") || "96");

  const capacityMap: Record<string, number> = {
    "113997366155018885": 300.0,
    "113997367312946163": 100.0,
    "113997367346200913": 10.0,
    "113997367354200675": 20.48,
    "113997367354200693": 44.0,
  };

  const capacity = capacityMap[stationId] || 100;
  const forecast = Array.from({ length: hours }, (_, i) => {
    const hour = i / 4;
    const isDay = hour >= 6 && hour <= 18;
    const solarFactor = isDay ? Math.sin((Math.PI * (hour - 6)) / 12) : 0;
    const power = isDay
      ? capacity * solarFactor * (0.85 + (Math.random() - 0.5) * 0.1)
      : 0;
    return {
      time: `${Math.floor(hour).toString().padStart(2, "0")}:${((hour % 1) * 60).toString().padStart(2, "0")}`,
      actual: parseFloat(power.toFixed(2)),
      predicted: isDay
        ? parseFloat((power * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2))
        : 0,
    };
  });

  return NextResponse.json({
    success: true,
    stationId,
    capacity,
    data: forecast,
    metrics: { nmaeShort: 4.2, nmaeUltraShort: 2.8 },
  });
}
