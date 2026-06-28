"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

// 참가자 접속 URL 을 QR 로 표시. 발표 화면에서 크게 보이도록 흰 카드 위에 배치.
export default function QRDisplay({
  url,
  size = 280,
  downloadable = true,
}: {
  url: string;
  size?: number;
  downloadable?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "survey-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={wrapRef}
        className="rounded-xl2 bg-white p-4 shadow-lg ring-1 ring-black/5"
      >
        <QRCodeCanvas
          value={url}
          size={size}
          level="M"
          marginSize={1}
          fgColor="#0E1E44"
          bgColor="#ffffff"
        />
      </div>
      {downloadable && (
        <button
          onClick={download}
          className="text-xs font-medium text-white/70 underline-offset-4 hover:underline"
        >
          QR 이미지 다운로드
        </button>
      )}
    </div>
  );
}
