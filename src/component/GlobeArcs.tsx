import React, { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";

export type Route = {
  id?: string | number;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  color?: string | [string, string]; // 支持渐变
  label?: string;
  altitude?: number; // 0~1，默认为 0.2
};

export type GlobeArcsProps = {
  routes: Route[];
  autoRotate?: boolean;
  pointSize?: number;
  showPoints?: boolean;
  backgroundColor?: string;
};

const GlobeArcs: React.FC<GlobeArcsProps> = ({
  routes,
  autoRotate = true,
  pointSize = 0.6,
  showPoints = true,
  backgroundColor = "#000",
}) => {
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // 预处理数据：确保字段齐全
  const arcs = useMemo(
    () =>
      routes.map((r, idx) => ({
        id: r.id ?? idx,
        startLat: r.start.lat,
        startLng: r.start.lng,
        endLat: r.end.lat,
        endLng: r.end.lng,
        color: r.color ?? "#00d1ff",
        label: r.label ?? "",
        altitude: r.altitude ?? 0.2,
      })),
    [routes]
  );

  // 自动旋转
  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.controls().autoRotate = autoRotate;
    globeRef.current.controls().autoRotateSpeed = 0.6; // 旋转速度
  }, [autoRotate, ready]);

  // 贴图（可替换为你自己的高分辨率纹理）
  const globeImageUrl =
    "https://unpkg.com/three-globe/example/img/earth-dark.jpg";
  const bumpImageUrl =
    "https://unpkg.com/three-globe/example/img/earth-topology.png";
  const backgroundImageUrl =
    "https://unpkg.com/three-globe/example/img/night-sky.png";

  // 端点数据
  const points = useMemo(() => {
    if (!showPoints) return [] as any[];
    return arcs.flatMap((a) => [
      { lat: a.startLat, lng: a.startLng, label: `Start ${a.label}` },
      { lat: a.endLat, lng: a.endLng, label: `End ${a.label}` },
    ]);
  }, [arcs, showPoints]);

  return (
    <div className="w-full h-[600px] bg-black rounded-2xl shadow-xl overflow-hidden relative">
      <Globe
        ref={globeRef}
        backgroundColor={backgroundColor}
        globeImageUrl={globeImageUrl}
        bumpImageUrl={bumpImageUrl}
        backgroundImageUrl={backgroundImageUrl}
        // 弧线配置
        arcsData={arcs}
        arcAltitude={(d: any) => d.altitude}
        arcColor={(d: any) => d.color}
        arcStroke={0.8}
        arcDashLength={0.4}
        arcDashGap={0.4}
        arcDashAnimateTime={1200}
        // 端点配置
        pointsData={points}
        pointAltitude={0.01}
        pointRadius={pointSize / 100}
        pointLabel={(d: any) => d.label}
        width={undefined}
        height={undefined}
        onGlobeReady={() => setReady(true)}
      />

      {/* 简易图例 */}
      <div className="absolute top-3 left-3 bg-white/10 backdrop-blur text-white text-xs px-3 py-2 rounded-xl">
        <div className="font-semibold">3D Globe Arcs</div>
        <div>Routes: {arcs.length}</div>
        <div>Points: {points.length}</div>
      </div>
    </div>
  );
};

export default GlobeArcs;
