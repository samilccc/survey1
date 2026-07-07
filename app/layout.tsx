import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리의 시간, 다시 디자인하다 — 실시간 서베이",
  description:
    "우리 팀의 미팅과 몰입 시간을 ‘더 적은 부담 · 더 큰 가치’로 함께 설계하는 대화 촉진형 실시간 서베이.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0E1E44",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-mist text-ink antialiased">{children}</body>
    </html>
  );
}
