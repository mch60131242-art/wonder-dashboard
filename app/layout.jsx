import "./globals.css";
import { DataProvider } from "@/components/DataProvider";
import Nav from "@/components/Nav";

export const metadata = {
  title: "WONDER",
  description: "WONDER 대시보드",
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
