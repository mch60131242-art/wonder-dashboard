"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { fmtN, fmtEok, colorOf } from "@/lib/data";
import { TIP, SPLIT, LBL } from "@/lib/chart";

export default function BestPage() {
  const { data } = useData();
  const { channels, targets } = data;

  const ranks = useMemo(() => {
    const byCpa = [...channels].sort((a, b) => a.db_cpa - b.db_cpa);
    const byQ = [...channels].sort((a, b) => b.appt_rate - a.appt_rate);
    return { cpaBest: byCpa[0], cpaWorst: byCpa[byCpa.length - 1], qBest: byQ[0], qWorst: byQ[byQ.length - 1] };
  }, [channels]);

  const quadOption = useMemo(() => {
    const dbs = channels.map((c) => c.db).sort((a, b) => a - b);
    const median = dbs[Math.floor(dbs.length / 2)] || 0;
    const maxSpend = Math.max(...channels.map((c) => c.spend));
    return {
      grid: { left: 60, right: 22, top: 16, bottom: 42 },
      tooltip: { ...TIP, formatter: (p) => `<b>${p.data.name}</b><br/>DB CPA: ${fmtN(p.value[0])}원<br/>DB: ${fmtN(p.value[1])}건<br/>소진: ${fmtEok(p.value[2])}` },
      xAxis: { type: "value", name: "DB CPA →", nameLocation: "middle", nameGap: 28, nameTextStyle: { color: "#9aa3b2", fontSize: 11 }, min: 110000, max: 260000, axisLine: { lineStyle: { color: "#2a3340" } }, axisLabel: { ...LBL, formatter: (v) => (v / 10000) + "만" }, splitLine: SPLIT },
      yAxis: { type: "value", name: "DB 건수 ↑", nameTextStyle: { color: "#9aa3b2", fontSize: 11 }, min: 0, max: Math.max(...channels.map((c) => c.db)) * 1.15, axisLine: { lineStyle: { color: "#2a3340" } }, axisLabel: LBL, splitLine: SPLIT },
      series: [{
        type: "scatter",
        data: channels.map((c, i) => ({ name: c.channel, value: [c.db_cpa, c.db, c.spend], symbolSize: Math.max(14, Math.sqrt(c.spend) / 260), itemStyle: { color: colorOf(c.channel, i), opacity: 0.85, borderColor: "rgba(255,255,255,.35)", borderWidth: 1 }, label: { show: true, position: "top", formatter: c.channel, color: "#cdd5e2", fontSize: 10.5, fontWeight: 700 } })),
        markLine: { silent: true, symbol: "none", lineStyle: { color: "#ffd27a", type: "dashed" }, data: [
          { xAxis: targets.db_cpa, label: { formatter: "CPA 15만", fontSize: 10, color: "#ffd27a" } },
          { yAxis: median, lineStyle: { color: "#5e6b80", type: "dashed" }, label: { formatter: "건수 중앙값", fontSize: 10, color: "#9aa3b2", position: "start" } },
        ] },
      }],
    };
  }, [channels, targets]);

  return (
    <div className="bento">
      <div className="tile hero" style={{ gridColumn: "span 8", gridRow: "span 6", display: "flex", flexDirection: "column" }}>
        <div className="h-top"><span className="tile-label">매체 효율 사분면 · DB CPA × DB 건수 (버블=소진액)</span><span className="h-badge">좌상단=증액 · 우하단=축소</span></div>
        <div style={{ flex: 1 }}><EChart option={quadOption} height={360} /></div>
      </div>

      <div style={{ gridColumn: "span 4", gridRow: "span 6", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="tile" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="tile-label">💰 CPA 효율 (DB 1건당)</span>
          <div className="rk best" style={{ marginTop: 12 }}><span className="bj">▲ 최우수</span><span className="nm">{ranks.cpaBest.channel}</span><span className="vv">{fmtN(ranks.cpaBest.db_cpa)}원</span></div>
          <div className="rk worst"><span className="bj">▼ 최하위</span><span className="nm">{ranks.cpaWorst.channel}</span><span className="vv">{fmtN(ranks.cpaWorst.db_cpa)}원</span></div>
        </div>
        <div className="tile" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span className="tile-label">⭐ 위촉 전환율 (리드 품질)</span>
          <div className="rk best" style={{ marginTop: 12 }}><span className="bj">▲ 최우수</span><span className="nm">{ranks.qBest.channel}</span><span className="vv">{ranks.qBest.appt_rate}%</span></div>
          <div className="rk worst"><span className="bj">▼ 최하위</span><span className="nm">{ranks.qWorst.channel}</span><span className="vv">{ranks.qWorst.appt_rate}%</span></div>
        </div>
      </div>
    </div>
  );
}
