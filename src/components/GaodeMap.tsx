"use client";

import { useEffect, useRef, useState } from "react";
import { PROVINCE_COORDS, type Project } from "@/lib/types";

interface AMapType {
  Map: new (
    container: HTMLElement,
    opts?: Record<string, unknown>,
  ) => AMapInstance;
  LngLat: new (lng: number, lat: number) => AMapLngLat;
  Marker: new (opts?: Record<string, unknown>) => AMapMarker;
  InfoWindow: new (opts?: Record<string, unknown>) => AMapInfoWindow;
  Pixel: new (x: number, y: number) => AMapPixel;
  ToolBar: new () => unknown;
  Scale: new () => unknown;
}

interface AMapInstance {
  addControl: (control: unknown) => void;
  add: (markers: unknown[]) => void;
  setFitView: (
    markers: unknown[],
    fitview?: boolean,
    margins?: number[],
  ) => void;
}

interface AMapLngLat {
  new (lng: number, lat: number): AMapLngLat;
}

interface AMapMarker {
  on: (event: string, handler: () => void) => void;
}

interface AMapInfoWindow {
  open: (map: AMapInstance, lngLat: AMapLngLat) => void;
}

interface AMapPixel {
  new (x: number, y: number): AMapPixel;
}

declare global {
  interface Window {
    AMap: AMapType;
  }
}

interface ProjectMapProps {
  projects: Project[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  onProjectClick?: (project: Project) => void;
}

export default function GaodeMap({
  projects,
  height = "500px",
  center = [116.397428, 39.90923],
  zoom = 5,
  onProjectClick,
}: ProjectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMapInstance | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://webapi.amap.com/maps?v=2.0&key=254c0c9dba9bac351a9d589723e13944";
    script.async = true;

    script.onload = () => {
      if (window.AMap) {
        initMap();
      }
    };

    script.onerror = () => {
      setError("地图加载失败，请检查网络连接");
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initMap = () => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = new window.AMap.Map(containerRef.current, {
        zoom,
        center: new window.AMap.LngLat(center[0], center[1]),
        viewMode: "3D",
      });

      mapRef.current = map;

      window.AMap.ToolBar && map.addControl(new window.AMap.ToolBar());
      window.AMap.Scale && map.addControl(new window.AMap.Scale());

      addMarkers(map);
      setLoaded(true);
    } catch (e) {
      setError("地图初始化失败");
      console.error(e);
    }
  };

  const addMarkers = (map: AMapInstance) => {
    const markers: AMapMarker[] = [];

    projects.forEach((project) => {
      let lng = project.longitude;
      let lat = project.latitude;

      if (!lng || !lat) {
        const provinceCoords = PROVINCE_COORDS[project.province];
        if (provinceCoords) {
          const jitter = () => (Math.random() - 0.5) * 0.5;
          lng = provinceCoords[0] + jitter();
          lat = provinceCoords[1] + jitter();
        }
      }

      if (!lng || !lat) return;

      const markerContent = `
        <div style="
          background: ${getMarkerColor(project.type)};
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          ${project.type}
        </div>
      `;

      const marker = new window.AMap.Marker({
        content: markerContent,
        title: project.name,
        extData: project,
      });

      marker.on("click", () => {
        if (onProjectClick) {
          onProjectClick(project);
        } else {
          showProjectInfo(project);
        }
      });

      markers.push(marker);
    });

    map.add(markers);

    if (markers.length > 0) {
      map.setFitView(
        markers as unknown as AMapMarker[],
        false,
        [50, 50, 50, 50],
      );
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case "光伏":
        return "#f59e0b";
      case "储能":
        return "#3b82f6";
      case "风电":
        return "#22c55e";
      case "充电":
        return "#ef4444";
      default:
        return "#8b5cf6";
    }
  };

  const showProjectInfo = (project: Project) => {
    if (!mapRef.current) return;

    const infoWindow = new window.AMap.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: bold;">${project.name}</h3>
          <p style="margin: 4px 0; font-size: 12px;"><strong>类型：</strong>${project.type}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>省份：</strong>${project.province}</p>
          ${project.capacity ? `<p style="margin: 4px 0; font-size: 12px;"><strong>规模：</strong>${project.capacity}</p>` : ""}
          ${project.company ? `<p style="margin: 4px 0; font-size: 12px;"><strong>企业：</strong>${project.company}</p>` : ""}
          ${project.sourceUrl ? `<a href="${project.sourceUrl}" target="_blank" style="font-size: 12px; color: #3b82f6;">查看来源 →</a>` : ""}
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30),
    });

    let lng = project.longitude;
    let lat = project.latitude;

    if (!lng || !lat) {
      const provinceCoords = PROVINCE_COORDS[project.province];
      if (provinceCoords) {
        lng = provinceCoords[0];
        lat = provinceCoords[1];
      }
    }

    if (lng && lat) {
      infoWindow.open(mapRef.current, new window.AMap.LngLat(lng, lat));
    }
  };

  if (error) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#ef4444" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height }}>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
      />
      {!loaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ color: "#6b7280" }}>地图加载中...</p>
        </div>
      )}
    </div>
  );
}
