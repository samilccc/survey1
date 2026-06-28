import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "복지일까, 투자일까 — 실시간 서베이",
  description:
    "IT·게임업계의 출산·육아 복지 트렌드를 통해 보는 조직문화와 리텐션의 변화. 대화 촉진형 실시간 관점 서베이.",
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
