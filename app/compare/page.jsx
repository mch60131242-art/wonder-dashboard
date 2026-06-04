"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import {
  fmtN, fmtEok, signalColor, arrow,
  PREV_DAILY_SPEND, PREV_DAILY_DB, PREV_DAILY_INSTALLS, PREV_DAILY_SIGNUPS, PREV_DAILY_APPTS,
} from "@/lib/data";
import { TIP, AXIS_LINE, SPLIT, LBL } from "@/lib/chart";

const cum = (arr) => { let s = 0; return arr.map((v) => (s += (v || 0))); };
const sumN = (arr) => arr.reduce((a, b) => a + (b || 0), 0);
const last = (arr) => arr[arr.length - 1] || 0;
const pct = (a, b) => (b ? (a - b) / b * 100 : 0);

export default function ComparePage() {
  const { data } = useData();
  const { daily } = data;

  const c = useMemo(() => {
    const [, mm] = (daily[0]?.date || "2026-05-01").split("-").map(Number);
    const curLabel = `${mm}월`, prevLabel = `${mm === 1 ? 12 : mm - 1}월`;
    const elapsed = daily.length;

    const curSpend = daily.map((d) => d.spend), curDB = daily.map((d) => d.db);
    const len = Math.max(PREV_DAILY_SPEND.length, elapsed);
    const days = Array.from({ length: len }, (_, i) => `${i + 1}일`);

    const curSpendSum = sumN(curSpend), prevSpendSame = sumN(PREV_DAILY_SPEND.slice(0, elapsed));
    const curDBSum = sumN(curDB), prevDBSame = sumN(PREV_DAILY_DB.slice(0, elapsed));

    return {
      curLabel, prevLabel, elapsed, days,
      curSpendCum: cum(curSpend), prevSpendCum: cum(PREV_DAILY_SPEND),
      curDBCum: cum(curDB), prevDBCum: cum(PREV_DAILY_DB),
      curInstallsCum: cum(daily.map((d) => d.installs)), prevInstallsCum: cum(PREV_DAILY_INSTALLS),
      curSignupsCum: cum(daily.map((d) => d.signups)), prevSignupsCum: cum(PREV_DAILY_SIGNUPS),
      curApptsCum: cum(daily.map((d) => d.appts)), prevApptsCum: cum(PREV_DAILY_APPTS),
      curSpendSum, prevSpendSame, spendPct: pct(curSpendSum, prevSpendSame),
      curDBSum, prevDBSame, dbPct: pct(curDBSum, prevDBSame),
      prevSpendFinal: sumN(PREV_DAILY_SPEND), prevDBFinal: sumN(PREV_DAILY_DB),
    };
  }, [daily]);

  // 매출(광고비) 누적 — 저번달(회색 점선) vs 이번달(컬러 실선), 양쪽 끝 금액 표기
  const spendOption = useMemo(() => {
    const prevCum = c.prevSpendCum.map((v) => +(v / 1e6).toFixed(1));
    const curCum = c.curSpendCum.map((v) => +(v / 1e6).toFixed(1));
    const fmtY = (v) => v + "백만";
    return {
      grid: { left: 50, right: 62, top: 32, bottom: 26 },
      tooltip: { trigger: "axis", ...TIP, valueFormatter: fmtY },
      legend: { data: [`저번달 ${c.prevLabel}`, `이번달 ${c.curLabel}`], top: 0, right: 0, itemWidth: 14, itemHeight: 8, textStyle: { fontSize: 11, color: "#9aa3b2" } },
      xAxis: { type: "category", data: c.days, axisLine: AXIS_LINE, axisTick: { show: false }, axisLabel: { ...LBL, interval: 2 } },
      yAxis: { type: "value", name: "백만원 (누적)", nameTextStyle: { color: "#7a8494", fontSize: 10 }, splitLine: SPLIT, axisLabel: { ...LBL, formatter: fmtY } },
      series: [
        { name: `저번달 ${c.prevLabel}`, type: "line", data: prevCum, smooth: true, symbol: "none", lineStyle: { width: 2, color: "#7a8494", type: "dashed" }, itemStyle: { color: "#7a8494" }, endLabel: { show: true, color: "#aeb6c4", fontSize: 11, fontWeight: 700, formatter: (p) => fmtY(p.value) } },
        { name: `이번달 ${c.curLabel}`, type: "line", data: curCum, smooth: true, symbol: "circle", symbolSize: 5, lineStyle: { width: 2.6, color: "#7fd3ff" }, itemStyle: { color: "#7fd3ff" }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#7fd3ff33" }, { offset: 1, color: "#7fd3ff00" }] } }, endLabel: { show: true, color: "#7fd3ff", fontSize: 11, fontWeight: 800, formatter: (p) => fmtY(p.value) } },
      ],
    };
  }, [c]);

  // 단계별 소형 멀티 — 각 칸: 저번달(점선) vs 이번달(실선) 누적
  const miniCmp = (prev, cur, color) => ({
    grid: { left: 2, right: 6, top: 6, bottom: 4, containLabel: false },
    tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => fmtN(v) + "건" },
    xAxis: { type: "category", data: c.days, show: false, boundaryGap: false },
    yAxis: { type: "value", show: false },
    series: [
      { name: `저번달 ${c.prevLabel}`, type: "line", data: prev, smooth: true, symbol: "none", lineStyle: { width: 1.6, color: "#8a93a3", type: "dashed" } },
      { name: `이번달 ${c.curLabel}`, type: "line", data: cur, smooth: true, symbol: "none", lineStyle: { width: 2.4, color }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + "40" }, { offset: 1, color: color + "00" }] } } },
    ],
  });

  const stages = [
    { lab: "앱설치", color: "#3b6fd4", cur: c.curInstallsCum, prev: c.prevInstallsCum },
    { lab: "회원가입", color: "#7a6fd6", cur: c.curSignupsCum, prev: c.prevSignupsCum },
    { lab: "시험신청 DB", color: "#14b8a6", cur: c.curDBCum, prev: c.prevDBCum },
    { lab: "위촉", color: "#42d693", cur: c.curApptsCum, prev: c.prevApptsCum },
  ];

  const cards = [
    { lab: `이번달 누적 광고비 (${c.elapsed}일)`, val: fmtEok(c.curSpendSum), dlt: c.spendPct, sub: `저번달 동기간 ${fmtEok(c.prevSpendSame)} 대비`, acc: "#7fd3ff" },
    { lab: `이번달 누적 시험신청 DB (${c.elapsed}일)`, val: fmtN(c.curDBSum) + "건", dlt: c.dbPct, sub: `저번달 동기간 ${fmtN(c.prevDBSame)}건 대비`, acc: "#5b9dff" },
    { lab: `저번달(${c.prevLabel}) 광고비`, val: fmtEok(c.prevSpendFinal), sub: "월 마감 기준", acc: "#7a8494" },
    { lab: `저번달(${c.prevLabel}) 시험신청 DB`, val: fmtN(c.prevDBFinal) + "건", sub: "월 마감 기준", acc: "#7a8494" },
  ];

  return (
    <div className="bento">
      <div style={{ gridColumn: "span 12", gridRow: "span 2", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {cards.map((k) => (
          <div key={k.lab} className="kpi">
            <span className="accent" style={{ background: k.acc }} />
            <span className="k-lab">{k.lab}</span>
            <div className="k-val" style={{ fontSize: 24, display: "flex", alignItems: "baseline", gap: 8 }}>
              {k.val}
              {k.dlt != null && <span style={{ fontSize: 13, fontWeight: 800, color: signalColor(k.dlt) }}>{arrow(k.dlt)}{Math.abs(k.dlt).toFixed(1)}%</span>}
            </div>
            <div className="k-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 5", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">월 매출(광고비) 누적 추이 · 저번달 vs 이번달</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={spendOption} height={320} /></div>
      </div>

      <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 5", display: "flex", flexDirection: "column" }}>
        <div className="h-top">
          <span className="tile-label">각 DB 누적 단계 · 저번달(점선) vs 이번달(실선)</span>
          <span className="tile-label" style={{ fontSize: 11 }}>%=저번달 동기간 대비</span>
        </div>
        <div className="mini-grid">
          {stages.map((s) => {
            const curTotal = last(s.cur), prevSame = s.prev[c.elapsed - 1] || 0, dlt = pct(curTotal, prevSame);
            return (
              <div className="mini" key={s.lab}>
                <div className="mini-h">
                  <span className="mini-t">{s.lab}</span>
                  <span className="mini-v">
                    <b style={{ color: s.color }}>{fmtN(curTotal)}</b>
                    <span style={{ color: signalColor(dlt), fontSize: 10.5, fontWeight: 800, marginLeft: 4 }}>{arrow(dlt)}{Math.abs(dlt).toFixed(1)}%</span>
                  </span>
                </div>
                <EChart option={miniCmp(s.prev, s.cur, s.color)} height={118} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 1", display: "flex", alignItems: "center" }}>
        <span className="k-sub" style={{ margin: 0 }}>
          ※ 매출(revenue) 항목이 없어 <b style={{ color: "#7fd3ff" }}>‘매출=광고비(미디어 집행액)’</b> 기준입니다.
          저번달 일별 데이터(광고비·DB·앱설치·회원가입·위촉)는 모두 설정값(<b>PREV_DAILY_*</b>)이며, 실제 지난달 데이터로 교체 가능합니다.
        </span>
      </div>
    </div>
  );
}
