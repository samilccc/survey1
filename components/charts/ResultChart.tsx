"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Question, Response } from "@/lib/types";
import {
  tallyChoice,
  tallyRanking,
  tallyScale,
  type ChoiceTally,
} from "@/lib/tally";
import FreeTextCloud from "./FreeTextCloud";

const BAR_COLORS = ["#3B6BFF", "#7BB4B0", "#E7C26A", "#F4A28C", "#5C84FF", "#2B53E6"];

function shorten(s: string, n = 22) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// 가로 막대 (단일 선택 / 순위)
function HBars({
  data,
  dark,
}: {
  data: { label: string; value: number; sub?: string }[];
  dark: boolean;
}) {
  const axis = dark ? "#C7D2FE" : "#61708C";
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 64)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 56, bottom: 8, left: 8 }}
        barCategoryGap="22%"
      >
        <XAxis type="number" hide domain={[0, max]} />
        <YAxis
          type="category"
          dataKey="label"
          width={dark ? 230 : 210}
          tick={{ fill: axis, fontSize: 15, fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => shorten(v)}
        />
        <Bar dataKey="value" radius={[8, 8, 8, 8]} isAnimationActive animationDuration={700}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
          <LabelList
            dataKey="sub"
            position="right"
            fill={dark ? "#FFFFFF" : "#14233F"}
            fontSize={15}
            fontWeight={700}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
  const data = q.options.map((opt, i) => ({
    label: opt,
    value: tally.counts[i],
    sub: `${tally.counts[i]}명 · ${tally.percentages[i]}%`,
  }));
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
  const total = tally.totalResponses || 1;
  const leftPct = tally.percentages[0] ?? 0;
  const rightPct = tally.percentages[1] ?? 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-brand-400">{q.options[0]}</span>
        <span className={dark ? "text-coral" : "text-coral"}>{q.options[1]}</span>
      </div>
      <div className="flex h-16 w-full overflow-hidden rounded-xl2 ring-1 ring-black/5">
        <div
          className="flex items-center justify-start bg-brand-500 px-4 text-white transition-all duration-700"
          style={{ width: `${Math.max(leftPct, 0)}%` }}
        >
          <span className="text-lg font-extrabold">{leftPct}%</span>
        </div>
        <div
          className="flex items-center justify-end bg-coral px-4 text-navy-950 transition-all duration-700"
          style={{ width: `${Math.max(rightPct, 0)}%` }}
        >
          <span className="text-lg font-extrabold">{rightPct}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className={dark ? "text-white/70" : "text-muted"}>
          {tally.counts[0]}명
        </span>
        <span className={dark ? "text-white/70" : "text-muted"}>
          총 {tally.totalResponses}명 응답
        </span>
        <span className={dark ? "text-white/70" : "text-muted"}>
          {tally.counts[1]}명
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
  const data = t.distribution.map((d) => ({
    label: `${d.score}. ${labels[d.score] ?? ""}`,
    value: d.count,
    sub: `${d.count}명`,
  }));
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
