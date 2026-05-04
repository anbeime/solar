import { NextResponse } from "next/server";

const evStations = [
  { id: "ev001", name: "充电站A", capacity: 500, location: "福州" },
  { id: "ev002", name: "充电站B", capacity: 300, location: "厦门" },
  { id: "ev003", name: "充电站C", capacity: 400, location: "泉州" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId");

  const data = stationId
    ? evStations.find((s) => s.id === stationId)
    : evStations;

  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}
