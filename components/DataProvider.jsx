"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { DEFAULT_DATA, parseFile } from "@/lib/data";

const Ctx = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [src, setSrc] = useState("더미데이터 (내장)");
  const [ok, setOk] = useState(null); // true | false | null

  const loadFile = useCallback(async (file) => {
    try {
      const built = await parseFile(file);
      if (!built.channels.length) throw new Error("채널 데이터를 찾지 못했습니다 (컬럼명 확인)");
      setData({
        ...DEFAULT_DATA,
        channels: built.channels,
        daily: built.daily.length ? built.daily : DEFAULT_DATA.daily,
      });
      setSrc(`${file.name} · ${built.channels.length}개 매체 · ${built.daily.length}일`);
      setOk(true);
    } catch (err) {
      setSrc(`불러오기 실패: ${err.message}`);
      setOk(false);
    }
  }, []);

  // 마운트 시 구글시트(서버 API) 데이터 자동 로드 → URL 가진 모든 사람에게 공유 반영
  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.channels) && d.channels.length) {
          setData({ ...DEFAULT_DATA, channels: d.channels, daily: d.daily && d.daily.length ? d.daily : DEFAULT_DATA.daily });
          if (d.source === "sheet") { setSrc("구글시트 연동 · 공유 데이터"); setOk(true); }
        }
      })
      .catch(() => {});
  }, []);

  return <Ctx.Provider value={{ data, src, ok, loadFile }}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useData must be used within DataProvider");
  return v;
}
