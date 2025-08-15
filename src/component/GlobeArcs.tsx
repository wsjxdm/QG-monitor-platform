import { useRef, useState, useEffect, useMemo } from "react";
import Globe from "react-globe.gl";
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 切换全屏
  const handleFullscreen = () => {
    setIsFullscreen((v) => !v);
    const el = containerRef.current;
    if (el) {
      if (!isFullscreen) {
        if (el.requestFullscreen) el.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    }
  };

  // 监听全屏变化，自动同步状态
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

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

  const globeImageUrl = isFullscreen
    ? "http://47.113.224.195:30420/uploads/images/fe1e8d93-0684-497e-92fb-2a30895eea61.jpg"
    : "https://unpkg.com/three-globe/example/img/earth-day.jpg";
  const bumpImageUrl = isFullscreen
    ? "https://unpkg.com/three-globe/example/img/earth-topology.png"
    : undefined;
  const backgroundImageUrl = isFullscreen
    ? "https://unpkg.com/three-globe/example/img/night-sky.png"
    : "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Earth_map_blank.svg/2048px-Earth_map_blank.svg.png";
  const bgColor = isFullscreen ? "#18181c" : backgroundColor;
  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bgColor,
        position: "relative",
        zIndex: isFullscreen ? 9999 : "auto",
      }}
    >
      {/* 全屏按钮 */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10000,
        }}
      >
        <button
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: 8,
            cursor: "pointer",
            fontSize: 18,
          }}
          onClick={handleFullscreen}
        >
          {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </button>
      </div>
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor={isFullscreen ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)"}
        globeImageUrl={globeImageUrl}
        bumpImageUrl={bumpImageUrl}
        backgroundImageUrl={isFullscreen ? backgroundImageUrl : ""}
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
