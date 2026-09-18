import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Cormorant_Garamond } from "next/font/google";
import { TarotFlowProvider } from "@/context/TarotFlowContext";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "루나 타로",
  description: "마음속 질문에 조용히 답을 건네는 타로 리딩 프로토타입",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#150f2e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${cormorant.variable}`}>
      <body>
        <TarotFlowProvider>{children}</TarotFlowProvider>
      </body>
    </html>
  );
}
