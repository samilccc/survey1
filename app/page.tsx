"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_TITLE, SESSION_SUBTITLE } from "@/lib/seed";
import {
  loadLibrary,
  removeFromLibrary,
  upsertLibrary,
  type LibraryEntry,
} from "@/lib/hostLibrary";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "방금";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}일 전`;
  return new Date(ts).toLocaleDateString("ko-KR");
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);

  useEffect(() => {
    setLibrary(loadLibrary());
  }, []);

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
      upsertLibrary({ id: data.sessionId, key: data.adminKey, title: SESSION_TITLE });
      router.push(`/host/${data.sessionId}?key=${data.adminKey}`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  function open(e: LibraryEntry) {
    router.push(`/host/${e.id}?key=${e.key}`);
  }

  function remove(id: string) {
    removeFromLibrary(id);
    setLibrary(loadLibrary());
  }

  return (
    <main className="boardroom min-h-screen host-bg text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <span className="mb-6 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/80">
          팀 리듬 워크숍 · 실시간 서베이
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

        {/* 세션 라이브러리 (이 기기에 진행한 세션 스택) */}
        {library.length > 0 && (
          <div className="mt-10 w-full max-w-md text-left">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-white/70">지난 세션 라이브러리</h2>
              <span className="text-xs text-white/40">{library.length}개 · 이 기기</span>
            </div>
            <ul className="space-y-2">
              {library.map((e) => (
                <li
                  key={e.id}
                  className="group flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10 transition hover:bg-white/[0.07]"
                >
                  <button onClick={() => open(e)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-white/90">{e.title}</p>
                    <p className="mt-0.5 text-xs text-white/45">{timeAgo(e.lastSeen)} 진행</p>
                  </button>
                  <button
                    onClick={() => open(e)}
                    className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-500"
                  >
                    열기
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    title="라이브러리에서 제거"
                    className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-white/35 hover:text-coral"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 px-1 text-xs leading-relaxed text-white/35">
              이 목록은 진행자 본인 기기에만 저장됩니다. ‘열기’를 누르면 해당 세션을
              그대로 다시 열어(종료된 세션은 결과 요약으로) 회귀할 수 있습니다.
            </p>
          </div>
        )}

        <p className="mt-10 max-w-md text-xs leading-relaxed text-white/40">
          참가자는 로그인 없이 QR 스캔만으로 익명 참여합니다. 진행자가 결과를
          공개하기 전까지 전체 결과는 보이지 않습니다.
        </p>
      </div>
    </main>
  );
}
