"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  hostAction,
  useParticipants,
  useQuestions,
  useResponses,
  useSession,
} from "@/lib/useSurvey";
import { countResponded } from "@/lib/tally";
import { buildCsv, buildJson, downloadText } from "@/lib/export";
import type { Participant, Response } from "@/lib/types";
import QRDisplay from "@/components/QRDisplay";
import QuestionImage from "@/components/QuestionImage";
import ResultChart from "@/components/charts/ResultChart";

function Pill({
  on,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        on ? "bg-teal/20 text-teal" : "bg-white/10 text-white/60"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          on ? "bg-teal animate-pulse-soft" : "bg-white/40"
        }`}
      />
      {on ? onLabel : offLabel}
    </span>
  );
}

function Ctrl({
  onClick,
  children,
  variant = "ghost",
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "ghost" | "primary" | "warm";
  disabled?: boolean;
}) {
  const base =
    "rounded-2xl px-4 py-3 text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    ghost: "bg-white/10 text-white hover:bg-white/20",
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-lg",
    warm: "bg-coral text-navy-950 hover:brightness-105",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

export default function HostPage() {
  const params = useParams();
  const search = useSearchParams();
  const sessionId = String(params.sessionId);
  const adminKey = search.get("key") ?? "";

  const { session, loading } = useSession(sessionId);
  const questions = useQuestions(sessionId);
  const participants = useParticipants(sessionId);

  const idx = session?.current_question_index ?? 0;
  const current = questions[idx] ?? null;
  const responses = useResponses(sessionId, current?.id ?? null, !!current);

  const [busy, setBusy] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [showNote, setShowNote] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    }
  }, [sessionId]);

  const act = useCallback(
    async (action: string, payload?: unknown) => {
      if (!adminKey) return;
      setBusy(true);
      try {
        await hostAction(sessionId, adminKey, action, payload);
      } catch (e: any) {
        alert(`작업 실패: ${e.message}`);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, adminKey]
  );

  // 전체화면
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  // 전체 세션 결과 다운로드
  const downloadAll = async (format: "csv" | "json") => {
    const [{ data: allResp }, { data: allPart }] = await Promise.all([
      supabase.from("responses").select("*").eq("session_id", sessionId),
      supabase.from("participants").select("*").eq("session_id", sessionId),
    ]);
    const resp = (allResp as Response[]) ?? [];
    const part = (allPart as Participant[]) ?? [];
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    if (format === "csv") {
      downloadText(`survey-${stamp}.csv`, buildCsv(questions, part, resp), "text/csv");
    } else {
      downloadText(
        `survey-${stamp}.json`,
        buildJson(session!, questions, part, resp),
        "application/json"
      );
    }
  };

  if (!adminKey) {
    return (
      <Center>
        <p className="text-lg font-semibold text-white">진행자 키가 없습니다.</p>
        <p className="mt-2 text-white/60">
          이 화면은 세션 생성 시 발급된 진행자 전용 URL 로만 접속할 수 있습니다.
        </p>
      </Center>
    );
  }
  if (loading) return <Center>불러오는 중…</Center>;
  if (!session) return <Center>세션을 찾을 수 없습니다.</Center>;

  const responded = countResponded(responses);
  const connected = participants.length;

  // ===== 대기 화면 =====
  if (session.status === "waiting") {
    return (
      <main ref={rootRef} className="boardroom min-h-screen bg-navy-950 text-white">
        <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-8 py-12 lg:grid-cols-2">
          <div>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80">
              세션 대기 중 · 브리핑 후 시작하세요
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-tight">
              {session.title}
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-white/65">
              {session.description}
            </p>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <div className="text-5xl font-extrabold tabular-nums text-teal">
                  {connected}
                </div>
                <div className="text-sm text-white/60">현재 접속자</div>
              </div>
              <div className="h-12 w-px bg-white/15" />
              <div>
                <div className="text-5xl font-extrabold tabular-nums">
                  {questions.length}
                </div>
                <div className="text-sm text-white/60">문항</div>
              </div>
            </div>

            <button
              onClick={() => act("start")}
              disabled={busy}
              className="mt-10 rounded-2xl bg-brand-500 px-8 py-4 text-lg font-bold shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
            >
              브리핑 후 시작 →
            </button>
          </div>

          <div className="flex flex-col items-center gap-5">
            <QRDisplay url={joinUrl} size={300} />
            <div className="text-center">
              <p className="text-sm text-white/55">참가자 접속 주소</p>
              <p className="mt-1 break-all rounded-xl bg-white/5 px-4 py-2 font-mono text-sm text-white/80">
                {joinUrl}
              </p>
              <p className="mt-3 text-xs text-white/40">
                로그인 없이 QR 스캔만으로 익명 참여
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ===== 종료 / 요약 화면 =====
  if (session.status === "ended") {
    return (
      <SummaryView
        sessionId={sessionId}
        title={session.title}
        questions={questions}
        connected={connected}
        onDownload={downloadAll}
        onReopen={() => act("start")}
      />
    );
  }

  // ===== 진행 화면 =====
  return (
    <main ref={rootRef} className="boardroom min-h-screen bg-navy-950 pb-28 text-white">
      {/* 상단 바 */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white/50">
              {session.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Pill on={session.is_voting_open} onLabel="투표 열림" offLabel="투표 닫힘" />
            <Pill
              on={session.is_result_visible}
              onLabel="결과 공개"
              offLabel="결과 비공개"
            />
            <span className="ml-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              응답 <b className="text-teal">{responded}</b> / 접속{" "}
              <b>{connected}</b>
            </span>
            <button
              onClick={toggleFullscreen}
              className="ml-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              title="전체화면"
            >
              ⛶
            </button>
          </div>
        </div>
      </header>

      {current && (
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-3">
          {/* 메인: 문항 + 결과 */}
          <section className="lg:col-span-2">
            <div className="flex items-center gap-3 text-sm font-semibold text-white/50">
              <span className="rounded-full bg-brand-500/20 px-3 py-1 text-brand-400">
                문항 {idx + 1} / {questions.length}
              </span>
              <span className="uppercase tracking-wider text-white/40">
                {current.type}
              </span>
            </div>

            <QuestionImage
              order={current.order}
              title={current.title}
              imageUrl={current.image_url}
              className="mt-4 ring-1 ring-white/10"
            />

            <h2 className="mt-6 text-balance text-3xl font-extrabold leading-snug">
              {current.title}
            </h2>
            {current.short_context && (
              <p className="mt-3 text-pretty leading-relaxed text-white/65">
                {current.short_context}
              </p>
            )}

            {/* 결과 / 진행 현황 */}
            <div className="mt-8 rounded-xl2 bg-white/[0.04] p-6 ring-1 ring-white/10">
              {session.is_result_visible ? (
                <div className="animate-fade-up">
                  <ResultChart question={current} responses={responses} dark />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-5xl font-extrabold tabular-nums text-teal">
                    {responded}
                    <span className="text-2xl text-white/40"> / {connected}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/55">
                    실시간 응답 현황 · 결과는 아직 비공개입니다
                  </p>
                  <div className="mt-5 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{
                        width: `${
                          connected ? Math.round((responded / connected) * 100) : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 사이드: 진행자 노트 / 토론 질문 / 해석 */}
          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/40">
                진행자 패널
              </h3>
              <button
                onClick={() => setShowNote((v) => !v)}
                className="text-xs text-white/40 hover:text-white/70"
              >
                {showNote ? "접기" : "펼치기"}
              </button>
            </div>

            {showNote && (
              <>
                <Panel title="진행자 노트" accent="teal">
                  {current.facilitator_note}
                </Panel>
                <Panel title="토론 질문" accent="gold">
                  {current.discussion_prompt}
                </Panel>
                {session.is_result_visible && current.result_interpretation && (
                  <Panel title="결과 해석" accent="coral">
                    {current.result_interpretation}
                  </Panel>
                )}
              </>
            )}

            {/* 보조 컨트롤 */}
            <div className="rounded-xl2 bg-white/[0.04] p-4 ring-1 ring-white/10">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
                보조 컨트롤
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    confirm("이 문항의 응답을 모두 초기화할까요?") &&
                    act("reset_responses", { questionId: current.id })
                  }
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                >
                  응답 초기화
                </button>
                <button
                  onClick={() => act("set_edit", { value: !session.allow_response_edit })}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                    session.allow_response_edit
                      ? "bg-teal/20 text-teal"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  제출 후 수정 {session.allow_response_edit ? "허용" : "불가"}
                </button>
                <button
                  onClick={() => downloadAll("csv")}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                >
                  CSV
                </button>
                <button
                  onClick={() => downloadAll("json")}
                  className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20"
                >
                  JSON
                </button>
                <button
                  onClick={() =>
                    confirm("세션을 종료하고 요약 화면으로 이동할까요?") && act("end")
                  }
                  className="rounded-xl bg-coral/20 px-3 py-2 text-xs font-semibold text-coral hover:bg-coral/30"
                >
                  세션 종료
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 하단 진행 컨트롤 바 */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-navy-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 sm:gap-3">
          <Ctrl onClick={() => act("prev")} disabled={busy || idx === 0}>
            ← 이전
          </Ctrl>
          {session.is_voting_open ? (
            <Ctrl onClick={() => act("close_vote")} disabled={busy} variant="warm">
              투표 닫기
            </Ctrl>
          ) : (
            <Ctrl onClick={() => act("open_vote")} disabled={busy} variant="primary">
              투표 열기
            </Ctrl>
          )}
          {session.is_result_visible ? (
            <Ctrl onClick={() => act("hide")} disabled={busy}>
              결과 숨기기
            </Ctrl>
          ) : (
            <Ctrl onClick={() => act("reveal")} disabled={busy} variant="primary">
              결과 공개
            </Ctrl>
          )}
          <div className="flex-1" />
          <Ctrl
            onClick={() => act("next")}
            disabled={busy || idx >= questions.length - 1}
            variant="primary"
          >
            다음 문항 →
          </Ctrl>
        </div>
      </footer>
    </main>
  );
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "teal" | "gold" | "coral";
  children: React.ReactNode;
}) {
  const border = {
    teal: "border-teal",
    gold: "border-gold",
    coral: "border-coral",
  }[accent];
  const text = {
    teal: "text-teal",
    gold: "text-gold",
    coral: "text-coral",
  }[accent];
  return (
    <div
      className={`rounded-xl2 border-l-4 ${border} bg-white/[0.04] p-4 ring-1 ring-white/10`}
    >
      <p className={`mb-1.5 text-xs font-bold uppercase tracking-wider ${text}`}>
        {title}
      </p>
      <p className="text-pretty text-sm leading-relaxed text-white/85">{children}</p>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main className="boardroom flex min-h-screen items-center justify-center bg-navy-950 px-6 text-center text-white/80">
      <div>{children}</div>
    </main>
  );
}

// ===== 종료 후 전체 결과 요약 =====
function SummaryView({
  sessionId,
  title,
  questions,
  connected,
  onDownload,
  onReopen,
}: {
  sessionId: string;
  title: string;
  questions: import("@/lib/types").Question[];
  connected: number;
  onDownload: (f: "csv" | "json") => void;
  onReopen: () => void;
}) {
  const [allResponses, setAllResponses] = useState<Response[]>([]);

  useEffect(() => {
    supabase
      .from("responses")
      .select("*")
      .eq("session_id", sessionId)
      .then(({ data }) => setAllResponses((data as Response[]) ?? []));
  }, [sessionId]);

  return (
    <main className="boardroom min-h-screen bg-navy-950 pb-20 text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/70">
              세션 종료 · 전체 결과 요약
            </span>
            <h1 className="mt-4 text-3xl font-extrabold">{title}</h1>
            <p className="mt-2 text-white/60">참여자 {connected}명</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDownload("csv")}
              className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20"
            >
              CSV 다운로드
            </button>
            <button
              onClick={() => onDownload("json")}
              className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20"
            >
              JSON 다운로드
            </button>
            <button
              onClick={onReopen}
              className="rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-bold hover:bg-brand-600"
            >
              다시 진행
            </button>
          </div>
        </div>

        <div className="mt-10 space-y-10">
          {questions.map((q) => {
            const qResp = allResponses.filter((r) => r.question_id === q.id);
            return (
              <div
                key={q.id}
                className="rounded-xl2 bg-white/[0.04] p-6 ring-1 ring-white/10"
              >
                <div className="mb-1 text-sm font-semibold text-brand-400">
                  문항 {q.order}
                </div>
                <h2 className="mb-5 text-xl font-bold">{q.title}</h2>
                <ResultChart question={q} responses={qResp} dark />
                {q.result_interpretation && (
                  <p className="mt-5 rounded-xl border-l-4 border-coral bg-white/[0.04] p-4 text-sm leading-relaxed text-white/80">
                    {q.result_interpretation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
