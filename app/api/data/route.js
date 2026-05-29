import { NextResponse } from "next/server";
import { buildFromRows, DEFAULT_DATA } from "@/lib/data";

// 구글시트(웹에 게시한 CSV)를 서버에서 읽어 모든 방문자에게 공유.
// 5분마다 시트를 다시 조회 → 시트 수정 시 전체 반영.
export const revalidate = 300;

function parseCSV(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim().length);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^﻿/, ""));
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const o = {};
    headers.forEach((h, i) => { o[h] = (cells[i] ?? "").trim(); });
    return o;
  });
}

export async function GET() {
  const url = process.env.SHEET_CSV_URL;
  // 시트 URL 미설정 → 더미 데이터로 동작
  if (!url) {
    return NextResponse.json({ channels: DEFAULT_DATA.channels, daily: DEFAULT_DATA.daily, source: "dummy" });
  }
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("sheet fetch " + res.status);
    const text = await res.text();
    const rows = parseCSV(text);
    const built = buildFromRows(rows);
    if (!built.channels.length) throw new Error("채널 데이터를 찾지 못함 (컬럼명 확인)");
    return NextResponse.json({
      channels: built.channels,
      daily: built.daily.length ? built.daily : DEFAULT_DATA.daily,
      source: "sheet",
    });
  } catch (e) {
    return NextResponse.json({ channels: DEFAULT_DATA.channels, daily: DEFAULT_DATA.daily, source: "dummy", error: String(e) });
  }
}
