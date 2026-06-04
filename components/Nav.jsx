"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "./DataProvider";

const TABS = [
  { href: "/", no: "①", name: "핵심 KPI" },
  { href: "/trend", no: "②", name: "추이" },
  { href: "/compare", no: "③", name: "월별 추이 비교" },
  { href: "/funnel", no: "④", name: "퍼널 흐름" },
  { href: "/media", no: "⑤", name: "매체별 성과·예산" },
  { href: "/best", no: "⑥", name: "채널" },
];

export default function Nav() {
  const path = usePathname();
  const { src, ok, loadFile } = useData();

  return (
    <div className="topbar">
      <div className="brand">
        <span className="logo">WONDER</span>
      </div>

      <nav className="nav">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={path === t.href ? "active" : ""}>
            {t.no} {t.name}
          </Link>
        ))}
      </nav>

      <div className="rightbar">
        <label className="fileBtn">
          📂 엑셀/CSV 불러오기
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => { if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]); }}
          />
        </label>
        <span className={"src " + (ok === true ? "src-ok" : ok === false ? "src-err" : "")}>{src}</span>
      </div>
    </div>
  );
}
