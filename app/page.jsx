"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { totals, monthsSummary, signalColor, arrow, fmtN, fmtMan, fmtEok, SUB_TARGETS, PREV_SUB, NEXT_SUB } from "@/lib/data";

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

  // 예산 집행률 (이번달)
  const budget = targets.budget || 0;
  const budgetPct = budget ? t.spend / budget : 0;
  const projSpend = m.cur.elapsed ? Math.round(t.spend / m.cur.elapsed * m.cur.days) : t.spend;
  const projBudgetPct = budget ? projSpend / budget : 0;

  return (
    <div className="bento">
      {/* 저번달 — 결과(확정) */}
      <div className="tile hero month" style={{ gridColumn: "span 4", gridRow: "span 6" }}>
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
            <div className="mline">
              <span className="mlab">저번달 동기간 대비</span>
              <span className="mval" style={{ color: signalColor(m.cur.samePct) }}>
                {arrow(m.cur.samePct)} {Math.abs(m.cur.samePct).toFixed(1)}%
                <span className="msub"> ({fmtN(m.cur.samePrev)}→{fmtN(m.cur.db)})</span>
              </span>
            </div>
          </div>
          <SubKpi vals={{ installs: t.installs, signups: t.signups, appts: t.appts }} />
        </div>
      </div>

      {/* 다음달 — 계획·전망 (게이지 대신 목표/페이스) */}
      <div className="tile hero month plan" style={{ gridColumn: "span 4", gridRow: "span 6" }}>
        <div className="h-top">
          <span className="tile-label">다음달 · {m.next.label} 계획</span>
          <span className="h-badge plan-badge">전망</span>
        </div>
        <div className="plan-main">
          <span className="plan-lab">목표</span>
          <div className="plan-target"><span className="big">{fmtN(m.next.target)}</span><span className="unit">건</span></div>
          <div className="plan-mom" style={{ color: signalColor(m.next.targetMoM) }}>
            전월 목표 대비 {arrow(m.next.targetMoM)} {Math.abs(m.next.targetMoM).toFixed(1)}%
          </div>
        </div>
        <div className="card-detail">
          <div className="mlines">
            <div className="mline">
              <span className="mlab">필요 일일 페이스</span>
              <span className="mval">{fmtN(m.next.pace)}건/일</span>
            </div>
            <div className="mline">
              <span className="mlab">추세 가정 예상</span>
              <span className="mval" style={{ color: "var(--muted)" }}>{fmtN(m.next.projDB)}건 · {(m.next.projAch * 100).toFixed(1)}%</span>
            </div>
          </div>
          <SubKpi vals={NEXT_SUB} plan />
        </div>
      </div>

      {/* 소진액 */}
      <div className="tile spend" style={{ gridColumn: "span 4", gridRow: "span 2" }}>
        <span className="tile-label">소진액 · 이번달 누적</span>
        <div className="k-val" style={{ color: "#7fd3ff" }}>{fmtN(t.spend)}<span className="u">원</span></div>
        <div className="k-sub">{fmtEok(t.spend)} · 일평균 {fmtMan(t.spend / (daily.length || 1))}원</div>
      </div>

      {/* 예산 집행률 */}
      <div className="tile" style={{ gridColumn: "span 4", gridRow: "span 2", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span className="tile-label">예산 집행률 · 이번달</span>
        <div className="k-val" style={{ fontSize: 24 }}>{(budgetPct * 100).toFixed(1)}<span className="u">%</span></div>
        <div className="k-bar"><i style={{ width: Math.min(budgetPct * 100, 100) + "%", background: "linear-gradient(90deg,#5b9dff,#7fd3ff)" }} /></div>
        <div className="k-sub" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{fmtEok(t.spend)} / {fmtEok(budget)}</span>
          <span style={{ color: "var(--muted)" }}>예상 월말 {(projBudgetPct * 100).toFixed(0)}%</span>
        </div>
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
    </div>
  );
}
