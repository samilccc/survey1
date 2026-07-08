"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { upsertLibrary } from "@/lib/hostLibrary";
import {
  hostAction,
  useParticipants,
  useQuestions,
  useResponses,
  useSession,
} from "@/lib/useSurvey";
import { countResponded, tallyChoice, tallyScale, tallyRanking, tallyFreeText } from "@/lib/tally";
import { buildCsv, buildJson, downloadText } from "@/lib/export";
import type { Participant, Question, Response } from "@/lib/types";
import QRDisplay from "@/components/QRDisplay";
import ResultChart from "@/components/charts/ResultChart";
import { resolveGuide } from "@/lib/dialogueGuide";

const TYPE_KO: Record<string, string> = {
  single_choice: "단일 선택",
  binary: "양자택일",
  scale: "척도 응답",
  ranking: "우선순위",
  free_text: "자유 응답",
};

// 프레젠테이션 슬라이드에 표시할 핵심 bullet (정답 노출 없이 보기/척도/안내만)
function slidePoints(q: Question): { marker: string; text: string }[] {
  if (q.type === "scale") {
    const min = q.scale?.min ?? 1;
    const max = q.scale?.max ?? 5;
    const labels = q.scale?.labels ?? {};
    const pts: { marker: string; text: string }[] = [];
    for (let s = min; s <= max; s++) pts.push({ marker: String(s), text: labels[s] ?? `${s}점` });
    return pts;
  }
  if (q.type === "free_text") {
    return [{ marker: "✎", text: q.free_text_placeholder || "자유롭게 한 줄로 입력해주세요" }];
  }
  return q.options.map((o, i) => ({
    marker: q.type === "ranking" ? "›" : String(i + 1),
    text: o,
  }));
}

function Pill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        on ? "bg-teal/20 text-teal" : "bg-white/10 text-white/60"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? "bg-teal animate-pulse-soft" : "bg-white/40"}`}
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
  const [tools, setTools] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // "전원 답변 완료" 기준 = 세션 시작 시점의 접속 인원 수(스냅샷)
  const baselineRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      session?.status === "active" &&
      baselineRef.current === null &&
      participants.length > 0
    ) {
      baselineRef.current = participants.length;
    }
    if (session?.status === "waiting") baselineRef.current = null;
  }, [session?.status, participants.length]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/join/${sessionId}`);
    }
  }, [sessionId]);

  // 세션을 열 때마다 진행자 라이브러리에 기록(스택 누적)
  useEffect(() => {
    if (session && adminKey) {
      upsertLibrary({ id: sessionId, key: adminKey, title: session.title });
    }
  }, [session?.id, session?.title, adminKey, sessionId]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

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
      <main ref={rootRef} className="boardroom min-h-screen host-bg text-white">
        <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-8 py-12 lg:grid-cols-2">
          <div>
            <a
              href="/"
              className="mb-5 inline-block text-xs font-semibold text-white/40 transition hover:text-white/75"
            >
              ← 전체 세션
            </a>
            <br />
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80">
              세션 대기 중 · 브리핑이 끝나면 시작하세요
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
                <div className="text-5xl font-extrabold tabular-nums">{questions.length}</div>
                <div className="text-sm text-white/60">문항</div>
              </div>
            </div>

            <button
              onClick={() => act("start")}
              disabled={busy}
              className="mt-10 rounded-2xl bg-brand-500 px-10 py-4 text-lg font-bold shadow-lg transition hover:bg-brand-600 disabled:opacity-60"
            >
              시작
            </button>
          </div>

          <div className="flex flex-col items-center gap-5">
            <QRDisplay url={joinUrl} size={300} />
            <div className="text-center">
              <p className="text-sm text-white/55">참가자 접속 주소</p>
              <p className="mt-1 break-all rounded-xl bg-white/5 px-4 py-2 font-mono text-sm text-white/80">
                {joinUrl}
              </p>
              <p className="mt-3 text-xs text-white/40">로그인 없이 QR 스캔만으로 익명 참여</p>
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

  // ===== 진행 화면 (프레젠테이션 슬라이드) =====
  const baseline = baselineRef.current ?? connected;
  const pct = baseline > 0 ? Math.min(100, Math.round((responded / baseline) * 100)) : 0;
  const allDone = baseline > 0 && responded >= baseline;
  const points = current ? slidePoints(current) : [];

  return (
    <main ref={rootRef} className="boardroom flex min-h-screen flex-col host-bg pb-28 text-white">
      {/* 상단 바 */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <span className="truncate text-sm font-semibold text-white/50">{session.title}</span>
          <div className="flex items-center gap-2">
            <Pill on={session.is_voting_open} onLabel="투표 열림" offLabel="투표 닫힘" />
            <Pill on={session.is_result_visible} onLabel="결과 공개" offLabel="결과 비공개" />
            <span className="ml-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              응답 <b className="text-teal">{responded}</b> / {baseline}
            </span>
            <button
              onClick={() => setTools((v) => !v)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              title="도구"
            >
              ⋯
            </button>
            <button
              onClick={toggleFullscreen}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              title="전체화면"
            >
              ⛶
            </button>
          </div>
        </div>
        {/* 보조 도구 (접힘) */}
        {tools && current && (
          <div className="border-t border-white/10 bg-navy-900/95">
            <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 py-3">
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
                  session.allow_response_edit ? "bg-teal/20 text-teal" : "bg-white/10 hover:bg-white/20"
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
        )}
      </header>

      {/* 슬라이드 본문 */}
      {current && (
        <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-8">
          <div className="flex items-center justify-center gap-3 text-sm font-semibold">
            <span className="rounded-full bg-brand-500/20 px-3 py-1 text-brand-400">
              문항 {idx + 1} / {questions.length}
            </span>
            <span className="uppercase tracking-wider text-white/40">
              {TYPE_KO[current.type] ?? current.type}
            </span>
          </div>

          <h2 className="mt-5 text-balance text-center text-4xl font-extrabold leading-tight md:text-5xl">
            {current.title}
          </h2>
          {current.short_context && (
            <p className="mx-auto mt-4 max-w-3xl text-pretty text-center text-lg leading-relaxed text-white/60">
              {current.short_context}
            </p>
          )}

          {!session.is_result_visible ? (
            <div className="mt-10 grid items-start gap-7 lg:grid-cols-5">
              {/* 핵심 bullet */}
              <ul className="space-y-3 lg:col-span-3">
                {points.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 rounded-2xl bg-white/[0.04] px-5 py-4 ring-1 ring-white/10"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-base font-extrabold text-brand-400">
                      {p.marker}
                    </span>
                    <span className="break-keep text-xl font-semibold leading-snug">{p.text}</span>
                  </li>
                ))}
              </ul>

              {/* 실시간 참여 현황 */}
              <div className="rounded-xl2 bg-white/[0.04] p-6 text-center ring-1 ring-white/10 lg:col-span-2">
                {allDone ? (
                  <div className="animate-grow-in py-2">
                    <div className="text-4xl">🎉</div>
                    <div className="mt-3 text-2xl font-extrabold text-teal">
                      팀원 전원 답변 완료!
                    </div>
                    <div className="mt-1.5 text-sm text-white/60">
                      {baseline}명 모두 참여했어요
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-white/50">실시간 참여 현황</div>
                    <div className="mt-3 text-6xl font-extrabold tabular-nums text-teal">
                      {responded}
                      <span className="text-3xl text-white/35"> / {baseline}</span>
                    </div>
                    <div className="mt-1 text-sm text-white/50">{pct}% 응답</div>
                    <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-4 text-xs text-white/40">
                      {session.is_voting_open
                        ? "투표가 열려 있어요"
                        : "‘투표 열기’를 누르면 참여가 시작됩니다"}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-10 animate-fade-up">
              <p className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-white/45">
                팀원들이 선택한 답변
              </p>
              <div className="rounded-xl2 bg-white/[0.04] p-6 ring-1 ring-white/10 md:p-8">
                <ResultChart question={current} responses={responses} dark />
              </div>
              <p className="mt-3 text-center text-xs text-white/40">총 {responded}명 응답</p>
              <DialogueGuideCard question={current} responses={responses} />
            </div>
          )}

          {/* 다음 문항 미리보기 — 지금은 현재 문항에만 집중하도록 */}
          {questions[idx + 1] && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/40">
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-white/55">
                다음
              </span>
              <span className="max-w-md truncate">{questions[idx + 1].title}</span>
              <span className="hidden text-xs text-white/25 sm:inline">
                · 지금은 이 문항에만 집중해요
              </span>
            </div>
          )}
        </section>
      )}

      {/* 하단 진행 컨트롤 바 */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-navy-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-3 sm:gap-3">
          <Ctrl onClick={() => act("prev")} disabled={busy || idx === 0}>
            ← 이전
          </Ctrl>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-3">
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
                결과 보기
              </Ctrl>
            )}
          </div>
          <div className="flex-1" />
          {idx >= questions.length - 1 ? (
            <Ctrl
              onClick={() =>
                confirm("세션을 마치고 참여자에게 결과 요약을 보여줄까요?") && act("end")
              }
              disabled={busy}
              variant="warm"
            >
              마치기 ✓
            </Ctrl>
          ) : (
            <Ctrl onClick={() => act("next")} disabled={busy} variant="primary">
              다음 문항 →
            </Ctrl>
          )}
        </div>
      </footer>
    </main>
  );
}

function GuideBlock({
  label,
  text,
  quote = false,
}: {
  label: string;
  text: string;
  quote?: boolean;
}) {
  return (
    <div className="rounded-xl2 bg-white/[0.06] p-4 ring-1 ring-white/10">
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-teal">
        {label}
      </div>
      <p
        className={`break-keep text-[15px] leading-relaxed md:text-base ${
          quote ? "italic text-white/80" : "font-medium text-white/90"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function DialogueGuideCard({
  question,
  responses,
}: {
  question: Question;
  responses: Response[];
}) {
  const g = resolveGuide(question, responses);
  if (!g) return null;
  return (
    <div className="mt-6 animate-fade-up rounded-xl2 bg-gradient-to-br from-brand-500/18 via-white/[0.04] to-teal/12 p-5 ring-1 ring-white/10 md:p-7">
      <div className="mb-4 flex items-center gap-2">
        <span aria-hidden className="text-lg">💬</span>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal">
          함께 나눠볼 대화 가이드
        </h3>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <GuideBlock label="이 결과가 말하는 것" text={g.direction} />
        <GuideBlock label="팀원들의 속마음" text={g.sentiment} quote />
        <GuideBlock label="함께 얘기해볼까요" text={g.prompt} />
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <main className="boardroom flex min-h-screen items-center justify-center host-bg px-6 text-center text-white/80">
      <div>{children}</div>
    </main>
  );
}

// ===== 종료 후 전체 결과 요약 (한 눈에 보이는 대시보드) =====
function summaryHeadline(
  q: import("@/lib/types").Question,
  responses: Response[]
): { top: string; sub: string } {
  if (q.type === "single_choice" || q.type === "binary") {
    const t = tallyChoice(q, responses);
    if (t.totalResponses === 0) return { top: "응답 없음", sub: "" };
    let top = 0;
    t.counts.forEach((c, i) => {
      if (c > t.counts[top]) top = i;
    });
    return { top: q.options[top] ?? "—", sub: `${t.percentages[top]}% · ${t.counts[top]}명` };
  }
  if (q.type === "scale") {
    const t = tallyScale(q, responses);
    if (t.totalResponses === 0) return { top: "응답 없음", sub: "" };
    let best = t.distribution[0];
    for (const d of t.distribution) if (d.count > (best?.count ?? 0)) best = d;
    const label = q.scale?.labels?.[best.score] ?? `${best.score}점`;
    return { top: label, sub: `평균 ${t.average.toFixed(1)} · ${t.totalResponses}명` };
  }
  if (q.type === "ranking") {
    const t = tallyRanking(q, responses);
    if (t.totalResponses === 0) return { top: "응답 없음", sub: "" };
    const first = t.ranked[0];
    return {
      top: q.options[first.optionIndex] ?? "—",
      sub: `1순위 ${first.firstPlace}회 · ${t.totalResponses}명`,
    };
  }
  // free_text
  const t = tallyFreeText(responses);
  if (t.totalResponses === 0) return { top: "응답 없음", sub: "" };
  const w = t.wordFreq[0];
  return w
    ? { top: `“${w.word}”`, sub: `${w.count}회 · 응답 ${t.totalResponses}건` }
    : { top: `응답 ${t.totalResponses}건`, sub: "자유 응답" };
}

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
  const [detail, setDetail] = useState(false);

  useEffect(() => {
    supabase
      .from("responses")
      .select("*")
      .eq("session_id", sessionId)
      .then(({ data }) => setAllResponses((data as Response[]) ?? []));
  }, [sessionId]);

  return (
    <main className="boardroom flex min-h-screen flex-col host-bg text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 py-6">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
              세션 종료 · 전체 요약
            </span>
            <h1 className="mt-2 truncate text-2xl font-extrabold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20"
            >
              ← 라이브러리
            </a>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
              참여 <b className="text-teal">{connected}</b>명
            </span>
            <button
              onClick={() => setDetail((v) => !v)}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20"
            >
              {detail ? "요약만 보기" : "문항별 상세"}
            </button>
            <button
              onClick={() => onDownload("csv")}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20"
            >
              CSV
            </button>
            <button
              onClick={() => onDownload("json")}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20"
            >
              JSON
            </button>
            <button
              onClick={onReopen}
              className="rounded-xl bg-brand-500 px-3 py-2 text-xs font-bold hover:bg-brand-600"
            >
              다시 진행
            </button>
          </div>
        </div>

        {/* 한 눈에 보이는 요약 그리드 */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {questions.map((q) => {
            const qResp = allResponses.filter((r) => r.question_id === q.id);
            const h = summaryHeadline(q, qResp);
            return (
              <div
                key={q.id}
                className="flex flex-col rounded-xl2 bg-white/[0.05] p-4 ring-1 ring-white/10"
              >
                <div className="text-xs font-bold text-brand-400">문항 {q.order}</div>
                <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-white/50">
                  {q.title}
                </p>
                <div className="mt-3.5 break-keep text-2xl font-extrabold leading-tight text-teal">
                  {h.top}
                </div>
                {h.sub && <div className="mt-1.5 text-xs font-medium text-white/55">{h.sub}</div>}
              </div>
            );
          })}
        </div>

        {/* 문항별 상세 (토글) */}
        {detail && (
          <div className="mt-8 space-y-8 border-t border-white/10 pt-8">
            {questions.map((q) => {
              const qResp = allResponses.filter((r) => r.question_id === q.id);
              return (
                <div key={q.id} className="rounded-xl2 bg-white/[0.04] p-6 ring-1 ring-white/10">
                  <div className="mb-1 text-sm font-semibold text-brand-400">문항 {q.order}</div>
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
        )}
      </div>
    </main>
  );
}
