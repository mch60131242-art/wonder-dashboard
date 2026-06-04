"use client";
import { useMemo, useState } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { totals, fmtN, fmtMan, colorOf, cpaTargetOf, signalColor, budgetOf, stageTargetOf } from "@/lib/data";
import { TIP, SPLIT, LBL } from "@/lib/chart";

const STAGES = [
  { key: "all", lab: "종합" },
  { key: "clicks", lab: "유입", prev: null },
  { key: "installs", lab: "앱설치", prev: "clicks" },
  { key: "signups", lab: "회원가입", prev: "installs" },
  { key: "db", lab: "시험신청", prev: "signups" },
  { key: "exams", lab: "응시", prev: "db" },
  { key: "passes", lab: "합격", prev: "exams" },
  { key: "appts", lab: "위촉", prev: "passes" },
];

export default function MediaPage() {
  const { data } = useData();
  const { channels } = data;
  const t = useMemo(() => totals(channels), [channels]);
  const [stageKey, setStageKey] = useState("all");
  const stage = STAGES.find((s) => s.key === stageKey) || STAGES[0];

  // 그래프 구동 키 (종합이면 시험신청 DB 기준)
  const gKey = stageKey === "all" ? "db" : stageKey;
  const gLab = stageKey === "all" ? "시험신청 DB" : stage.lab;

  const stageRows = useMemo(() => {
    if (stageKey === "all") return [];
    const tot = channels.reduce((a, c) => a + (c[stageKey] || 0), 0);
    const arr = [...channels].sort((a, b) => (b[stageKey] || 0) - (a[stageKey] || 0)).map((c) => {
      const cnt = c[stageKey] || 0, target = stageTargetOf(c.channel, stageKey);
      return { c, cnt, target, ach: target ? cnt / target * 100 : null, unit: cnt ? Math.round(c.spend / cnt) : 0, share: tot ? cnt / tot * 100 : 0, conv: stage.prev && c[stage.prev] ? cnt / c[stage.prev] * 100 : null };
    });
    [...arr].filter((r) => r.ach != null).sort((a, b) => b.ach - a.ach).forEach((r, i) => { r.achRank = i + 1; });
    return arr;
  }, [channels, stageKey, stage.prev]);

  // 매체별 [단계] 수 (+ 매체 목표 ◆)
  const countBar = useMemo(() => {
    const s = [...channels].sort((a, b) => (a[gKey] || 0) - (b[gKey] || 0));
    const maxV = Math.max(...s.map((c) => Math.max(c[gKey] || 0, stageTargetOf(c.channel, gKey) || 0))) || 1;
    return {
      grid: { left: 6, right: 44, top: 24, bottom: 6, containLabel: true }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP },
      legend: { data: [gLab + " 수", "목표"], top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 11, color: "#9aa3b2" } },
      xAxis: { type: "value", show: false, max: maxV * 1.18 },
      yAxis: { type: "category", data: s.map((c) => c.channel), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#cdd5e2", fontSize: 11 } },
      series: [
        { name: gLab + " 수", type: "bar", barWidth: "60%", data: s.map((c, i) => ({ value: c[gKey] || 0, itemStyle: { color: colorOf(c.channel, i), borderRadius: [0, 6, 6, 0] } })), label: { show: true, position: "right", color: "#aeb6c4", fontSize: 10.5, fontWeight: 700, formatter: "{c}" } },
        { name: "목표", type: "scatter", symbol: "diamond", symbolSize: 11, z: 5, data: s.map((c, i) => [stageTargetOf(c.channel, gKey), i]), itemStyle: { color: "#ffd27a", borderColor: "#11161e", borderWidth: 1.5 }, tooltip: { valueFormatter: (v) => fmtN(v) } },
      ],
    };
  }, [channels, gKey, gLab]);

  // 매체별 [단계]당 비용 (단가). 시험신청이면 매체 목표(◆) 표시
  const unitBar = useMemo(() => {
    const isDb = gKey === "db";
    const arr = channels.map((c) => ({ channel: c.channel, db_cpa: c.db_cpa, unit: (c[gKey] || 0) ? Math.round(c.spend / c[gKey]) : 0 }));
    const s = arr.sort((a, b) => a.unit - b.unit);
    const series = [{
      name: gLab + "당 비용", type: "bar", barWidth: "58%",
      data: s.map((c) => ({ value: c.unit, itemStyle: { color: isDb ? signalColor(cpaTargetOf(c.channel) - c.db_cpa) : "#7a6fd6", borderRadius: [0, 6, 6, 0] } })),
      label: { show: true, position: "right", color: "#aeb6c4", fontSize: 10.5, fontWeight: 700, formatter: (p) => fmtMan(p.value) },
    }];
    if (isDb) series.push({ name: "매체 목표", type: "scatter", symbol: "diamond", symbolSize: 12, z: 5, data: s.map((c, i) => [cpaTargetOf(c.channel), i]), itemStyle: { color: "#ffd27a", borderColor: "#11161e", borderWidth: 1.5 }, tooltip: { valueFormatter: (v) => fmtN(v) + "원" } });
    return {
      grid: { left: 6, right: 46, top: 26, bottom: 6, containLabel: true }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => fmtN(v) + "원" },
      legend: { data: isDb ? ["DB CPA", "매체 목표"] : [gLab + "당 비용"], top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 11, color: "#9aa3b2" } },
      xAxis: { type: "value", axisLabel: { ...LBL, formatter: (v) => fmtMan(v) }, splitLine: SPLIT },
      yAxis: { type: "category", data: s.map((c) => c.channel), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#cdd5e2", fontSize: 11 } },
      series,
    };
  }, [channels, gKey, gLab]);

  // 예산 비중 vs [단계] 기여 비중
  const shareBar = useMemo(() => {
    const totG = channels.reduce((a, c) => a + (c[gKey] || 0), 0) || 1;
    const s = [...channels].sort((a, b) => (b[gKey] || 0) - (a[gKey] || 0));
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => v + "%" },
      legend: { data: ["예산 비중", gLab + " 기여 비중"], top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 11, color: "#9aa3b2" } },
      grid: { left: 6, right: 14, top: 30, bottom: 6, containLabel: true },
      xAxis: { type: "category", data: s.map((c) => c.channel), axisLabel: { ...LBL, interval: 0 } },
      yAxis: { type: "value", axisLabel: { ...LBL, formatter: "{value}%" }, splitLine: SPLIT },
      series: [
        { name: "예산 비중", type: "bar", barWidth: "30%", data: s.map((c) => +(c.spend / t.spend * 100).toFixed(1)), itemStyle: { color: "#7a6fd6", borderRadius: [4, 4, 0, 0] } },
        { name: gLab + " 기여 비중", type: "bar", barWidth: "30%", data: s.map((c) => +((c[gKey] || 0) / totG * 100).toFixed(1)), itemStyle: { color: "#5b9dff", borderRadius: [4, 4, 0, 0] } },
      ],
    };
  }, [channels, t, gKey, gLab]);

  // 매체별 CPA 목표 대비 (낮을수록 효율 좋음) — 좋은 순 정렬
  const evalRows = useMemo(() => [...channels].map((c) => {
    const cpaT = cpaTargetOf(c.channel);
    return { channel: c.channel, cpaVs: cpaT ? (c.db_cpa / cpaT - 1) * 100 : 0 };
  }).sort((a, b) => a.cpaVs - b.cpaVs), [channels]);

  return (
    <>
      {/* 맨 위: 퍼널 단계 선택 — 그래프·표 전체 구동 */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <span className="tile-label" style={{ fontSize: 13 }}>퍼널 단계별 매체 분석</span>
        <div className="seg" style={{ margin: 0 }}>
          {STAGES.map((s) => (
            <button key={s.key} className={stageKey === s.key ? "on" : ""} onClick={() => setStageKey(s.key)}>{s.lab}</button>
          ))}
        </div>
      </div>

      {stageKey === "all" ? (
        /* ===== 종합: 각 매체별 종합표 ===== */
        <div className="bento">
          <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 5", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">매체별 종합표 · 광고비 · 예산 · 집행률 · DB CPA</span>
            <div className="tbl-scroll" style={{ marginTop: 8 }}>
              <table className="mtable">
                <thead><tr><th>매체</th><th>광고비</th><th>예산(계획)</th><th>집행률</th><th>DB CPA</th><th>CPA 목표</th></tr></thead>
                <tbody>
                  {[...channels].sort((a, b) => b.spend - a.spend).map((c) => {
                    const bg = budgetOf(c.channel);
                    return (
                      <tr key={c.channel}>
                        <td style={{ fontWeight: 700 }}>{c.channel}</td>
                        <td>{fmtMan(c.spend)}</td>
                        <td style={{ color: "var(--muted)" }}>{bg ? fmtMan(bg) : "-"}</td>
                        <td style={{ color: "var(--muted)" }}>{bg ? Math.round(c.spend / bg * 100) + "%" : "-"}</td>
                        <td style={{ color: signalColor(cpaTargetOf(c.channel) - c.db_cpa), fontWeight: 700 }}>{fmtN(c.db_cpa)}</td>
                        <td style={{ color: "var(--muted)" }}>{fmtN(cpaTargetOf(c.channel))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 매체별 목표 대비 성과 (잘함 ↑ / 미흡 ↓) */}
          <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 5", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">매체별 CPA 목표 대비 · 낮을수록(▼) 효율 좋음 (위 = 잘함)</span>
            <div className="tbl-scroll" style={{ marginTop: 8 }}>
              <table className="mtable">
                <thead><tr><th>매체</th><th>CPA 목표 대비</th></tr></thead>
                <tbody>
                  {evalRows.map((r) => (
                    <tr key={r.channel}>
                      <td style={{ fontWeight: 700 }}>{r.channel}</td>
                      <td style={{ color: signalColor(-r.cpaVs), fontWeight: 700 }}>{r.cpaVs >= 0 ? "+" : ""}{r.cpaVs.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ===== 단계 선택: 매체별 분석 ===== */
        <div className="bento">
          <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">매체별 {gLab} 수 · ◆ = 매체 목표</span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={countBar} height={290} /></div>
          </div>
          <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">매체별 {gLab}당 비용</span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={unitBar} height={290} /></div>
          </div>
          <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 5", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">매체 성과표 · {stage.lab} 단계</span>
            <div className="tbl-scroll" style={{ marginTop: 8 }}>
              <table className="mtable">
                <thead><tr><th>매체</th><th>광고비</th><th>{stage.lab} 수</th><th>목표</th><th>달성</th><th>{stage.lab}당 비용</th><th>달성순위</th><th>비중</th><th>직전 전환율</th></tr></thead>
                <tbody>
                  {stageRows.map((r) => (
                    <tr key={r.c.channel}>
                      <td style={{ fontWeight: 700 }}>{r.c.channel}</td>
                      <td>{fmtMan(r.c.spend)}</td>
                      <td><b>{fmtN(r.cnt)}</b></td>
                      <td style={{ color: "var(--muted)" }}>{r.target != null ? fmtN(r.target) : "—"}</td>
                      <td style={{ color: r.ach == null ? "var(--muted2)" : signalColor(r.ach - 100), fontWeight: 800 }}>{r.ach == null ? "—" : r.ach.toFixed(0) + "%"}</td>
                      <td>{fmtN(r.unit)}원</td>
                      <td style={{ color: r.achRank === 1 ? "var(--amber)" : "var(--muted)", fontWeight: r.achRank === 1 ? 800 : 600 }}>{r.achRank != null ? r.achRank + "위" : "—"}</td>
                      <td style={{ color: "var(--muted)" }}>{r.share.toFixed(1)}%</td>
                      <td style={{ color: r.conv != null ? "var(--ink)" : "var(--muted2)" }}>{r.conv != null ? r.conv.toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
            <span className="tile-label">예산 비중 vs {gLab} 기여 비중 · 쓴 예산 대비 성과 효율</span>
            <div style={{ flex: 1, marginTop: 6 }}><EChart option={shareBar} height={250} /></div>
          </div>
        </div>
      )}
    </>
  );
}
