"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { fmtN, fmtMan, fmtEok } from "@/lib/data";
import { TIP, AXIS_LINE, SPLIT, LBL } from "@/lib/chart";

const sum = (arr, k) => arr.reduce((a, d) => a + (d[k] || 0), 0);

export default function TrendPage() {
  const { data } = useData();
  const { daily, targets } = data;

  const cmp = useMemo(() => {
    const last7 = daily.slice(-7), prev7 = daily.slice(-14, -7);
    const dbN = sum(last7, "db"), dbP = sum(prev7, "db");
    const spN = sum(last7, "spend"), spP = sum(prev7, "spend");
    const cpaN = dbN ? spN / dbN : 0, cpaP = dbP ? spP / dbP : 0;
    const monthDB = sum(daily, "db"), monthSpend = sum(daily, "spend");
    const pct = (a, b) => (b ? (a - b) / b * 100 : 0);
    return {
      dbN, dbW: pct(dbN, dbP), cpaN, cpaW: pct(cpaN, cpaP),
      monthDB, monthSpend, dbAch: monthDB / targets.db * 100,
    };
  }, [daily, targets]);

  const heroOption = useMemo(() => {
    const days = daily.map((d) => d.date.slice(5));
    const pace = Math.round(targets.db / (daily.length || 1));
    return {
      grid: { left: 42, right: 50, top: 34, bottom: 28 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP },
      legend: { data: ["시험신청 DB", "위촉", "DB CPA(만원)", "소진액(백만)"], top: 0, left: "center", itemWidth: 12, itemHeight: 8, itemGap: 12, textStyle: { fontSize: 10.5, color: "#9aa3b2" } },
      xAxis: { type: "category", data: days, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 1 } },
      yAxis: [
        { type: "value", name: "건수", min: 0, max: 100, splitLine: SPLIT, axisLabel: LBL, nameTextStyle: { color: "#7a8494", fontSize: 10 } },
        { type: "value", name: "만원·백만", min: 0, max: 20, splitLine: { show: false }, axisLabel: LBL, nameTextStyle: { color: "#7a8494", fontSize: 10 } },
      ],
      series: [
        { name: "시험신청 DB", type: "bar", yAxisIndex: 0, data: daily.map((d) => d.db), barWidth: "52%", itemStyle: { borderRadius: [3, 3, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#5b9dff" }, { offset: 1, color: "rgba(91,157,255,.4)" }] } }, markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", width: 1.4 }, label: { show: true, position: "insideEndTop", color: "#ffd27a", fontSize: 9, formatter: "DB 페이스 " + pace }, data: [{ yAxis: pace }] } },
        { name: "위촉", type: "line", yAxisIndex: 1, data: daily.map((d) => d.appts), smooth: true, symbol: "circle", symbolSize: 4, lineStyle: { width: 2.2, color: "#42d693" }, itemStyle: { color: "#42d693" } },
        { name: "DB CPA(만원)", type: "line", yAxisIndex: 1, data: daily.map((d) => +(d.db_cpa / 1e4).toFixed(1)), smooth: true, symbol: "none", lineStyle: { width: 2.2, color: "#ff8c8c" }, itemStyle: { color: "#ff8c8c" }, markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed", width: 1.3 }, label: { show: true, position: "insideStartTop", color: "#ffd27a", fontSize: 9, formatter: "CPA 15만" }, data: [{ yAxis: targets.db_cpa / 1e4 }] } },
        { name: "소진액(백만)", type: "line", yAxisIndex: 1, data: daily.map((d) => +(d.spend / 1e6).toFixed(1)), smooth: true, symbol: "none", lineStyle: { width: 1.6, color: "#c9a3ff", type: "dotted" }, itemStyle: { color: "#c9a3ff" } },
      ],
    };
  }, [daily, targets]);

  const cpaTrend = useMemo(() => ({
    grid: { left: 36, right: 14, top: 14, bottom: 22 }, tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => v + "만" },
    xAxis: { type: "category", data: daily.map((d) => d.date.slice(5)), axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 3 } },
    yAxis: { type: "value", min: 14, max: 18, splitLine: SPLIT, axisLabel: { ...LBL, formatter: "{value}만" } },
    series: [{ type: "line", data: daily.map((d) => +(d.db_cpa / 1e4).toFixed(1)), smooth: true, symbol: "circle", symbolSize: 4, lineStyle: { width: 2.4, color: "#ff8c8c" }, itemStyle: { color: "#ff8c8c" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(255,140,140,.25)" }, { offset: 1, color: "rgba(255,140,140,0)" }] } }, markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed", width: 1.5 }, label: { show: true, position: "insideEndBottom", color: "#ffd27a", fontSize: 10, formatter: "목표 15만" }, data: [{ yAxis: targets.db_cpa / 1e4 }] } }],
  }), [daily, targets]);

  const spendTrend = useMemo(() => ({
    grid: { left: 32, right: 12, top: 14, bottom: 22 }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => v + "백만" },
    xAxis: { type: "category", data: daily.map((d) => d.date.slice(5)), axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 3 } },
    yAxis: { type: "value", min: 0, max: 15, splitLine: SPLIT, axisLabel: LBL },
    series: [{ type: "bar", data: daily.map((d) => +(d.spend / 1e6).toFixed(1)), barWidth: "56%", itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#c9a3ff" }, { offset: 1, color: "rgba(201,163,255,.4)" }] } } }],
  }), [daily]);

  const cards = [
    { lab: "이번주 시험신청 DB", val: fmtN(cmp.dbN) + "건", dlt: cmp.dbW, good: true, acc: "#5b9dff" },
    { lab: "이번주 DB CPA", val: fmtMan(cmp.cpaN) + "원", dlt: cmp.cpaW, good: false, acc: "#ff7b7b" },
    { lab: "월 누적 시험신청 DB", val: fmtN(cmp.monthDB) + "건", sub: "달성률 " + cmp.dbAch.toFixed(1) + "%", acc: "#42d693" },
    { lab: "월 누적 소진액", val: fmtEok(cmp.monthSpend), sub: "일평균 " + fmtMan(cmp.monthSpend / (daily.length || 1)) + "원", acc: "#ffd27a" },
  ];

  return (
    <div className="bento">
      <div className="tile hero" style={{ gridColumn: "span 8", gridRow: "span 6", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">일별 통합 추이 · 막대=시험신청 DB, 선=위촉·CPA·소진액</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={heroOption} height={360} /></div>
      </div>

      <div className="tile" style={{ gridColumn: "span 4", gridRow: "span 3", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">일별 DB CPA 추이 (만원)</span>
        <div style={{ flex: 1, marginTop: 4 }}><EChart option={cpaTrend} height={150} /></div>
      </div>
      <div className="tile" style={{ gridColumn: "span 4", gridRow: "span 3", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">일별 소진액 추이 (백만원)</span>
        <div style={{ flex: 1, marginTop: 4 }}><EChart option={spendTrend} height={150} /></div>
      </div>

      <div style={{ gridColumn: "span 12", gridRow: "span 2", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {cards.map((c) => (
          <div key={c.lab} className="kpi">
            <span className="accent" style={{ background: c.acc }} />
            <span className="k-lab">{c.lab}</span>
            <div className="k-val" style={{ fontSize: 23, display: "flex", alignItems: "baseline", gap: 8 }}>
              {c.val}
              {c.dlt != null && <span style={{ fontSize: 13 }} className={c.good ? (c.dlt >= 0 ? "up" : "down") : (c.dlt <= 0 ? "up" : "down")}>{c.dlt >= 0 ? "▲" : "▼"}{Math.abs(c.dlt).toFixed(1)}%</span>}
            </div>
            <div className="k-sub">{c.sub || "지난주 대비"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
