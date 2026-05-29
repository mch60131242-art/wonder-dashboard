import "./globals.css";
import { DataProvider } from "@/components/DataProvider";
import Nav from "@/components/Nav";

export const metadata = {
  title: "WONDER 마케팅 대시보드",
  description: "보험설계사 위촉 리드젠 마케팅 대시보드",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <DataProvider>
          <div className="wrap">
            <Nav />
            {children}
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
