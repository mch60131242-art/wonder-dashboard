"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { totals, monthsSummary, signalColor, arrow, fmtN, fmtMan, fmtEok, SUB_TARGETS, PREV_SUB, prevSamePeriod } from "@/lib/data";
import { TIP } from "@/lib/chart";

// 단계별 일별 추이 (퍼널 7단계 스파크라인)
const STAGE_DEFS = [
  { key: "clicks", lab: "유입(클릭)", color: "#5b9dff" },
  { key: "installs", lab: "앱설치", color: "#3b6fd4" },
  { key: "signups", lab: "회원가입", color: "#7a6fd6" },
  { key: "db", lab: "시험신청", color: "#14b8a6" },
  { key: "exams", lab: "응시", color: "#ffd27a" },
  { key: "passes", lab: "합격", color: "#ff9d5c" },
  { key: "appts", lab: "위촉", color: "#42d693" },
];

// 서브 KPI(앱설치/회원가입/위촉) 상세 — plan이면 목표값만 표기
const SUB_DEFS = [{ key: "installs", lab: "앱설치" }, { key: "signups", lab: "회원가입" }, { key: "appts", lab: "위촉" }];
function SubKpi({ vals, plan }) {
  return (
    <div className="subkpi">
      {SUB_DEFS.map((d) => {
        const v = vals[d.key], tg = SUB_TARGETS[d.key];
        return (
          <div className="subrow" key={d.key}>
            <span className="slab">{d.lab}</span>
            {plan ? (
              <span className="sval">{fmtN(v)}<span className="starg"> 목표</span></span>
            ) : (
              <span className="sval">{fmtN(v)}<span className="starg"> / {fmtN(tg)}</span>
                <span className="sach" style={{ color: v >= tg ? "var(--amber)" : "var(--muted)" }}> {Math.round(v / tg * 100)}%</span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// 달성률 게이지 옵션 (저번달/이번달 공용)
const makeGauge = (value) => ({
  series: [{
    type: "gauge", startAngle: 210, endAngle: -30, radius: "94%", center: ["50%", "62%"], min: 0, max: 1,
    progress: { show: true, width: 13, roundCap: true, itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: "#3b6fd4" }, { offset: 1, color: "#ff9d5c" }] } } },
    pointer: { show: false }, axisLine: { lineStyle: { width: 13, color: [[1, "#232b38"]] } },
    axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }, anchor: { show: false },
    detail: { formatter: (v) => (v * 100).toFixed(1) + "%", color: "#ffd27a", fontSize: 26, fontWeight: 800, offsetCenter: [0, "12%"] },
    title: { show: false }, data: [{ value }],
  }],
});

export default function KpiPage() {
  const { data } = useData();
  const { channels, daily, targets } = data;
  const t = useMemo(() => totals(channels), [channels]);
  const m = useMemo(() => monthsSummary(daily, targets), [daily, targets]);
  const cpaOver = t.db_cpa > targets.db_cpa;

  const prevGauge = useMemo(() => makeGauge(m.prev.ach), [m]);
  const curGauge = useMemo(() => makeGauge(m.cur.ach), [m]);

  // 광고비 예산 집행률 (이번달)
  const budget = targets.budget || 0;
  const budgetPct = budget ? t.spend / budget : 0;
  const projSpend = m.cur.elapsed ? Math.round(t.spend / m.cur.elapsed * m.cur.days) : t.spend;
  const projBudgetPct = budget ? projSpend / budget : 0;

  // 이번달 실적 · 예상 마감 · 목표 대비 — 퍼널 항목 기준
  const projN = (v) => (m.cur.elapsed ? Math.round(v / m.cur.elapsed * m.cur.days) : v);
  const itemRows = [
    { lab: "유입(클릭)", val: t.clicks, tg: null },
    { lab: "앱설치", val: t.installs, tg: SUB_TARGETS.installs },
    { lab: "회원가입", val: t.signups, tg: SUB_TARGETS.signups },
    { lab: "시험신청", val: t.db, tg: targets.db },
    { lab: "응시", val: t.exams, tg: null },
    { lab: "합격", val: t.passes, tg: targets.qualification },
    { lab: "위촉", val: t.appts, tg: SUB_TARGETS.appts },
  ];

  // 단계별 일별 추이 미니 라인 옵션
  const days = daily.map((d) => d.date.slice(5));
  const miniDaily = (key, color) => ({
    grid: { left: 2, right: 4, top: 4, bottom: 3 },
    tooltip: { trigger: "axis", ...TIP, valueFormatter: (v) => fmtN(v) + "건" },
    xAxis: { type: "category", data: days, show: false, boundaryGap: false },
    yAxis: { type: "value", show: false },
    series: [{ type: "line", data: daily.map((d) => d[key] || 0), smooth: true, symbol: "none", lineStyle: { width: 2.2, color }, areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: color + "40" }, { offset: 1, color: color + "00" }] } } }],
  });

  return (
    <div className="bento">
      {/* 저번달 — 결과(확정) */}
      <div className="tile hero month" style={{ gridColumn: "span 3", gridRow: "span 6" }}>
        <div className="h-top">
          <span className="tile-label">저번달 · {m.prev.label} 결과</span>
          <span className="h-badge">목표 {fmtN(m.prev.target)}</span>
        </div>
        <EChart option={prevGauge} height={150} />
        <div className="h-foot">
          <span className="big">{fmtN(m.prev.final)}</span><span className="unit">건</span>
          <div className="meta">달성률 {(m.prev.ach * 100).toFixed(1)}% · 확정</div>
        </div>
        <div className="card-detail">
          <div className="mlines">
            <div className="mline">
              <span className="mlab">목표 대비</span>
              <span className="mval" style={{ color: signalColor(m.prev.final - m.prev.target) }}>
                {arrow(m.prev.final - m.prev.target)} {fmtN(Math.abs(m.prev.final - m.prev.target))}건
              </span>
            </div>
            <div className="mline">
              <span className="mlab">상태</span>
              <span className="mval" style={{ color: "var(--muted)" }}>마감 완료</span>
            </div>
          </div>
          <SubKpi vals={PREV_SUB} />
        </div>
      </div>

      {/* 이번달 — 진행 + 예상 착지 + 동기간 비교 */}
      <div className="tile hero month focus" style={{ gridColumn: "span 4", gridRow: "span 6" }}>
        <div className="h-top">
          <span className="tile-label">이번달 · {m.cur.label} 진행</span>
          <span className="h-badge">목표 {fmtN(m.cur.target)}</span>
        </div>
        <EChart option={curGauge} height={150} />
        <div className="h-foot">
          <span className="big">{fmtN(m.cur.db)}</span><span className="unit">건</span>
          <div className="meta">{m.cur.elapsed}/{m.cur.days}일 · 달성률 {(m.cur.ach * 100).toFixed(1)}%</div>
        </div>
        <div className="card-detail">
          <div className="mlines">
            <div className="mline">
              <span className="mlab">월말 예상 달성</span>
              <span className="mval" style={{ color: m.cur.projAch >= 1 ? "var(--amber)" : "var(--muted)" }}>
                {fmtN(m.cur.proj)}건 · {(m.cur.projAch * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="subkpi">
            <div className="subcap">단계별 실적 · <span style={{ color: "var(--muted)" }}>저번달 동기간 대비</span></div>
            {STAGE_DEFS.map((s) => {
              const cur = t[s.key] || 0, prevSame = prevSamePeriod(s.key, m.cur.elapsed), pct = prevSame ? (cur - prevSame) / prevSame * 100 : 0;
              return (
                <div className="subrow" key={s.key}>
                  <span className="slab">{s.lab}</span>
                  <span className="sval">{fmtN(cur)}<span style={{ color: signalColor(pct), fontSize: 11, fontWeight: 800, marginLeft: 6 }}>{arrow(pct)}{Math.abs(pct).toFixed(1)}%</span></span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 이번달 실적 · 예상 마감 · 목표 대비 (퍼널 항목) */}
      <div className="tile hero month" style={{ gridColumn: "span 5", gridRow: "span 6", display: "flex", flexDirection: "column" }}>
        <div className="h-top">
          <span className="tile-label" style={{ fontSize: 14 }}>이번달 실적 · 예상 마감 · 목표 대비</span>
          <span className="h-badge" style={{ color: "#fff", background: "rgba(255,255,255,.12)", borderColor: "rgba(255,255,255,.3)", fontSize: 12 }}>{m.cur.elapsed}/{m.cur.days}일</span>
        </div>
        <table className="ftable">
          <thead><tr><th>항목</th><th>실적</th><th>예상 마감</th><th>목표</th><th>달성</th></tr></thead>
          <tbody>
            {itemRows.map((r) => {
              const p = projN(r.val), ach = r.tg ? p / r.tg * 100 : null;
              return (
                <tr key={r.lab}>
                  <td>{r.lab}</td>
                  <td style={{ fontWeight: 700 }}>{fmtN(r.val)}</td>
                  <td>{fmtN(p)}</td>
                  <td style={{ color: r.tg ? "#e8edf4" : "var(--muted2)", fontWeight: r.tg ? 700 : 400 }}>{r.tg ? fmtN(r.tg) : "—"}</td>
                  <td style={{ color: ach == null ? "var(--muted2)" : ach >= 100 ? "var(--amber)" : "var(--muted)", fontWeight: 800 }}>{ach == null ? "—" : ach.toFixed(0) + "%"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="k-sub" style={{ marginTop: "auto", color: "var(--muted2)" }}>※ 예상 마감 = 현재 페이스 × 월 일수 · 달성 = 예상 ÷ 목표</div>
      </div>

      {/* 하단 좌측: 광고비 + CPA 스택 */}
      <div style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* 광고비 · 예산 집행률 (통합) */}
        <div className="tile spend" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="tile-label">광고비 · 이번달 집행 (예산 대비)</span>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 2 }}>
            <div className="k-val" style={{ color: "#7fd3ff" }}>{fmtN(t.spend)}<span className="u">원</span></div>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{(budgetPct * 100).toFixed(1)}<span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>% 집행</span></span>
          </div>
          <div className="k-bar" style={{ marginTop: 9 }}><i style={{ width: Math.min(budgetPct * 100, 100) + "%", background: "linear-gradient(90deg,#5b9dff,#7fd3ff)" }} /></div>
          <div className="k-sub" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{fmtEok(t.spend)} / 예산 {fmtEok(budget)} · 일평균 {fmtMan(t.spend / (daily.length || 1))}원</span>
            <span style={{ color: "var(--muted)" }}>예상 월말 {(projBudgetPct * 100).toFixed(0)}%</span>
          </div>
        </div>
        {/* CPA */}
        <div className="tile cpa" style={{ flex: 1 }}>
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
      </div>

      {/* 하단 우측: 단계별 일별 추이 (퍼널 7단계 스파크라인) */}
      <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">단계별 일별 추이 · 유입 → 위촉 (전 단계)</span>
        <div className="spark-list">
          {STAGE_DEFS.map((s) => {
            const total = t[s.key] || 0;
            return (
              <div className="spark-row" key={s.key}>
                <span className="spark-lab">{s.lab}</span>
                <span className="spark-val" style={{ color: s.color }}>{fmtN(total)}</span>
                <span className="spark-avg">일 {fmtN(Math.round(total / (daily.length || 1)))}</span>
                <div className="spark-chart"><EChart option={miniDaily(s.key, s.color)} height={36} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
