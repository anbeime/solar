import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId") || "113997366155018679";
  const hours = parseInt(searchParams.get("hours") || "96");

  const capacityMap: Record<string, number> = {
    "113997366155018679": 604.0,
    "113997367262314761": 96.0,
    "113997367262314948": 40.0,
    "113997367329423616": 12.0,
    "113997367346200670": 49.5,
  };

  const capacity = capacityMap[stationId] || 100;
  const forecast = Array.from({ length: hours }, (_, i) => {
    const hour = i / 4;
    const power = Math.max(
      0,
      capacity *
        (0.3 +
          0.4 * Math.sin((2 * Math.PI * hour) / 24) +
          0.2 * Math.sin((2 * Math.PI * hour) / 6) +
          (Math.random() - 0.5) * 0.15),
    );
    return {
      time: `${Math.floor(hour).toString().padStart(2, "0")}:${((hour % 1) * 60).toString().padStart(2, "0")}`,
      actual: parseFloat(power.toFixed(2)),
      predicted: parseFloat(
        (power * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2),
      ),
    };
  });

  return NextResponse.json({
    success: true,
    stationId,
    capacity,
    data: forecast,
    metrics: { nmaeShort: 7.2, nmaeUltraShort: 4.8 },
  });
}
