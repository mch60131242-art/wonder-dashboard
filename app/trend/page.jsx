"use client";
import { useMemo, useState } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { fmtN, fmtMan, fmtEok, signalColor, arrow, daysInMonth, PREV_DAILY_SPEND, PREV_DAILY_DB, PREV_DAILY_APPTS } from "@/lib/data";
import { TIP, AXIS_LINE, SPLIT, LBL } from "@/lib/chart";

const sum = (arr, k) => arr.reduce((a, d) => a + (d[k] || 0), 0);
const ps = (arr) => arr.reduce((a, b) => a + (b || 0), 0);
const pctOf = (a, b) => (b ? (a - b) / b * 100 : 0);
const SUBTABS = ["일간", "주간", "월간"];

// 증감 칩 카드 (탭 공용)
function DeltaCards({ cards, subDefault }) {
  return (
    <div style={{ gridColumn: "span 12", gridRow: "span 2", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {cards.map((c) => (
        <div key={c.lab} className="kpi">
          <span className="accent" style={{ background: c.acc }} />
          <span className="k-lab">{c.lab}</span>
          <div className="k-val" style={{ fontSize: 23, display: "flex", alignItems: "baseline", gap: 8 }}>
            {c.val}
            {c.dlt != null && <span style={{ fontSize: 13, fontWeight: 800, color: signalColor(c.dlt) }}>{arrow(c.dlt)}{Math.abs(c.dlt).toFixed(1)}%</span>}
          </div>
          <div className="k-sub">{c.sub || subDefault}</div>
        </div>
      ))}
    </div>
  );
}

export default function TrendPage() {
  const { data } = useData();
  const { daily, targets } = data;
  const [tab, setTab] = useState("일간");
  const pace = Math.round(targets.db / (daily.length || 1));
  const days = daily.map((d) => d.date.slice(5));

  /* ── 일간 ── */
  const dbDaily = useMemo(() => ({
    grid: { left: 38, right: 16, top: 28, bottom: 26 }, tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => fmtN(v) + "건" },
    xAxis: { type: "category", data: days, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 1 } },
    yAxis: { type: "value", min: 50, max: 95, splitLine: SPLIT, axisLabel: LBL },
    series: [{
      type: "bar", barWidth: "58%",
      data: daily.map((d) => ({ value: d.db, itemStyle: { borderRadius: [4, 4, 0, 0], color: d.db >= pace ? "#5b9dff" : "#33476b" } })),
      markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed", width: 1.5 }, label: { show: true, position: "insideEndTop", color: "#ffd27a", fontSize: 11, formatter: "목표 페이스 " + pace }, data: [{ yAxis: pace }] },
    }],
  }), [daily, pace]);

  const cpaDaily = useMemo(() => {
    const tg = targets.db_cpa / 1e4;
    return {
      grid: { left: 36, right: 14, top: 16, bottom: 22 }, tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => v + "만" },
      xAxis: { type: "category", data: days, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 3 } },
      yAxis: { type: "value", min: 14, max: 18, splitLine: SPLIT, axisLabel: { ...LBL, formatter: "{value}만" } },
      series: [{
        type: "line", smooth: true, symbol: "circle", symbolSize: 6, lineStyle: { width: 2, color: "#6b7484" },
        data: daily.map((d) => { const v = +(d.db_cpa / 1e4).toFixed(1); return { value: v, itemStyle: { color: signalColor(tg - v) } }; }),
        markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed", width: 1.5 }, label: { show: true, position: "insideEndBottom", color: "#ffd27a", fontSize: 10, formatter: "목표 15만" }, data: [{ yAxis: tg }] },
      }],
    };
  }, [daily, targets]);

  const spendDaily = useMemo(() => ({
    grid: { left: 38, right: 14, top: 16, bottom: 24 }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => v + "백만" },
    xAxis: { type: "category", data: days, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 1 } },
    yAxis: { type: "value", min: 0, max: 15, splitLine: SPLIT, axisLabel: LBL },
    series: [{ type: "bar", data: daily.map((d) => +(d.spend / 1e6).toFixed(1)), barWidth: "56%", itemStyle: { borderRadius: [4, 4, 0, 0], color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#c9a3ff" }, { offset: 1, color: "rgba(201,163,255,.4)" }] } } }],
  }), [daily]);

  /* ── 주간 ── */
  const weekly = useMemo(() => {
    const w = [];
    for (let i = 0; i < daily.length; i += 7) {
      const ck = daily.slice(i, i + 7);
      const db = sum(ck, "db"), spend = sum(ck, "spend"), appts = sum(ck, "appts");
      w.push({ label: `${w.length + 1}주차`, db, spend, appts, cpa: db ? spend / db : 0, days: ck.length });
    }
    return w;
  }, [daily]);

  const weekDbOpt = useMemo(() => ({
    grid: { left: 40, right: 16, top: 30, bottom: 24 }, tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => fmtN(v) + "건" },
    xAxis: { type: "category", data: weekly.map((w) => w.label), axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: LBL },
    yAxis: { type: "value", splitLine: SPLIT, axisLabel: LBL },
    series: [{
      type: "bar", barWidth: "46%",
      data: weekly.map((w) => ({ value: w.db, itemStyle: { borderRadius: [5, 5, 0, 0], color: (w.days ? w.db / w.days : 0) >= pace ? "#5b9dff" : "#33476b" } })),
      label: { show: true, position: "top", color: "#cdd5e2", fontSize: 11, fontWeight: 700, formatter: (p) => fmtN(p.value) },
      markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed" }, label: { show: true, position: "insideEndTop", color: "#ffd27a", fontSize: 10, formatter: "주 목표 " + pace * 7 }, data: [{ yAxis: pace * 7 }] },
    }],
  }), [weekly, pace]);

  const weekMixOpt = useMemo(() => ({
    grid: { left: 40, right: 44, top: 30, bottom: 24 }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP },
    legend: { data: ["소진액(백만)", "DB CPA(만원)"], top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 10.5, color: "#9aa3b2" } },
    xAxis: { type: "category", data: weekly.map((w) => w.label), axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: LBL },
    yAxis: [
      { type: "value", splitLine: SPLIT, axisLabel: LBL },
      { type: "value", min: 14, max: 18, splitLine: { show: false }, axisLabel: { ...LBL, formatter: "{value}만" } },
    ],
    series: [
      { name: "소진액(백만)", type: "bar", yAxisIndex: 0, barWidth: "40%", data: weekly.map((w) => +(w.spend / 1e6).toFixed(0)), itemStyle: { borderRadius: [5, 5, 0, 0], color: "#c9a3ff" } },
      { name: "DB CPA(만원)", type: "line", yAxisIndex: 1, smooth: true, symbol: "circle", symbolSize: 7, data: weekly.map((w) => +(w.cpa / 1e4).toFixed(1)), lineStyle: { width: 2.4, color: "#ff8c8c" }, itemStyle: { color: "#ff8c8c" } },
    ],
  }), [weekly]);

  const wkCards = useMemo(() => {
    const l = daily.slice(-7), p = daily.slice(-14, -7);
    const dbN = sum(l, "db"), dbP = sum(p, "db"), spN = sum(l, "spend"), spP = sum(p, "spend"), apN = sum(l, "appts"), apP = sum(p, "appts");
    const cpaN = dbN ? spN / dbN : 0, cpaP = dbP ? spP / dbP : 0;
    return [
      { lab: "이번주 시험신청 DB", val: fmtN(dbN) + "건", dlt: pctOf(dbN, dbP), acc: "#5b9dff" },
      { lab: "이번주 소진액", val: fmtEok(spN), dlt: pctOf(spN, spP), acc: "#c9a3ff" },
      { lab: "이번주 DB CPA", val: fmtMan(cpaN) + "원", dlt: pctOf(cpaN, cpaP), acc: "#ff7b7b" },
      { lab: "이번주 위촉", val: fmtN(apN) + "건", dlt: pctOf(apN, apP), acc: "#42d693" },
    ];
  }, [daily]);

  /* ── 월간 ── */
  const monthly = useMemo(() => {
    const elapsed = daily.length;
    const [yy, mm] = (daily[0]?.date || "2026-05-01").split("-").map(Number);
    const md = daysInMonth(yy, mm);
    const cur = { db: sum(daily, "db"), spend: sum(daily, "spend"), appts: sum(daily, "appts") };
    cur.cpa = cur.db ? cur.spend / cur.db : 0;
    const proj = elapsed ? Math.round(cur.db / elapsed * md) : cur.db;
    const prevSame = { db: ps(PREV_DAILY_DB.slice(0, elapsed)), spend: ps(PREV_DAILY_SPEND.slice(0, elapsed)), appts: ps(PREV_DAILY_APPTS.slice(0, elapsed)) };
    prevSame.cpa = prevSame.db ? prevSame.spend / prevSame.db : 0;
    const prevFull = { db: ps(PREV_DAILY_DB), spend: ps(PREV_DAILY_SPEND), appts: ps(PREV_DAILY_APPTS) };
    return {
      elapsed, proj, prevFull, dbAch: cur.db / targets.db * 100, projAch: proj / targets.db * 100,
      cards: [
        { lab: "시험신청 DB", val: fmtN(cur.db) + "건", dlt: pctOf(cur.db, prevSame.db), acc: "#5b9dff" },
        { lab: "소진액", val: fmtEok(cur.spend), dlt: pctOf(cur.spend, prevSame.spend), acc: "#c9a3ff" },
        { lab: "DB CPA", val: fmtMan(cur.cpa) + "원", dlt: pctOf(cur.cpa, prevSame.cpa), acc: "#ff7b7b" },
        { lab: "위촉", val: fmtN(cur.appts) + "건", dlt: pctOf(cur.appts, prevSame.appts), acc: "#42d693" },
      ],
      barCats: ["저번달 확정", `이번달 누적(${elapsed}일)`, "이번달 예상", "이번달 목표"],
      barVals: [
        { value: prevFull.db, itemStyle: { color: "#7a8494", borderRadius: [5, 5, 0, 0] } },
        { value: cur.db, itemStyle: { color: "#5b9dff", borderRadius: [5, 5, 0, 0] } },
        { value: proj, itemStyle: { color: "#42d693", borderRadius: [5, 5, 0, 0] } },
        { value: targets.db, itemStyle: { color: "#ffd27a", borderRadius: [5, 5, 0, 0] } },
      ],
    };
  }, [daily, targets]);

  const monthBar = useMemo(() => ({
    grid: { left: 42, right: 26, top: 20, bottom: 26 }, tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => fmtN(v) + "건" },
    xAxis: { type: "category", data: monthly.barCats, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, fontSize: 11 } },
    yAxis: { type: "value", splitLine: SPLIT, axisLabel: LBL },
    series: [{ type: "bar", barWidth: "52%", data: monthly.barVals, label: { show: true, position: "top", color: "#cdd5e2", fontWeight: 700, fontSize: 11, formatter: (p) => fmtN(p.value) } }],
  }), [monthly]);

  return (
    <>
      <div className="seg">
        {SUBTABS.map((t) => <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {tab === "일간" && (
        <div className="bento">
          <div className="tile" style={{ gridColumn: "span 8", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">일별 시험신청 DB · <span style={{ color: "#5b9dff" }}>페이스 이상=진한 파랑</span> / <span style={{ color: "#33476b" }}>미달=흐림</span></span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={dbDaily} height={300} /></div>
          </div>
          <div className="tile" style={{ gridColumn: "span 4", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">일별 DB CPA · <span style={{ color: "#ff7b7b" }}>목표 이내=빨강</span> / <span style={{ color: "#5b9dff" }}>초과=파랑</span></span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={cpaDaily} height={300} /></div>
          </div>
          <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 3", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">일별 소진액 (백만원)</span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={spendDaily} height={180} /></div>
          </div>
        </div>
      )}

      {tab === "주간" && (
        <div className="bento">
          <DeltaCards cards={wkCards} subDefault="지난주 대비" />
          <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">주차별 시험신청 DB · <span style={{ color: "#5b9dff" }}>일평균 페이스 달성=진한 파랑</span></span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={weekDbOpt} height={250} /></div>
          </div>
          <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">주차별 소진액 & DB CPA</span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={weekMixOpt} height={250} /></div>
          </div>
        </div>
      )}

      {tab === "월간" && (
        <div className="bento">
          <DeltaCards cards={monthly.cards} subDefault="저번달 동기간 대비" />
          <div className="tile" style={{ gridColumn: "span 7", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">월 시험신청 DB · 저번달 확정 vs 이번달(누적·예상) vs 목표</span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={monthBar} height={250} /></div>
          </div>
          <div className="tile" style={{ gridColumn: "span 5", gridRow: "span 4", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span className="tile-label">이번달 목표 달성</span>
            <div className="k-val" style={{ fontSize: 30, marginTop: 8 }}>{monthly.dbAch.toFixed(1)}<span className="u">%</span></div>
            <div className="k-bar" style={{ marginTop: 10 }}><i style={{ width: Math.min(monthly.dbAch, 100) + "%", background: "linear-gradient(90deg,#3b6fd4,#ff9d5c)" }} /></div>
            <div className="k-sub" style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
              <span>현재 {monthly.elapsed}일차 누적</span>
              <span style={{ color: monthly.projAch >= 100 ? "var(--amber)" : "var(--muted)" }}>월말 예상 {monthly.projAch.toFixed(0)}%</span>
            </div>
            <div className="k-sub" style={{ marginTop: 14, color: "var(--muted2)" }}>※ 일자별 누적 비교는 ‘③ 월별 추이 비교’ 탭 참고</div>
          </div>
        </div>
      )}
    </>
  );
}
