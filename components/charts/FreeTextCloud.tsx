"use client";

import { useMemo, useState } from "react";
import type { Response } from "@/lib/types";
import { tallyFreeText } from "@/lib/tally";
import { isFlagged, maskFlagged } from "@/lib/profanity";

// 자유 입력 결과: 실제 응답(문장)을 카드로 보여주는 것이 핵심.
// 반복된 키워드(2회 이상)가 있을 때만 상단에 "자주 나온 말"을 절제된 크기로 표시한다.
export default function FreeTextCloud({
  responses,
  dark = false,
}: {
  responses: Response[];
  dark?: boolean;
}) {
  const [showFlagged, setShowFlagged] = useState(false);
  const t = useMemo(() => tallyFreeText(responses), [responses]);

  // 2회 이상 등장한 키워드만 의미 있는 것으로 간주
  const repeated = t.wordFreq.filter((w) => w.count >= 2).slice(0, 8);
  const muted = dark ? "text-white/60" : "text-muted";
  const cardBase = dark
    ? "bg-white/5 text-white/90 ring-white/10"
    : "bg-white text-ink ring-black/5";

  if (t.totalResponses === 0) {
    return (
      <p className={`py-10 text-center ${muted}`}>아직 입력된 응답이 없습니다.</p>
    );
  }

  return (
    <div className="space-y-5">
      {/* 자주 나온 말 (반복 키워드가 있을 때만) */}
      {repeated.length > 0 && (
        <div className={`rounded-xl2 p-4 ${dark ? "bg-white/5" : "bg-mist"}`}>
          <p className={`mb-2.5 text-xs font-bold ${muted}`}>자주 나온 말</p>
          <div className="flex flex-wrap gap-2">
            {repeated.map((w) => (
              <span
                key={w.word}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
                  dark ? "bg-brand-500/25 text-white" : "bg-brand-500/10 text-brand-600"
                }`}
              >
                {w.word}
                <span className="text-xs font-semibold opacity-70">{w.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 실제 응답 카드 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className={`text-sm font-bold ${dark ? "text-white/80" : "text-ink"}`}>
            응답 {t.totalResponses}건
          </p>
          <button
            onClick={() => setShowFlagged((v) => !v)}
            className={`text-xs underline-offset-4 hover:underline ${muted}`}
          >
            {showFlagged ? "민감 표현 가리기" : "민감 표현 보기(진행자용)"}
          </button>
        </div>
        <div
          className={
            t.entries.length === 1
              ? "grid grid-cols-1 gap-2.5"
              : "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          }
        >
          {t.entries.map((e, i) => {
            const flagged = isFlagged(e.text);
            const display = flagged && !showFlagged ? maskFlagged(e.text) : e.text;
            return (
              <div
                key={i}
                className={`animate-fade-up break-keep rounded-2xl px-4 py-3.5 text-[15px] font-medium leading-relaxed ring-1 ${cardBase} ${
                  flagged ? "border-l-4 border-coral" : ""
                }`}
                style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
              >
                <span className={`mr-2 text-xs font-bold ${muted}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {display}
                {flagged && (
                  <span className="ml-2 align-middle text-[10px] font-bold text-coral">
                    검토
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
