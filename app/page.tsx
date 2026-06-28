"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_TITLE, SESSION_SUBTITLE } from "@/lib/seed";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createSession() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "세션 생성 실패");
      // 진행자 전용 URL: 추측하기 어려운 admin key 를 쿼리로 전달
      router.push(`/host/${data.sessionId}?key=${data.adminKey}`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="boardroom min-h-screen bg-navy-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-6 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80">
          조직문화 인사이트 세션 · 실시간 관점 서베이
        </span>

        <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
          {SESSION_TITLE}
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
          {SESSION_SUBTITLE}
        </p>

        <div className="mt-12 w-full max-w-md rounded-xl2 bg-white/5 p-8 ring-1 ring-white/10">
          <p className="mb-6 text-sm text-white/60">
            발표자(진행자)라면 아래에서 새 세션을 시작하세요. 세션을 만들면
            진행자 전용 화면으로 이동하고, 참가자용 QR 코드가 생성됩니다.
          </p>
          <button
            onClick={createSession}
            disabled={loading}
            className="w-full rounded-2xl bg-brand-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "세션을 만드는 중…" : "새 세션 시작하기"}
          </button>
          {error && (
            <p className="mt-4 rounded-xl bg-coral/15 px-4 py-3 text-sm text-coral">
              {error}
              <br />
              <span className="text-white/60">
                Supabase 환경변수와 schema.sql 적용 여부를 확인하세요.
              </span>
            </p>
          )}
        </div>

        <p className="mt-10 max-w-md text-xs leading-relaxed text-white/40">
          참가자는 로그인 없이 QR 스캔만으로 익명 참여합니다. 진행자가 결과를
          공개하기 전까지 전체 결과는 보이지 않습니다.
        </p>
      </div>
    </main>
  );
}
