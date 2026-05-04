import { NextResponse } from "next/server";

const stations = {
  wind: [
    {
      id: "113997366155018679",
      name: "风电场A",
      capacity: 604.0,
      type: "wind",
    },
    { id: "113997367262314761", name: "风电场B", capacity: 96.0, type: "wind" },
    { id: "113997367262314948", name: "风电场C", capacity: 40.0, type: "wind" },
    { id: "113997367329423616", name: "风电场D", capacity: 12.0, type: "wind" },
    { id: "113997367346200670", name: "风电场E", capacity: 49.5, type: "wind" },
  ],
  solar: [
    {
      id: "113997366155018885",
      name: "光伏电站A",
      capacity: 300.0,
      type: "solar",
    },
    {
      id: "113997367312946163",
      name: "光伏电站B",
      capacity: 100.0,
      type: "solar",
    },
    {
      id: "113997367346200913",
      name: "光伏电站C",
      capacity: 10.0,
      type: "solar",
    },
    {
      id: "113997367354200675",
      name: "光伏电站D",
      capacity: 20.48,
      type: "solar",
    },
    {
      id: "113997367354200693",
      name: "光伏电站E",
      capacity: 44.0,
      type: "solar",
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const stationId = searchParams.get("stationId");

  let data;
  if (stationId) {
    const allStations = [...stations.wind, ...stations.solar];
    data = allStations.find((s) => s.id === stationId);
  } else if (type === "wind") {
    data = stations.wind;
  } else if (type === "solar") {
    data = stations.solar;
  } else {
    data = { wind: stations.wind, solar: stations.solar };
  }

  return NextResponse.json({
    success: true,
    data,
    totalCapacity: {
      wind: stations.wind.reduce((sum, s) => sum + s.capacity, 0),
      solar: stations.solar.reduce((sum, s) => sum + s.capacity, 0),
    },
  });
}
