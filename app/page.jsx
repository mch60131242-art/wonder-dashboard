"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { totals, fmtN, fmtMan, fmtEok, colorOf } from "@/lib/data";
import { TIP, AXIS_LINE, SPLIT, LBL } from "@/lib/chart";

export default function KpiPage() {
  const { data } = useData();
  const { channels, daily, targets } = data;
  const t = useMemo(() => totals(channels), [channels]);
  const dbAch = t.db / targets.db;
  const cpaOver = t.db_cpa > targets.db_cpa;

  const gaugeOption = useMemo(() => ({
    series: [{
      type: "gauge", startAngle: 210, endAngle: -30, radius: "96%", center: ["50%", "60%"], min: 0, max: 1,
      progress: { show: true, width: 16, roundCap: true, itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#3b6fd4" }, { offset: 1, color: "#ff9d5c" }] } } },
      pointer: { show: false }, axisLine: { lineStyle: { width: 16, color: [[1, "#232b38"]] } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, anchor: { show: false },
      detail: { formatter: (v) => (v * 100).toFixed(1) + "%", color: "#ffd27a", fontSize: 30, fontWeight: 800, offsetCenter: [0, "8%"] },
      title: { show: false }, data: [{ value: dbAch }],
    }],
  }), [dbAch]);

  const trendOption = useMemo(() => {
    const days = daily.map((d) => d.date.slice(5));
    const pace = Math.round(targets.db / (daily.length || 1));
    return {
      grid: { left: 34, right: 14, top: 14, bottom: 24 }, tooltip: { trigger: "axis", ...TIP },
      xAxis: { type: "category", data: days, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 2 } },
      yAxis: { type: "value", min: 50, max: 95, splitLine: SPLIT, axisLabel: LBL },
      series: [{
        type: "bar", data: daily.map((d) => d.db), barWidth: "55%",
        itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#5b9dff" }, { offset: 1, color: "rgba(91,157,255,.4)" }] } },
        markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed", width: 1.5 }, label: { show: true, position: "insideEndTop", color: "#ffd27a", fontSize: 10, formatter: "목표 페이스 " + pace }, data: [{ yAxis: pace }] },
      }],
    };
  }, [daily, targets]);

  const mediaOption = useMemo(() => {
    const sorted = [...channels].sort((a, b) => a.db - b.db);
    return {
      grid: { left: 6, right: 42, top: 6, bottom: 6, containLabel: true }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP },
      xAxis: { type: "value", show: false, max: Math.max(...channels.map((c) => c.db)) * 1.18 },
      yAxis: { type: "category", data: sorted.map((c) => c.channel), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#cdd5e2", fontSize: 11.5, fontWeight: 600 } },
      series: [{ type: "bar", data: sorted.map((c, i) => ({ value: c.db, itemStyle: { color: colorOf(c.channel, i), borderRadius: [0, 7, 7, 0] } })), barWidth: "62%", label: { show: true, position: "right", color: "#aeb6c4", fontSize: 11, fontWeight: 700, formatter: "{c}" } }],
    };
  }, [channels]);

  return (
    <div className="bento">
      {/* 히어로: DB 달성률 게이지 */}
      <div className="tile hero" style={{ gridColumn: "span 4", gridRow: "span 4" }}>
        <div className="h-top">
          <span className="tile-label">시험신청 DB · 월목표 달성률</span>
          <span className="h-badge">목표 {fmtN(targets.db)}</span>
        </div>
        <EChart option={gaugeOption} height={180} />
        <div className="h-foot">
          <span className="big">{fmtN(t.db)}</span><span className="unit">건</span>
          <div className="meta">목표 {fmtN(targets.db)}건 · 달성률 {(dbAch * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* 소진액 */}
      <div className="tile spend" style={{ gridColumn: "span 4", gridRow: "span 2" }}>
        <span className="tile-label">소진액 · 이번달 누적</span>
        <div className="k-val" style={{ color: "#7fd3ff" }}>{fmtN(t.spend)}<span className="u">원</span></div>
        <div className="k-sub">{fmtEok(t.spend)} · 일평균 {fmtMan(t.spend / (daily.length || 1))}원</div>
      </div>

      {/* CPA */}
      <div className="tile cpa" style={{ gridColumn: "span 4", gridRow: "span 2" }}>
        <span className="tile-label" style={{ color: "#ffb3b3" }}>● DB CPA{cpaOver ? " · 목표 초과" : ""}</span>
        <div className="c-val">{fmtN(t.db_cpa)}<span className="u"> 원 ({fmtMan(t.db_cpa)})</span></div>
        <div className="bar-track">
          <div className="fill" style={{ width: Math.min(t.db_cpa / targets.db_cpa * 88, 100) + "%" }} />
          <div className="target" style={{ left: "88%" }} />
        </div>
        <div className="k-sub" style={{ color: "#e0a0a0", display: "flex", justifyContent: "space-between" }}>
          <span>목표 {fmtN(targets.db_cpa)}원</span>
          <span style={{ color: cpaOver ? "#ff8989" : "#42d693", fontWeight: 700 }}>{cpaOver ? "+" : ""}{((t.db_cpa / targets.db_cpa - 1) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* 미니 KPI 3종 */}
      <div style={{ gridColumn: "span 4", gridRow: "span 4", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="kpi" style={{ flex: 1 }}>
          <span className="k-lab">앱설치</span>
          <div className="k-val">{fmtN(t.installs)}<span className="u">건</span></div>
          <div className="k-sub">목표 {fmtN(targets.app_install)} · 달성 {(t.installs / targets.app_install * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi" style={{ flex: 1 }}>
          <span className="k-lab">회원가입</span>
          <div className="k-val">{fmtN(t.signups)}<span className="u">건</span></div>
          <div className="k-sub">앱설치 대비 {(t.signups / t.installs * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi" style={{ flex: 1 }}>
          <span className="k-lab">위촉</span>
          <div className="k-val">{fmtN(t.appts)}<span className="u">건</span></div>
          <div className="k-sub">DB→위촉 {(t.appts / t.db * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* 추이 */}
      <div className="tile" style={{ gridColumn: "span 8", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">일별 시험신청 DB 추이</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={trendOption} height={300} /></div>
      </div>

      {/* 매체별 DB */}
      <div className="tile" style={{ gridColumn: "span 4", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">매체별 시험신청 DB (내림차순)</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={mediaOption} height={300} /></div>
      </div>
    </div>
  );
}
