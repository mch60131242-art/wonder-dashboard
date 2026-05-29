"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { totals, fmtN, fmtMan, colorOf } from "@/lib/data";
import { TIP, SPLIT, LBL } from "@/lib/chart";

export default function MediaPage() {
  const { data } = useData();
  const { channels, targets } = data;
  const t = useMemo(() => totals(channels), [channels]);
  const rows = useMemo(() => [...channels].sort((a, b) => b.db - a.db), [channels]);

  const dbBar = useMemo(() => {
    const s = [...channels].sort((a, b) => a.db - b.db);
    return {
      grid: { left: 6, right: 38, top: 8, bottom: 6, containLabel: true }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP },
      xAxis: { type: "value", show: false, max: Math.max(...channels.map((c) => c.db)) * 1.18 },
      yAxis: { type: "category", data: s.map((c) => c.channel), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#cdd5e2", fontSize: 11 } },
      series: [{ type: "bar", barWidth: "60%", data: s.map((c, i) => ({ value: c.db, itemStyle: { color: colorOf(c.channel, i), borderRadius: [0, 6, 6, 0] } })), label: { show: true, position: "right", color: "#aeb6c4", fontSize: 10.5, fontWeight: 700, formatter: "{c}" } }],
    };
  }, [channels]);

  const cpaBar = useMemo(() => {
    const s = [...channels].sort((a, b) => a.db_cpa - b.db_cpa);
    return {
      grid: { left: 6, right: 46, top: 22, bottom: 6, containLabel: true }, tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => fmtN(v) + "원" },
      xAxis: { type: "value", axisLabel: { ...LBL, formatter: (v) => fmtMan(v) }, splitLine: SPLIT },
      yAxis: { type: "category", data: s.map((c) => c.channel), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#cdd5e2", fontSize: 11 } },
      series: [{
        type: "bar", barWidth: "60%", data: s.map((c) => ({ value: c.db_cpa, itemStyle: { color: c.db_cpa <= targets.db_cpa ? "#42d693" : "#ff7b7b", borderRadius: [0, 6, 6, 0] } })),
        label: { show: true, position: "right", color: "#aeb6c4", fontSize: 10.5, fontWeight: 700, formatter: (p) => fmtMan(p.value) },
        markLine: { symbol: "none", data: [{ xAxis: targets.db_cpa }], lineStyle: { color: "#ffd27a", type: "dashed", width: 1.5 }, label: { formatter: "목표 15만", fontSize: 10, color: "#ffd27a", position: "end" } },
      }],
    };
  }, [channels, targets]);

  const shareBar = useMemo(() => {
    const s = [...channels].sort((a, b) => b.db - a.db);
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => v + "%" },
      legend: { data: ["예산 비중", "DB 기여 비중"], top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 11, color: "#9aa3b2" } },
      grid: { left: 6, right: 14, top: 30, bottom: 6, containLabel: true },
      xAxis: { type: "category", data: s.map((c) => c.channel), axisLabel: { ...LBL, interval: 0 } },
      yAxis: { type: "value", axisLabel: { ...LBL, formatter: "{value}%" }, splitLine: SPLIT },
      series: [
        { name: "예산 비중", type: "bar", barWidth: "30%", data: s.map((c) => +(c.spend / t.spend * 100).toFixed(1)), itemStyle: { color: "#7a6fd6", borderRadius: [4, 4, 0, 0] } },
        { name: "DB 기여 비중", type: "bar", barWidth: "30%", data: s.map((c) => +(c.db / t.db * 100).toFixed(1)), itemStyle: { color: "#5b9dff", borderRadius: [4, 4, 0, 0] } },
      ],
    };
  }, [channels, t]);

  return (
    <div className="bento">
      <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">매체 성과 종합표 · DB CPA 15만 초과 = 빨강</span>
        <div className="tbl-scroll" style={{ marginTop: 8 }}>
          <table className="mtable">
            <thead><tr><th>매체</th><th>소진액</th><th>시험신청 DB</th><th>DB CPA</th><th>위촉</th><th>활동유지</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.channel}>
                  <td style={{ fontWeight: 700 }}>{c.channel}</td>
                  <td>{fmtMan(c.spend)}</td>
                  <td><b>{fmtN(c.db)}</b></td>
                  <td className={c.db_cpa <= targets.db_cpa ? "good" : "bad"}>{fmtN(c.db_cpa)}</td>
                  <td>{fmtN(c.appts)}</td>
                  <td>{fmtN(c.retained)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">매체별 시험신청 DB (내림차순)</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={dbBar} height={290} /></div>
      </div>
      <div className="tile" style={{ gridColumn: "span 6", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">매체별 DB CPA · 목표선 15만</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={cpaBar} height={290} /></div>
      </div>

      <div className="tile" style={{ gridColumn: "span 12", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">예산 비중 vs DB 기여 비중</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={shareBar} height={250} /></div>
      </div>
    </div>
  );
}
