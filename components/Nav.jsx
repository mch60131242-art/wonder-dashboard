"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useData } from "./DataProvider";

const TABS = [
  { href: "/", no: "①", name: "핵심 KPI" },
  { href: "/funnel", no: "②", name: "퍼널 흐름" },
  { href: "/media", no: "③", name: "매체별 성과·예산" },
  { href: "/best", no: "④", name: "우수 채널" },
  { href: "/trend", no: "⑤", name: "추이" },
];

export default function Nav() {
  const path = usePathname();
  const { src, ok, loadFile } = useData();

  return (
    <div className="topbar">
      <div className="brand">
        <span className="logo">WONDER</span>
        <span className="sub">보험설계사 위촉 · 리드젠 마케팅 대시보드</span>
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
