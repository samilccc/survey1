"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useQuestions, useResponses, useSession } from "@/lib/useSurvey";
import { randomNickname } from "@/lib/nickname";
import type { Answer, Question, Response } from "@/lib/types";
import QuestionImage from "@/components/QuestionImage";
import ResultChart from "@/components/charts/ResultChart";

const STORAGE_PREFIX = "survey-participant:";

function getDeviceType(): string {
  if (typeof navigator === "undefined") return "unknown";
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
    ? "mobile"
    : "desktop";
}

export default function JoinPage() {
  const params = useParams();
  const sessionId = String(params.sessionId);

  const { session, loading } = useSession(sessionId);
  const questions = useQuestions(sessionId);

  const [participantId, setParticipantId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [joining, setJoining] = useState(false);

  // 저장된 참가자 정보 복원
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_PREFIX + sessionId);
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setParticipantId(p.id);
        setNickname(p.nickname ?? "");
      } catch {}
    }
  }, [sessionId]);

  const join = useCallback(async () => {
    setJoining(true);
    const finalNick = nickname.trim() || null;
    const { data, error } = await supabase
      .from("participants")
      .insert({
        session_id: sessionId,
        nickname: finalNick,
        device_type: getDeviceType(),
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 250) : null,
      })
      .select()
      .single();
    setJoining(false);
    if (error || !data) {
      alert("입장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    localStorage.setItem(
      STORAGE_PREFIX + sessionId,
      JSON.stringify({ id: data.id, nickname: finalNick })
    );
    setParticipantId(data.id);
  }, [sessionId, nickname]);

  if (loading) return <FullScreen>불러오는 중…</FullScreen>;
  if (!session)
    return <FullScreen>세션을 찾을 수 없습니다. QR 코드를 다시 확인해주세요.</FullScreen>;

  // ===== 입장 화면 (닉네임 선택) =====
  if (!participantId) {
    return (
      <Shell>
        <div className="flex min-h-[100dvh] flex-col justify-center">
          <span className="mx-auto rounded-full bg-navy-700/10 px-4 py-1.5 text-xs font-semibold text-navy-700">
            익명 참여 · 로그인 불필요
          </span>
          <h1 className="mt-6 text-center text-2xl font-extrabold leading-snug text-ink">
            {session.title}
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-muted">
            {session.description}
          </p>

          <div className="mt-8 rounded-xl2 bg-white p-5 shadow-sm ring-1 ring-black/5">
            <label className="text-sm font-semibold text-ink">
              닉네임 <span className="font-normal text-muted">(선택)</span>
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="비워두면 익명으로 참여"
                maxLength={20}
                className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-brand-500"
              />
              <button
                onClick={() => setNickname(randomNickname())}
                className="rounded-xl bg-mist px-3 text-sm font-semibold text-navy-700 hover:bg-black/5"
                title="랜덤 닉네임"
              >
                랜덤
              </button>
            </div>
            <button
              onClick={join}
              disabled={joining}
              className="mt-4 w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white shadow-md transition hover:bg-brand-600 disabled:opacity-60"
            >
              {joining ? "입장 중…" : "입장하기"}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <ParticipantFlow
      sessionId={sessionId}
      session={session}
      questions={questions}
      participantId={participantId}
      nickname={nickname}
    />
  );
}

function ParticipantFlow({
  sessionId,
  session,
  questions,
  participantId,
  nickname,
}: {
  sessionId: string;
  session: import("@/lib/types").Session;
  questions: Question[];
  participantId: string;
  nickname: string;
}) {
  const idx = session.current_question_index;
  const current = questions[idx] ?? null;

  // 결과 공개 시에만 전체 응답을 가져온다 (그 전에는 결과를 보여주지 않음)
  const revealResponses = useResponses(
    sessionId,
    current?.id ?? null,
    session.is_result_visible && !!current
  );

  const [myAnswer, setMyAnswer] = useState<Answer | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Answer | null>(null);
  const [sending, setSending] = useState(false);

  // 문항이 바뀌면 내 응답 상태 초기화 + 기존 응답 조회
  useEffect(() => {
    setDraft(null);
    setMyAnswer(null);
    setSubmitted(false);
    if (!current) return;
    supabase
      .from("responses")
      .select("*")
      .eq("question_id", current.id)
      .eq("participant_id", participantId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMyAnswer((data as Response).answer);
          setSubmitted(true);
        }
      });
  }, [current?.id, participantId]);

  const submit = async () => {
    if (!current || draft === null || draft === undefined) return;
    if (Array.isArray(draft) && draft.length !== current.options.length) return;
    if (typeof draft === "string" && draft.trim() === "") return;
    setSending(true);
    const { error } = await supabase.from("responses").upsert(
      {
        session_id: sessionId,
        question_id: current.id,
        participant_id: participantId,
        answer: draft,
      },
      { onConflict: "question_id,participant_id" }
    );
    setSending(false);
    if (error) {
      alert("응답 제출에 실패했습니다. 다시 시도해주세요.");
      return;
    }
    setMyAnswer(draft);
    setSubmitted(true);
  };

  // ----- 화면 분기 -----
  if (session.status === "ended") {
    return (
      <Shell>
        <Centered>
          <Emoji>🙏</Emoji>
          <h2 className="text-xl font-extrabold text-ink">세션이 종료되었습니다</h2>
          <p className="mt-2 text-muted">참여해주셔서 감사합니다.</p>
        </Centered>
      </Shell>
    );
  }

  if (!current || session.status === "waiting") {
    return (
      <Shell>
        <Centered>
          <Pulse />
          <h2 className="mt-6 text-xl font-extrabold text-ink">곧 투표가 시작됩니다</h2>
          <p className="mt-2 text-muted">
            {nickname ? `${nickname}님, ` : ""}진행자가 첫 문항을 준비하고 있어요.
          </p>
        </Centered>
      </Shell>
    );
  }

  // 결과 공개 화면
  if (session.is_result_visible) {
    return (
      <Shell>
        <ProgressBar idx={idx} total={questions.length} />
        <div className="animate-fade-up">
          <QuestionImage
            order={current.order}
            title={current.title}
            imageUrl={current.image_url}
            className="ring-1 ring-black/5"
          />
          <h2 className="mt-4 text-xl font-extrabold leading-snug text-ink">
            {current.title}
          </h2>
          {myAnswer !== null && (
            <p className="mt-2 rounded-xl bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-600">
              내 응답: {renderMyAnswer(current, myAnswer)}
            </p>
          )}
          <div className="mt-5 rounded-xl2 bg-white p-4 shadow-sm ring-1 ring-black/5">
            <ResultChart question={current} responses={revealResponses} />
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            진행자가 다음 문항을 준비하면 자동으로 넘어갑니다.
          </p>
        </div>
      </Shell>
    );
  }

  // 투표가 닫혀 있고 결과도 비공개 → 대기
  if (!session.is_voting_open) {
    return (
      <Shell>
        <ProgressBar idx={idx} total={questions.length} />
        <Centered>
          <Pulse />
          <h2 className="mt-6 text-xl font-extrabold text-ink">
            {submitted ? "응답이 제출되었습니다" : "잠시만 기다려주세요"}
          </h2>
          <p className="mt-2 text-muted">진행자가 다음 화면을 준비하고 있어요.</p>
        </Centered>
      </Shell>
    );
  }

  // 이미 제출했고 수정 불가 → 제출 완료 화면
  if (submitted && !session.allow_response_edit) {
    return (
      <Shell>
        <ProgressBar idx={idx} total={questions.length} />
        <Centered>
          <Emoji>✓</Emoji>
          <h2 className="mt-4 text-xl font-extrabold text-ink">응답이 제출되었습니다</h2>
          <p className="mt-2 text-muted">
            진행자가 결과를 공개하면 이 화면에서 바로 확인할 수 있어요.
          </p>
          {myAnswer !== null && (
            <p className="mt-4 rounded-xl bg-mist px-4 py-2 text-sm font-semibold text-navy-700">
              내 응답: {renderMyAnswer(current, myAnswer)}
            </p>
          )}
        </Centered>
      </Shell>
    );
  }

  // ----- 응답 입력 화면 -----
  const effectiveDraft = draft ?? (submitted ? myAnswer : null);
  return (
    <Shell>
      <ProgressBar idx={idx} total={questions.length} />
      <div className="animate-fade-up">
        <QuestionImage
          order={current.order}
          title={current.title}
          imageUrl={current.image_url}
          className="ring-1 ring-black/5"
        />
        <h2 className="mt-4 text-2xl font-extrabold leading-snug text-ink">
          {current.title}
        </h2>
        {current.short_context && (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {current.short_context}
          </p>
        )}

        <div className="mt-6">
          <AnswerInput
            question={current}
            value={effectiveDraft}
            onChange={setDraft}
          />
        </div>

        <button
          onClick={submit}
          disabled={sending || !isValid(current, effectiveDraft)}
          className="mt-6 w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white shadow-md transition hover:bg-brand-600 disabled:opacity-40"
        >
          {sending
            ? "제출 중…"
            : submitted
            ? "응답 수정하기"
            : "제출하기"}
        </button>
        {submitted && session.allow_response_edit && (
          <p className="mt-2 text-center text-xs text-muted">
            진행자가 수정을 허용했습니다. 다시 제출하면 응답이 갱신됩니다.
          </p>
        )}
      </div>
    </Shell>
  );
}

function isValid(q: Question, v: Answer | null): boolean {
  if (v === null || v === undefined) return false;
  if (q.type === "ranking") return Array.isArray(v) && v.length === q.options.length;
  if (q.type === "free_text") return typeof v === "string" && v.trim().length > 0;
  return typeof v === "number";
}

function renderMyAnswer(q: Question, a: Answer): string {
  if (q.type === "single_choice" || q.type === "binary")
    return q.options[a as number] ?? String(a);
  if (q.type === "scale") {
    const label = q.scale?.labels?.[a as number];
    return label ? `${a} · ${label}` : String(a);
  }
  if (q.type === "ranking" && Array.isArray(a))
    return a.map((i, r) => `${r + 1}. ${q.options[i]}`).join("  ");
  return String(a);
}

// ===== 문항 유형별 입력 UI =====
function AnswerInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: Answer | null;
  onChange: (a: Answer) => void;
}) {
  if (question.type === "single_choice" || question.type === "binary") {
    return (
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const selected = value === i;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-base font-semibold transition ${
                selected
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-black/10 bg-white text-ink hover:border-brand-400"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  selected ? "bg-brand-500 text-white" : "bg-mist text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "scale") {
    const min = question.scale?.min ?? 1;
    const max = question.scale?.max ?? 5;
    const labels = question.scale?.labels ?? {};
    const items = [];
    for (let s = min; s <= max; s++) items.push(s);
    return (
      <div className="space-y-2.5">
        {items.map((s) => {
          const selected = value === s;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                selected
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-black/10 bg-white hover:border-brand-400"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${
                  selected ? "bg-brand-500 text-white" : "bg-mist text-navy-700"
                }`}
              >
                {s}
              </span>
              <span
                className={`text-sm font-semibold leading-snug ${
                  selected ? "text-brand-600" : "text-ink"
                }`}
              >
                {labels[s]}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "ranking") {
    const order = (Array.isArray(value) ? value : []) as number[];
    const rankOf = (i: number) => order.indexOf(i);
    const toggle = (i: number) => {
      const pos = order.indexOf(i);
      if (pos >= 0) onChange(order.filter((x) => x !== i));
      else onChange([...order, i]);
    };
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          중요한 순서대로 탭하세요. 다시 탭하면 해제됩니다. ({order.length}/
          {question.options.length})
        </p>
        {question.options.map((opt, i) => {
          const r = rankOf(i);
          const selected = r >= 0;
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-semibold transition ${
                selected
                  ? "border-brand-500 bg-brand-500/10 text-brand-600"
                  : "border-black/10 bg-white text-ink hover:border-brand-400"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${
                  selected
                    ? "bg-brand-500 text-white"
                    : "bg-mist text-muted"
                }`}
              >
                {selected ? r + 1 : "+"}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // free_text
  return (
    <div>
      <textarea
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value.slice(0, 200))}
        placeholder={question.free_text_placeholder ?? "자유롭게 입력해주세요"}
        rows={4}
        className="w-full resize-none rounded-2xl border-2 border-black/10 px-4 py-3 text-base leading-relaxed outline-none focus:border-brand-500"
      />
      <p className="mt-1 text-right text-xs text-muted">
        {((value as string) ?? "").length}/200
      </p>
    </div>
  );
}

// ===== 공용 레이아웃 요소 =====
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] bg-cream">
      <div className="mx-auto w-full max-w-md px-5 py-6">{children}</div>
    </main>
  );
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-cream px-6 text-center text-muted">
      <p>{children}</p>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      {children}
    </div>
  );
}

function ProgressBar({ idx, total }: { idx: number; total: number }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">
        <span>
          문항 {idx + 1} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${((idx + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Pulse() {
  return (
    <div className="relative h-16 w-16">
      <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" />
      <div className="absolute inset-3 rounded-full bg-brand-500/60" />
    </div>
  );
}

function Emoji({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/15 text-3xl font-bold text-brand-600">
      {children}
    </div>
  );
}
