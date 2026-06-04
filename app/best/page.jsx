"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { fmtN, fmtMan, fmtEok, colorOf, cpaTargetOf } from "@/lib/data";
import { TIP, SPLIT, LBL } from "@/lib/chart";

export default function BestPage() {
  const { data } = useData();
  const { channels, targets } = data;

  const ranks = useMemo(() => {
    const ratio = (c) => c.db_cpa / cpaTargetOf(c.channel);
    const byAbs = [...channels].sort((a, b) => a.db_cpa - b.db_cpa);
    const byRel = [...channels].sort((a, b) => ratio(a) - ratio(b));
    const byQ = [...channels].sort((a, b) => b.appt_rate - a.appt_rate);
    return {
      absBest: byAbs[0], absWorst: byAbs[byAbs.length - 1],
      relBest: byRel[0], relWorst: byRel[byRel.length - 1],
      qBest: byQ[0], qWorst: byQ[byQ.length - 1],
    };
  }, [channels]);

  // 매체별 목표 대비 편차(%) — 음수 = 목표보다 낮음(달성)
  const dev = (c) => { const p = (c.db_cpa / cpaTargetOf(c.channel) - 1) * 100; return (p >= 0 ? "+" : "") + p.toFixed(1) + "%"; };

  const quadOption = useMemo(() => {
    const dbs = channels.map((c) => c.db).sort((a, b) => a - b);
    const median = dbs[Math.floor(dbs.length / 2)] || 0;
    const yMax = Math.max(...channels.map((c) => c.db)) * 1.15;
    const xSplit = targets.db_cpa;
    return {
      grid: { left: 60, right: 22, top: 16, bottom: 42 },
      tooltip: { ...TIP, formatter: (p) => `<b>${p.data.name}</b><br/>DB CPA: ${fmtN(p.value[0])}원<br/>DB: ${fmtN(p.value[1])}건<br/>소진: ${fmtEok(p.value[2])}` },
      xAxis: { type: "value", name: "DB CPA →", nameLocation: "middle", nameGap: 28, nameTextStyle: { color: "#9aa3b2", fontSize: 11 }, min: 110000, max: 260000, axisLine: { lineStyle: { color: "#2a3340" } }, axisLabel: { ...LBL, formatter: (v) => (v / 10000) + "만" }, splitLine: SPLIT },
      yAxis: { type: "value", name: "DB 건수 ↑", nameTextStyle: { color: "#9aa3b2", fontSize: 11 }, min: 0, max: yMax, axisLine: { lineStyle: { color: "#2a3340" } }, axisLabel: LBL, splitLine: SPLIT },
      series: [{
        type: "scatter",
        data: channels.map((c, i) => ({ name: c.channel, value: [c.db_cpa, c.db, c.spend], symbolSize: Math.max(14, Math.sqrt(c.spend) / 260), itemStyle: { color: colorOf(c.channel, i), opacity: 0.85, borderColor: c.db_cpa <= cpaTargetOf(c.channel) ? "#42d693" : "#ff7b7b", borderWidth: 2.5 }, label: { show: true, position: "top", formatter: c.channel, color: "#cdd5e2", fontSize: 10.5, fontWeight: 700 } })),
        markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed" }, data: [
          { xAxis: targets.db_cpa, label: { formatter: "전사 평균 15만", fontSize: 10, color: "#ffd27a" } },
          { yAxis: median, lineStyle: { color: "#5e6b80", type: "dashed" }, label: { formatter: "건수 중앙값", fontSize: 10, color: "#9aa3b2", position: "start" } },
        ] },
        markArea: { silent: true, data: [
          [{ coord: [110000, median], itemStyle: { color: "rgba(66,214,147,.05)" }, label: { show: true, position: "insideTopLeft", color: "#42d693", fontSize: 11, fontWeight: 700, formatter: "✅ 증액 · 저비용·고성과" } }, { coord: [xSplit, yMax] }],
          [{ coord: [xSplit, median], itemStyle: { color: "rgba(255,210,122,.05)" }, label: { show: true, position: "insideTopRight", color: "#ffd27a", fontSize: 11, fontWeight: 700, formatter: "⚙️ 효율개선 · 단가관리" } }, { coord: [260000, yMax] }],
          [{ coord: [110000, 0], itemStyle: { color: "rgba(127,211,255,.04)" }, label: { show: true, position: "insideBottomLeft", color: "#7fd3ff", fontSize: 11, fontWeight: 700, formatter: "🔎 확대 테스트 · 성장여지" } }, { coord: [xSplit, median] }],
          [{ coord: [xSplit, 0], itemStyle: { color: "rgba(255,123,123,.05)" }, label: { show: true, position: "insideBottomRight", color: "#ff7b7b", fontSize: 11, fontWeight: 700, formatter: "⛔ 축소 · 재검토" } }, { coord: [260000, median] }],
        ] },
      }],
    };
  }, [channels, targets]);

  // 채널별 효율·품질 성과표 — 위촉전환율 높은 순 (예산·볼륨은 '매체별 성과·예산' 탭)
  const effRows = useMemo(() => [...channels].sort((a, b) => b.appt_rate - a.appt_rate), [channels]);

  return (
    <div className="bento">
      <div className="tile hero" style={{ gridColumn: "span 8", gridRow: "span 6", display: "flex", flexDirection: "column" }}>
        <div className="h-top"><span className="tile-label">매체 효율 사분면 · DB CPA × DB 건수 (버블=소진액) · 테두리 초록=매체별 목표 이내</span><span className="h-badge">좌상단=증액 · 우하단=축소</span></div>
        <div style={{ flex: 1 }}><EChart option={quadOption} height={360} /></div>
      </div>

      <div style={{ gridColumn: "span 4", gridRow: "span 6", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="tile" style={{ flex: 1.35, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="tile-label">💰 CPA 효율 (DB 1건당)</span>
          <div className="rk-sub">절대 CPA 기준</div>
          <div className="rk best"><span className="bj">▲ 최우수</span><span className="nm">{ranks.absBest.channel}</span><span className="vv">{fmtN(ranks.absBest.db_cpa)}원</span></div>
          <div className="rk worst"><span className="bj">▼ 최하위</span><span className="nm">{ranks.absWorst.channel}</span><span className="vv">{fmtN(ranks.absWorst.db_cpa)}원</span></div>
          <div className="rk-sub">매체별 목표 대비</div>
          <div className="rk best"><span className="bj">▲ 최우수</span><span className="nm">{ranks.relBest.channel}</span><span className="vv">목표대비 {dev(ranks.relBest)}</span></div>
          <div className="rk worst"><span className="bj">▼ 최하위</span><span className="nm">{ranks.relWorst.channel}</span><span className="vv">목표대비 {dev(ranks.relWorst)}</span></div>
        </div>
        <div className="tile" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="tile-label">⭐ 위촉 전환율 (리드 품질)</span>
          <div className="rk best" style={{ marginTop: 10 }}><span className="bj">▲ 최우수</span><span className="nm">{ranks.qBest.channel}</span><span className="vv">{ranks.qBest.appt_rate}%</span></div>
          <div className="rk worst"><span className="bj">▼ 최하위</span><span className="nm">{ranks.qWorst.channel}</span><span className="vv">{ranks.qWorst.appt_rate}%</span></div>
        </div>
      </div>

      <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">채널별 효율·품질 성과표 · 전환율/품질 지표 (소진액·DB·CPA 등 예산·볼륨은 ‘매체별 성과·예산’ 탭)</span>
        <div className="tbl-scroll" style={{ marginTop: 8 }}>
          <table className="mtable">
            <thead>
              <tr>
                <th>채널</th><th>구분</th><th>CTR</th><th>CPC</th><th>CVR<br />클릭→DB</th>
                <th>응시율<br />신청→응시</th><th>위촉전환율<br />DB→위촉</th><th>유지율<br />위촉→유지</th><th>위촉 CPA</th>
              </tr>
            </thead>
            <tbody>
              {effRows.map((c) => (
                <tr key={c.channel}>
                  <td style={{ fontWeight: 700 }}>{c.channel}</td>
                  <td style={{ color: "var(--muted)" }}>{c.group}</td>
                  <td>{c.ctr}%</td>
                  <td>{fmtN(c.cpc)}</td>
                  <td>{c.cvr}%</td>
                  <td>{c.take_rate}%</td>
                  <td><b>{c.appt_rate}%</b></td>
                  <td>{c.retain_rate}%</td>
                  <td>{fmtMan(c.appt_cpa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
