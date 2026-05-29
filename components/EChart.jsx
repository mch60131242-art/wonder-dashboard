"use client";
import { useEffect, useRef } from "react";

// echarts 를 클라이언트에서만 동적 로드 (SSR 빌드 안전)
export default function EChart({ option, height = 300, className = "" }) {
  const elRef = useRef(null);
  const chartRef = useRef(null);
  const optionRef = useRef(option);
  optionRef.current = option;

  useEffect(() => {
    let disposed = false;
    let onResize;
    import("echarts").then((echarts) => {
      if (disposed || !elRef.current) return;
      const chart = echarts.init(elRef.current);
      chartRef.current = chart;
      if (optionRef.current) chart.setOption(optionRef.current, true);
      onResize = () => chart.resize();
      window.addEventListener("resize", onResize);
    });
    return () => {
      disposed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      if (chartRef.current) { chartRef.current.dispose(); chartRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && option) chartRef.current.setOption(option, true);
  }, [option]);

  return <div ref={elRef} className={className} style={{ width: "100%", height }} />;
}
