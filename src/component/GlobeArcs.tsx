import { useRef, useState, useEffect, useMemo } from "react";
import Globe from "react-globe.gl";

export type Route = {
  id?: string | number;
  start: { lat: number; lng: number; city?: string; event?: number }; // 起点信息
  end: { lat: number; lng: number; city?: string; event?: number }; // 终点信息
  color?: string | [string, string];
  altitude?: number;
};

type GlobeArcsProps = {
  routes: Route[];
  autoRotate?: boolean;
  showPoints?: boolean;
  backgroundColor?: string;
  pointSize?: number;
};

export default function GlobeArcs({
  routes,
  showPoints = true,
  autoRotate = true,
  backgroundColor = "#ebe8f0",
  pointSize = 0.5,
}: GlobeArcsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // 监听父容器尺寸变化
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  // Arc 数据
  const arcs = useMemo(
    () =>
      routes.map((r, idx) => ({
        id: r.id ?? idx,
        startLat: r.start.lat,
        startLng: r.start.lng,
        startCity: r.start.city || "",
        startEvent: r.start.event ?? 0,
        endLat: r.end.lat,
        endLng: r.end.lng,
        endCity: r.end.city || "",
        endEvent: r.end.event ?? 0,
        color: r.color ?? "#00d1ff",
        altitude: r.altitude ?? 0.2,
      })),
    [routes]
  );

  // Point 数据（区分起点/终点）
  const points = useMemo(() => {
    if (!showPoints) return [] as any[];
    return arcs.flatMap((a) => [
      {
        lat: a.startLat,
        lng: a.startLng,
        city: a.startCity,
        event: a.startEvent,
        type: "start",
      },
      {
        lat: a.endLat,
        lng: a.endLng,
        city: a.endCity,
        event: a.endEvent,
        type: "end",
      },
    ]);
  }, [arcs, showPoints]);

  // 设置自动旋转
  useEffect(() => {
    if (!globeRef.current) return;
    requestAnimationFrame(() => {
      const controls = globeRef.current.controls();
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.6;
    });
  }, [autoRotate]);

  if (!size.width || !size.height) {
    return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(255,255,255,1)" // 白色主题
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-day.jpg"
        arcsData={arcs}
        arcColor={(d: any) => d.color}
        arcStroke={0.8}
        arcDashLength={0.4}
        arcDashGap={0.4}
        arcDashAnimateTime={1200}
        pointsData={points}
        pointColor={(d: any) => (d.type === "start" ? "#2dd4bf" : "#60a5fa")}
        pointAltitude={0.02}
        pointRadius={pointSize}
        pointLabel={(d: any) =>
          d.type === "start"
            ? `起点：${d.city} \n 非法访问次数：${d.event}`
            : `终点：${d.city}`
        }
        enablePointerInteraction={true}
      />
    </div>
  );
}
