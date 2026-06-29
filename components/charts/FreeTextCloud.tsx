"use client";

import { useMemo } from "react";
import type { Response } from "@/lib/types";
import { tallyFreeText } from "@/lib/tally";

// 자유 입력 결과: 실제 응답(문장)을 카드로 보여주는 것이 핵심.
// 반복된 키워드(2회 이상)가 있을 때만 상단에 "자주 나온 말"을 절제된 크기로 표시한다.
export default function FreeTextCloud({
  responses,
  dark = false,
}: {
  responses: Response[];
  dark?: boolean;
}) {
  const t = useMemo(() => tallyFreeText(responses), [responses]);

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

      <div>
        <p className={`mb-2 text-sm font-bold ${dark ? "text-white/80" : "text-ink"}`}>
          응답 {t.totalResponses}건
        </p>
        <div
          className={
            t.entries.length === 1
              ? "grid grid-cols-1 gap-2.5"
              : "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
          }
        >
          {t.entries.map((e, i) => (
            <div
              key={i}
              className={`animate-fade-up break-keep rounded-2xl px-4 py-3.5 text-[15px] font-medium leading-relaxed ring-1 ${cardBase}`}
              style={{ animationDelay: `${Math.min(i * 30, 400)}ms` }}
            >
              <span className={`mr-2 text-xs font-bold ${muted}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {e.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
