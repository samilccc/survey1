"use client";

import type { Question, Response } from "@/lib/types";
import {
  tallyChoice,
  tallyRanking,
  tallyScale,
  type ChoiceTally,
} from "@/lib/tally";
import FreeTextCloud from "./FreeTextCloud";

const BAR_COLORS = ["#3B6BFF", "#7BB4B0", "#E7C26A", "#F4A28C", "#5C84FF", "#2B53E6"];

// 가로 막대 (단일 선택 / 순위 / 척도 분포)
// 모바일에서 라벨/수치가 잘리지 않도록 순수 CSS로 렌더링한다.
// - 보기 라벨: 윗줄에서 전체 폭 사용(길면 줄바꿈, 한글은 keep-all)
// - 수치(N명·%): 같은 줄 오른쪽에 고정(shrink-0)되어 항상 보임
// - 막대: 트랙은 항상 100% 폭, 채움은 비율(%)이라 화면 밖으로 넘칠 수 없음
function HBars({
  data,
  dark,
}: {
  data: { label: string; value: number; sub?: string }[];
  dark: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const labelColor = dark ? "text-white/90" : "text-navy-700";
  const subColor = dark ? "text-white" : "text-ink";
  const track = dark ? "bg-white/10" : "bg-ink/10";
  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const ratio = d.value <= 0 ? 0 : Math.max((d.value / max) * 100, 4);
        return (
          <div key={i} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={`min-w-0 break-keep text-[15px] font-semibold leading-snug ${labelColor}`}
              >
                {d.label}
              </span>
              {d.sub && (
                <span
                  className={`shrink-0 whitespace-nowrap text-sm font-bold tabular-nums ${subColor}`}
                >
                  {d.sub}
                </span>
              )}
            </div>
            <div className={`h-2.5 w-full overflow-hidden rounded-full ${track}`}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${ratio}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChoiceResult({
  q,
  tally,
  dark,
}: {
  q: Question;
  tally: ChoiceTally;
  dark: boolean;
}) {
  const data = q.options
    .map((opt, i) => ({
      label: opt,
      value: tally.counts[i],
      sub: `${tally.counts[i]}명 · ${tally.percentages[i]}%`,
    }))
    .sort((a, b) => b.value - a.value);
  return <HBars data={data} dark={dark} />;
}

function BinaryResult({
  q,
  tally,
  dark,
}: {
  q: Question;
  tally: ChoiceTally;
  dark: boolean;
}) {
  const leftPct = tally.percentages[0] ?? 0;
  const rightPct = tally.percentages[1] ?? 0;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span className="min-w-0 break-keep text-brand-500">{q.options[0]}</span>
        <span className="min-w-0 break-keep text-right text-coral">{q.options[1]}</span>
      </div>
      <div className="flex h-16 w-full overflow-hidden rounded-xl2 ring-1 ring-black/5">
        <div
          className="flex min-w-0 items-center justify-start bg-brand-500 text-white transition-all duration-700"
          style={{ width: `${Math.max(leftPct, 0)}%` }}
        >
          {leftPct >= 14 && <span className="px-4 text-lg font-extrabold tabular-nums">{leftPct}%</span>}
        </div>
        <div
          className="flex min-w-0 items-center justify-end bg-coral text-navy-950 transition-all duration-700"
          style={{ width: `${Math.max(rightPct, 0)}%` }}
        >
          {rightPct >= 14 && <span className="px-4 text-lg font-extrabold tabular-nums">{rightPct}%</span>}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={dark ? "text-white/70" : "text-muted"}>
          {tally.counts[0]}명 · {leftPct}%
        </span>
        <span className={dark ? "text-white/70" : "text-muted"}>
          총 {tally.totalResponses}명 응답
        </span>
        <span className={dark ? "text-white/70" : "text-muted"}>
          {tally.counts[1]}명 · {rightPct}%
        </span>
      </div>
    </div>
  );
}

function ScaleResult({
  q,
  responses,
  dark,
}: {
  q: Question;
  responses: Response[];
  dark: boolean;
}) {
  const t = tallyScale(q, responses);
  const labels = q.scale?.labels ?? {};
  const data = t.distribution
    .map((d) => ({
      label: `${d.score}. ${labels[d.score] ?? ""}`.trim(),
      value: d.count,
      sub: `${d.count}명`,
    }))
    .sort((a, b) => b.value - a.value);
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div
          className={`text-6xl font-extrabold tabular-nums ${
            dark ? "text-white" : "text-navy-700"
          }`}
        >
          {t.average.toFixed(2)}
        </div>
        <div className={`pb-2 text-sm ${dark ? "text-white/70" : "text-muted"}`}>
          평균 점수
          <br />
          (1~{q.scale?.max ?? 5} 척도 · {t.totalResponses}명)
        </div>
      </div>
      <HBars data={data} dark={dark} />
    </div>
  );
}

function RankingResult({
  q,
  responses,
  dark,
}: {
  q: Question;
  responses: Response[];
  dark: boolean;
}) {
  const t = tallyRanking(q, responses);
  const data = t.ranked.map((r) => ({
    label: q.options[r.optionIndex],
    value: r.score,
    sub: `${r.score}점 · 1순위 ${r.firstPlace}회`,
  }));
  return (
    <div className="space-y-3">
      <p className={`text-xs ${dark ? "text-white/60" : "text-muted"}`}>
        가중 점수(1순위일수록 높은 점수) 기준 정렬 · 총 {t.totalResponses}명
      </p>
      <HBars data={data} dark={dark} />
    </div>
  );
}

// 메인 디스패처
export default function ResultChart({
  question,
  responses,
  dark = false,
}: {
  question: Question;
  responses: Response[];
  dark?: boolean;
}) {
  switch (question.type) {
    case "single_choice":
      return (
        <ChoiceResult q={question} tally={tallyChoice(question, responses)} dark={dark} />
      );
    case "binary":
      return (
        <BinaryResult q={question} tally={tallyChoice(question, responses)} dark={dark} />
      );
    case "scale":
      return <ScaleResult q={question} responses={responses} dark={dark} />;
    case "ranking":
      return <RankingResult q={question} responses={responses} dark={dark} />;
    case "free_text":
      return <FreeTextCloud responses={responses} dark={dark} />;
    default:
      return null;
  }
}
