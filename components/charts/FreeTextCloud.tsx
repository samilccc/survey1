"use client";

import { useMemo, useState } from "react";
import type { Response } from "@/lib/types";
import { tallyFreeText } from "@/lib/tally";
import { isFlagged, maskFlagged } from "@/lib/profanity";

// 자유 입력 문항 결과: 상단 워드클라우드 + 하단 카드형 목록.
// 부적절 표현은 진행자 검토 토글로 마스킹/표시할 수 있습니다.
export default function FreeTextCloud({
  responses,
  dark = false,
}: {
  responses: Response[];
  dark?: boolean;
}) {
  const [showFlagged, setShowFlagged] = useState(false);
  const t = useMemo(() => tallyFreeText(responses), [responses]);

  const maxCount = Math.max(1, ...t.wordFreq.map((w) => w.count));
  const colors = ["#3B6BFF", "#7BB4B0", "#E7C26A", "#F4A28C", "#5C84FF"];

  const muted = dark ? "text-white/60" : "text-muted";

  return (
    <div className="space-y-6">
      {/* 워드클라우드 */}
      {t.wordFreq.length > 0 && (
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl2 p-6 ${
            dark ? "bg-white/5" : "bg-mist"
          }`}
        >
          {t.wordFreq.map((w, i) => {
            const scale = 0.9 + (w.count / maxCount) * 1.8; // 0.9rem ~ 2.7rem
            return (
              <span
                key={w.word}
                className="font-extrabold leading-none animate-grow-in"
                style={{
                  fontSize: `${scale}rem`,
                  color: colors[i % colors.length],
                  opacity: 0.55 + (w.count / maxCount) * 0.45,
                }}
                title={`${w.count}회`}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      )}

      {/* 카드형 목록 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className={`text-sm font-semibold ${dark ? "text-white/80" : "text-ink"}`}>
            응답 {t.totalResponses}건
          </p>
          <button
            onClick={() => setShowFlagged((v) => !v)}
            className={`text-xs underline-offset-4 hover:underline ${muted}`}
          >
            {showFlagged ? "민감 표현 가리기" : "민감 표현 보기(진행자용)"}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {t.entries.map((e, i) => {
            const flagged = isFlagged(e.text);
            const display = flagged && !showFlagged ? maskFlagged(e.text) : e.text;
            return (
              <div
                key={i}
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 animate-fade-up ${
                  dark
                    ? "bg-white/5 text-white/90 ring-white/10"
                    : "bg-white text-ink ring-black/5"
                } ${flagged ? "border-l-4 border-coral" : ""}`}
                style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
              >
                {display}
                {flagged && (
                  <span className="ml-2 align-middle text-[10px] font-bold text-coral">
                    검토
                  </span>
                )}
              </div>
            );
          })}
          {t.entries.length === 0 && (
            <p className={`col-span-full py-8 text-center ${muted}`}>
              아직 입력된 응답이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
