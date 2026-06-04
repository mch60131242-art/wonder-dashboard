"use client";
import { useMemo } from "react";
import EChart from "@/components/EChart";
import { useData } from "@/components/DataProvider";
import { funnelStages, totals, fmtN, signalColor } from "@/lib/data";
import { TIP } from "@/lib/chart";

export default function FunnelPage() {
  const { data } = useData();
  const stages = useMemo(() => funnelStages(data.channels), [data.channels]);
  const t = useMemo(() => totals(data.channels), [data.channels]);

  const seg = useMemo(() => {
    const r = stages.slice(1).map((s, i) => {
      const prev = stages[i].value;
      return { seg: `${stages[i].stage} → ${s.stage}`, prev, cur: s.value, conv: s.conv, bm: s.bm, drop: prev - s.value, leak: 1 - s.conv };
    });
    let mi = 0; r.forEach((x, i) => { if (x.drop > r[mi].drop) mi = i; });
    return { list: r, maxIdx: mi };
  }, [stages]);

  const funnelOption = useMemo(() => ({
    tooltip: { trigger: "item", ...TIP, formatter: (p) => { const s = stages[p.dataIndex]; return `<b>${s.stage}</b><br/>건수: ${fmtN(s.value)}` + (s.conv != null ? `<br/>전환율: ${(s.conv * 100).toFixed(1)}%` : ""); } },
    series: [{
      type: "funnel", top: 8, bottom: 8, left: "6%", right: "6%", minSize: "26%", maxSize: "100%", sort: "none", gap: 3, funnelAlign: "center",
      color: ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#cffafe"],
      label: { position: "inside", color: "#062c2a", fontSize: 12, fontWeight: 700, formatter: (p) => { const s = stages[p.dataIndex]; return s.conv == null ? `${s.stage}  ${fmtN(s.value)}` : `${s.stage}  ${(s.conv * 100).toFixed(1)}% / ${fmtN(s.value)}`; } },
      itemStyle: { borderWidth: 0 }, data: stages.map((s) => ({ value: s.value, name: s.stage })),
    }],
  }), [stages]);

  const convOption = useMemo(() => {
    const tr = stages.slice(1).map((s, i) => ({ label: stages[i].stage + "→" + s.stage, act: +(s.conv * 100).toFixed(1), tgt: s.bm ? +(s.bm * 100).toFixed(0) : null }));
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, ...TIP, valueFormatter: (v) => v + "%" },
      legend: { data: ["실측 전환율", "목표"], top: 0, right: 0, itemWidth: 12, itemHeight: 8, textStyle: { fontSize: 11, color: "#9aa3b2" } },
      grid: { left: 6, right: 14, top: 30, bottom: 6, containLabel: true },
      xAxis: { type: "value", max: 70, axisLabel: { color: "#7a8494", fontSize: 10, formatter: "{value}%" } },
      yAxis: { type: "category", inverse: true, data: tr.map((x) => x.label), axisLabel: { color: "#cdd5e2", fontSize: 11 } },
      series: [
        { name: "실측 전환율", type: "bar", data: tr.map((x) => x.act), barWidth: 11, itemStyle: { color: "#5b9dff", borderRadius: [0, 4, 4, 0] }, label: { show: true, position: "right", formatter: "{c}%", fontSize: 10, color: "#cdd5e2" } },
        { name: "목표", type: "bar", data: tr.map((x) => x.tgt), barWidth: 5, itemStyle: { color: "#ffd27a", borderRadius: [0, 3, 3, 0] } },
      ],
    };
  }, [stages]);

  return (
    <div className="bento">
      <div className="tile hero" style={{ gridColumn: "span 7", gridRow: "span 6", display: "flex", flexDirection: "column" }}>
        <div className="h-top"><span className="tile-label">리드젠 퍼널 · 유입 → 위촉</span><span className="h-badge">전체 전환 {(t.appts / t.clicks * 100).toFixed(2)}%</span></div>
        <div style={{ flex: 1 }}><EChart option={funnelOption} height={340} /></div>
      </div>

      <div className="tile" style={{ gridColumn: "span 5", gridRow: "span 6", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">전체 퍼널 구간 · 유입 · 전환 · 전환율 · 목표 · 이탈 (구간별)</span>
        <div className="tbl-scroll" style={{ marginTop: 8 }}>
          <table className="mtable">
            <thead><tr><th>구간</th><th>유입수</th><th>전환수</th><th>전환율</th><th>목표</th><th>이탈수</th><th>이탈률</th></tr></thead>
            <tbody>
              {seg.list.map((r, i) => (
                <tr key={r.seg} style={i === seg.maxIdx ? { background: "rgba(255,123,123,.10)" } : undefined}>
                  <td style={{ fontWeight: 700 }}>{r.seg}{i === seg.maxIdx ? " ⚠" : ""}</td>
                  <td>{fmtN(r.prev)}</td>
                  <td>{fmtN(r.cur)}</td>
                  <td style={{ fontWeight: 700, color: r.bm == null ? "var(--ink)" : signalColor(r.conv - r.bm) }}>{(r.conv * 100).toFixed(1)}%</td>
                  <td style={{ color: "var(--muted)" }}>{r.bm != null ? (r.bm * 100).toFixed(0) + "%" : "—"}</td>
                  <td style={{ color: "#e0a0a0" }}>{fmtN(r.drop)}</td>
                  <td style={{ color: "#ff8989", fontWeight: 700 }}>{(r.leak * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="k-sub" style={{ marginTop: "auto", color: "var(--muted2)" }}>⚠ = 최대 이탈 구간 · 전환율 색 = 목표 대비(상승 빨강 / 하락 파랑)</div>
      </div>

      <div className="tile" style={{ gridColumn: "span 7", gridRow: "span 4", display: "flex", flexDirection: "column" }}>
        <span className="tile-label">단계별 전환율 vs 목표</span>
        <div style={{ flex: 1, marginTop: 6 }}><EChart option={convOption} height={230} /></div>
      </div>

      <div className="tile" style={{ gridColumn: "span 5", gridRow: "span 4", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span className="tile-label">합격 · 활동유지 · 목표 달성</span>
        {[
          { lab: "합격", val: t.passes, tg: data.targets.qualification, rate: t.exams ? t.passes / t.exams * 100 : 0, rlab: "합격률(응시→합격)", acc: "#7fd3ff" },
          { lab: "활동유지", val: t.retained, tg: data.targets.retention, rate: t.appts ? t.retained / t.appts * 100 : 0, rlab: "유지율(위촉→유지)", acc: "#42d693" },
        ].map((q) => (
          <div key={q.lab} style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{q.lab} <span style={{ color: "var(--muted)", fontSize: 11, fontWeight: 600 }}>· {q.rlab} {q.rate.toFixed(1)}%</span></span>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{fmtN(q.val)} <span style={{ color: "var(--muted2)", fontSize: 11, fontWeight: 600 }}>/ 목표 {fmtN(q.tg)}</span></span>
            </div>
            <div className="k-bar" style={{ marginTop: 7 }}><i style={{ width: Math.min(q.val / q.tg * 100, 100) + "%", background: q.acc }} /></div>
            <div className="k-sub" style={{ marginTop: 4 }}>달성률 {(q.val / q.tg * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
