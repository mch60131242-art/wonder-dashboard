// ===== WONDER 대시보드 데이터 레이어 =====
export const TARGETS = {
  db: 2300, db_cpa: 150000, budget: 400000000,
  app_install: 25000, qualification: 600, retention: 300,
};

export const CH_COLORS = {
  "구글AC": "#2563eb", "틱톡": "#0ea5e9", "당근": "#f59e0b", "몰로코": "#7c3aed",
  "메타": "#3b82f6", "nCPA": "#ec4899", "네이버SA": "#16a34a", "네이버DA": "#14b8a6", "구글SA": "#6366f1",
};
const PALETTE = ["#5b9dff", "#0ea5e9", "#f59e0b", "#7c3aed", "#3b82f6", "#ec4899", "#16a34a", "#14b8a6", "#6366f1", "#ef4444", "#84cc16", "#a855f7"];
export function colorOf(ch, i = 0) {
  return CH_COLORS[ch] || PALETTE[i % PALETTE.length];
}

const CH_META = {
  "구글AC": ["글로벌", "해외"], "틱톡": ["글로벌", "해외"], "당근": ["국내", "국내"],
  "몰로코": ["글로벌", "해외"], "메타": ["글로벌", "해외"], "nCPA": ["국내", "국내"],
  "네이버SA": ["국내", "국내"], "네이버DA": ["국내", "국내"], "구글SA": ["글로벌", "해외"],
};

// ===== 기본(더미) 데이터 =====
export const DEFAULT_CHANNELS = [
  { channel: "구글AC", group: "글로벌", country: "해외", spend: 81840000, impressions: 1553667, clicks: 13983, installs: 5873, signups: 1938, db: 620, exams: 341, passes: 177, appts: 120, retained: 98, db_cpa: 132000, appt_cpa: 682000, ctr: 0.9, cpc: 5853, cvr: 4.43, take_rate: 55.0, appt_rate: 19.4, retain_rate: 81.7 },
  { channel: "틱톡", group: "글로벌", country: "해외", spend: 68150000, impressions: 1088167, clicks: 13058, installs: 5223, signups: 1567, db: 470, exams: 235, passes: 118, appts: 74, retained: 56, db_cpa: 145000, appt_cpa: 920946, ctr: 1.2, cpc: 5219, cvr: 3.6, take_rate: 50.0, appt_rate: 15.7, retain_rate: 75.7 },
  { channel: "당근", group: "국내", country: "국내", spend: 40920000, impressions: 464000, clicks: 6960, installs: 3132, signups: 1065, db: 330, exams: 175, passes: 89, appts: 59, retained: 47, db_cpa: 124000, appt_cpa: 693559, ctr: 1.5, cpc: 5879, cvr: 4.74, take_rate: 53.0, appt_rate: 17.9, retain_rate: 79.7 },
  { channel: "몰로코", group: "글로벌", country: "해외", spend: 39000000, impressions: 1160500, clicks: 6963, installs: 2646, signups: 741, db: 200, exams: 90, passes: 43, appts: 25, retained: 18, db_cpa: 195000, appt_cpa: 1560000, ctr: 0.6, cpc: 5601, cvr: 2.87, take_rate: 45.0, appt_rate: 12.5, retain_rate: 72.0 },
  { channel: "메타", group: "글로벌", country: "해외", spend: 39775000, impressions: 732500, clicks: 7325, installs: 2637, signups: 712, db: 185, exams: 81, passes: 38, appts: 21, retained: 14, db_cpa: 215000, appt_cpa: 1894048, ctr: 1.0, cpc: 5430, cvr: 2.53, take_rate: 43.8, appt_rate: 11.4, retain_rate: 66.7 },
  { channel: "nCPA", group: "국내", country: "국내", spend: 35250000, impressions: 969714, clicks: 6788, installs: 2308, signups: 600, db: 150, exams: 63, passes: 29, appts: 16, retained: 11, db_cpa: 235000, appt_cpa: 2203125, ctr: 0.7, cpc: 5193, cvr: 2.21, take_rate: 42.0, appt_rate: 10.7, retain_rate: 68.8 },
  { channel: "네이버SA", group: "국내", country: "국내", spend: 17575000, impressions: 60956, clicks: 2743, installs: 823, signups: 288, db: 95, exams: 55, passes: 30, appts: 21, retained: 18, db_cpa: 185000, appt_cpa: 836905, ctr: 4.5, cpc: 6407, cvr: 3.46, take_rate: 57.9, appt_rate: 22.1, retain_rate: 85.7 },
  { channel: "네이버DA", group: "국내", country: "국내", spend: 14700000, impressions: 518800, clicks: 2594, installs: 856, signups: 231, db: 60, exams: 28, passes: 13, appts: 7, retained: 5, db_cpa: 245000, appt_cpa: 2100000, ctr: 0.5, cpc: 5667, cvr: 2.31, take_rate: 46.7, appt_rate: 11.7, retain_rate: 71.4 },
  { channel: "구글SA", group: "글로벌", country: "해외", spend: 6720000, impressions: 27680, clicks: 1384, installs: 429, signups: 133, db: 40, exams: 21, passes: 11, appts: 7, retained: 5, db_cpa: 168000, appt_cpa: 960000, ctr: 5.0, cpc: 4855, cvr: 2.89, take_rate: 52.5, appt_rate: 17.5, retain_rate: 71.4 },
];

export const DEFAULT_DAILY = [
  { date: "2026-05-01", clicks: 2354, installs: 914, signups: 279, db: 85, exams: 43, passes: 26, appts: 17, retained: 14, spend: 13084295, db_cpa: 153933 },
  { date: "2026-05-02", clicks: 1902, installs: 737, signups: 224, db: 65, exams: 35, passes: 16, appts: 11, retained: 6, spend: 10592050, db_cpa: 162955 },
  { date: "2026-05-03", clicks: 1790, installs: 695, signups: 210, db: 64, exams: 33, passes: 15, appts: 8, retained: 6, spend: 9968987, db_cpa: 155765 },
  { date: "2026-05-04", clicks: 2354, installs: 914, signups: 278, db: 85, exams: 43, passes: 25, appts: 17, retained: 14, spend: 13084295, db_cpa: 153933 },
  { date: "2026-05-05", clicks: 2354, installs: 914, signups: 278, db: 85, exams: 43, passes: 24, appts: 17, retained: 14, spend: 13084295, db_cpa: 153933 },
  { date: "2026-05-06", clicks: 2353, installs: 913, signups: 278, db: 85, exams: 43, passes: 24, appts: 16, retained: 14, spend: 13084295, db_cpa: 153933 },
  { date: "2026-05-07", clicks: 2352, installs: 913, signups: 278, db: 84, exams: 43, passes: 24, appts: 16, retained: 14, spend: 13084293, db_cpa: 155765 },
  { date: "2026-05-08", clicks: 2352, installs: 911, signups: 278, db: 84, exams: 43, passes: 23, appts: 16, retained: 12, spend: 13084293, db_cpa: 155765 },
  { date: "2026-05-09", clicks: 1902, installs: 737, signups: 223, db: 65, exams: 33, passes: 16, appts: 9, retained: 6, spend: 10592050, db_cpa: 162955 },
  { date: "2026-05-10", clicks: 1790, installs: 695, signups: 210, db: 63, exams: 32, passes: 15, appts: 7, retained: 6, spend: 9968987, db_cpa: 158238 },
  { date: "2026-05-11", clicks: 2352, installs: 911, signups: 278, db: 84, exams: 42, passes: 23, appts: 16, retained: 12, spend: 13084293, db_cpa: 155765 },
  { date: "2026-05-12", clicks: 2352, installs: 911, signups: 278, db: 84, exams: 41, passes: 23, appts: 14, retained: 12, spend: 13084293, db_cpa: 155765 },
  { date: "2026-05-13", clicks: 2352, installs: 911, signups: 278, db: 84, exams: 41, passes: 23, appts: 14, retained: 12, spend: 13084293, db_cpa: 155765 },
  { date: "2026-05-14", clicks: 2352, installs: 910, signups: 277, db: 84, exams: 41, passes: 23, appts: 14, retained: 12, spend: 13084293, db_cpa: 155765 },
  { date: "2026-05-15", clicks: 2352, installs: 910, signups: 277, db: 83, exams: 41, passes: 21, appts: 14, retained: 12, spend: 13084293, db_cpa: 157642 },
  { date: "2026-05-16", clicks: 1902, installs: 737, signups: 223, db: 65, exams: 33, passes: 16, appts: 9, retained: 6, spend: 10592050, db_cpa: 162955 },
  { date: "2026-05-17", clicks: 1790, installs: 695, signups: 210, db: 62, exams: 32, passes: 15, appts: 7, retained: 6, spend: 9968987, db_cpa: 160790 },
  { date: "2026-05-18", clicks: 2352, installs: 910, signups: 277, db: 82, exams: 41, passes: 20, appts: 14, retained: 11, spend: 13084293, db_cpa: 159565 },
  { date: "2026-05-19", clicks: 2352, installs: 909, signups: 277, db: 79, exams: 41, passes: 20, appts: 13, retained: 11, spend: 13084291, db_cpa: 165624 },
  { date: "2026-05-20", clicks: 2352, installs: 909, signups: 277, db: 79, exams: 41, passes: 19, appts: 13, retained: 11, spend: 13084291, db_cpa: 165624 },
  { date: "2026-05-21", clicks: 2351, installs: 908, signups: 277, db: 79, exams: 41, passes: 19, appts: 13, retained: 9, spend: 13084291, db_cpa: 165624 },
  { date: "2026-05-22", clicks: 2351, installs: 907, signups: 276, db: 79, exams: 40, passes: 18, appts: 13, retained: 9, spend: 13084291, db_cpa: 165624 },
  { date: "2026-05-23", clicks: 1901, installs: 737, signups: 223, db: 65, exams: 33, passes: 16, appts: 9, retained: 6, spend: 10592050, db_cpa: 162955 },
  { date: "2026-05-24", clicks: 1789, installs: 695, signups: 210, db: 62, exams: 30, passes: 15, appts: 7, retained: 6, spend: 9968987, db_cpa: 160790 },
  { date: "2026-05-25", clicks: 2350, installs: 906, signups: 276, db: 79, exams: 40, passes: 18, appts: 12, retained: 9, spend: 13084291, db_cpa: 165624 },
  { date: "2026-05-26", clicks: 2349, installs: 906, signups: 276, db: 79, exams: 40, passes: 17, appts: 12, retained: 9, spend: 13084291, db_cpa: 165624 },
  { date: "2026-05-27", clicks: 2348, installs: 906, signups: 275, db: 78, exams: 40, passes: 17, appts: 11, retained: 7, spend: 13084291, db_cpa: 167747 },
  { date: "2026-05-28", clicks: 2348, installs: 906, signups: 274, db: 78, exams: 40, passes: 17, appts: 11, retained: 6, spend: 13084291, db_cpa: 167747 },
];

export const DEFAULT_DATA = { channels: DEFAULT_CHANNELS, daily: DEFAULT_DAILY, targets: TARGETS };

// ===== 포맷 =====
export const fmtN = (n) => Math.round(n || 0).toLocaleString("ko-KR");
export const fmtMan = (n) => (n / 10000).toLocaleString("ko-KR", { maximumFractionDigits: 1 }) + "만";
export const fmtEok = (n) => (n / 1e8).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "억";

// ===== 집계 헬퍼 =====
export function totals(channels) {
  const s = (k) => channels.reduce((a, c) => a + (c[k] || 0), 0);
  const db = s("db"), spend = s("spend"), appts = s("appts");
  return {
    clicks: s("clicks"), installs: s("installs"), signups: s("signups"), db, exams: s("exams"),
    passes: s("passes"), appts, retained: s("retained"), spend,
    db_cpa: db ? Math.round(spend / db) : 0,
  };
}

// 퍼널 단계 (유입→위촉) + 직전 대비 전환율
export function funnelStages(channels) {
  const t = totals(channels);
  const raw = [
    { stage: "유입", value: t.clicks, bm: null },
    { stage: "앱설치", value: t.installs, bm: 0.4 },
    { stage: "회원가입", value: t.signups, bm: 0.3 },
    { stage: "시험신청", value: t.db, bm: 0.3 },
    { stage: "응시", value: t.exams, bm: 0.5 },
    { stage: "합격", value: t.passes, bm: 0.5 },
    { stage: "위촉", value: t.appts, bm: 0.65 },
  ];
  return raw.map((s, i) => ({ ...s, conv: i === 0 ? null : (raw[i - 1].value ? s.value / raw[i - 1].value : 0) }));
}

// 전일(마지막날) 대비 증감 — daily 기반
export function dod(daily, key) {
  if (!daily || daily.length < 2) return null;
  const cur = daily[daily.length - 1][key];
  const prev = daily[daily.length - 2][key];
  if (prev == null || prev === 0) return null;
  return (cur - prev) / prev * 100;
}

// ===== 엑셀/CSV → 집계 =====
const num = (v) => { const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; };
function dstr(v) {
  if (v instanceof Date) { const m = ("0" + (v.getMonth() + 1)).slice(-2), d = ("0" + v.getDate()).slice(-2); return v.getFullYear() + "-" + m + "-" + d; }
  if (typeof v === "number") { const dt = new Date(Math.round((v - 25569) * 86400 * 1000)); const m = ("0" + (dt.getUTCMonth() + 1)).slice(-2), d = ("0" + dt.getUTCDate()).slice(-2); return dt.getUTCFullYear() + "-" + m + "-" + d; }
  return String(v).trim();
}
function nkey(row) { const o = {}; for (const k in row) o[String(k).replace(/^﻿/, "").trim()] = row[k]; return o; }

export function buildFromRows(rawRows) {
  const COL = { spend: "spend", impressions: "impressions", clicks: "clicks", installs: "app_installs", signups: "signups", db: "exam_applications", exams: "exams_taken", passes: "passes", appts: "appointments", retained: "active_retained" };
  const rows = (rawRows || []).map(nkey);
  const byCh = {};
  rows.forEach((r) => {
    const ch = String(r.channel || "").trim(); if (!ch) return;
    const e = byCh[ch] || (byCh[ch] = { spend: 0, impressions: 0, clicks: 0, installs: 0, signups: 0, db: 0, exams: 0, passes: 0, appts: 0, retained: 0 });
    for (const k in COL) e[k] += num(r[COL[k]]);
  });
  const channels = Object.keys(byCh).map((ch) => {
    const e = byCh[ch], m = CH_META[ch] || ["글로벌", "해외"];
    return {
      channel: ch, group: m[0], country: m[1],
      spend: e.spend, impressions: e.impressions, clicks: e.clicks, installs: e.installs, signups: e.signups,
      db: e.db, exams: e.exams, passes: e.passes, appts: e.appts, retained: e.retained,
      db_cpa: e.db ? Math.round(e.spend / e.db) : 0, appt_cpa: e.appts ? Math.round(e.spend / e.appts) : 0,
      ctr: e.impressions ? +(e.clicks / e.impressions * 100).toFixed(2) : 0, cpc: e.clicks ? Math.round(e.spend / e.clicks) : 0,
      cvr: e.clicks ? +(e.db / e.clicks * 100).toFixed(2) : 0, take_rate: e.db ? +(e.exams / e.db * 100).toFixed(1) : 0,
      appt_rate: e.db ? +(e.appts / e.db * 100).toFixed(1) : 0, retain_rate: e.appts ? +(e.retained / e.appts * 100).toFixed(1) : 0,
    };
  });
  const byDate = {};
  rows.forEach((r) => {
    const d = dstr(r.date); if (!d || d === "undefined") return;
    const e = byDate[d] || (byDate[d] = { clicks: 0, installs: 0, signups: 0, db: 0, exams: 0, passes: 0, appts: 0, retained: 0, spend: 0 });
    e.clicks += num(r.clicks); e.installs += num(r[COL.installs]); e.signups += num(r.signups);
    e.db += num(r[COL.db]); e.exams += num(r[COL.exams]); e.passes += num(r.passes);
    e.appts += num(r[COL.appts]); e.retained += num(r[COL.retained]); e.spend += num(r.spend);
  });
  const daily = Object.keys(byDate).sort().map((d) => { const e = byDate[d]; return { date: d, ...e, db_cpa: e.db ? Math.round(e.spend / e.db) : 0 }; });
  return { channels, daily };
}

export async function parseFile(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: 0 });
  return buildFromRows(rows);
}
