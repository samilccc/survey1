import type { Answer, Question, Response } from "./types";

// 문항 유형별로 응답을 집계해 차트가 바로 쓸 수 있는 형태로 변환합니다.

export interface ChoiceTally {
  totalResponses: number;
  counts: number[]; // 선택지 index 별 응답 수
  percentages: number[]; // 선택지 index 별 비율(0~100)
}

export interface ScaleTally {
  totalResponses: number;
  average: number;
  distribution: { score: number; count: number }[]; // 점수별 분포
}

export interface RankingTally {
  totalResponses: number;
  // 가중 점수 = sum( (옵션 개수 - 순위 + 1) ) / 응답 수. 높을수록 우선순위 상위.
  ranked: { optionIndex: number; score: number; firstPlace: number }[];
}

export interface FreeTextTally {
  totalResponses: number;
  entries: { text: string; createdAt: string }[];
  wordFreq: { word: string; count: number }[];
}

function pct(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

export function tallyChoice(q: Question, responses: Response[]): ChoiceTally {
  const counts = new Array(q.options.length).fill(0);
  let total = 0;
  for (const r of responses) {
    const idx = r.answer as number;
    if (typeof idx === "number" && idx >= 0 && idx < counts.length) {
      counts[idx] += 1;
      total += 1;
    }
  }
  return {
    totalResponses: total,
    counts,
    percentages: counts.map((c) => pct(c, total)),
  };
}

export function tallyScale(q: Question, responses: Response[]): ScaleTally {
  const min = q.scale?.min ?? 1;
  const max = q.scale?.max ?? 5;
  const dist: Record<number, number> = {};
  for (let s = min; s <= max; s++) dist[s] = 0;
  let sum = 0;
  let total = 0;
  for (const r of responses) {
    const v = r.answer as number;
    if (typeof v === "number" && v >= min && v <= max) {
      dist[v] += 1;
      sum += v;
      total += 1;
    }
  }
  const distribution = Object.keys(dist)
    .map(Number)
    .sort((a, b) => a - b)
    .map((score) => ({ score, count: dist[score] }));
  return {
    totalResponses: total,
    average: total === 0 ? 0 : Math.round((sum / total) * 100) / 100,
    distribution,
  };
}

export function tallyRanking(q: Question, responses: Response[]): RankingTally {
  const n = q.options.length;
  const score = new Array(n).fill(0);
  const firstPlace = new Array(n).fill(0);
  let total = 0;
  for (const r of responses) {
    const order = r.answer as number[];
    if (!Array.isArray(order)) continue;
    total += 1;
    order.forEach((optIdx, rank) => {
      if (optIdx >= 0 && optIdx < n) {
        // 1순위가 가장 높은 가중치(n점), 마지막 순위가 1점
        score[optIdx] += n - rank;
        if (rank === 0) firstPlace[optIdx] += 1;
      }
    });
  }
  const ranked = score
    .map((s, optionIndex) => ({
      optionIndex,
      score: total === 0 ? 0 : Math.round((s / total) * 100) / 100,
      firstPlace: firstPlace[optionIndex],
    }))
    .sort((a, b) => b.score - a.score);
  return { totalResponses: total, ranked };
}

// 자유 입력 워드클라우드용 간단 토큰화 (한글/영문/숫자 추출, 1글자/불용어 제거)
const STOPWORDS = new Set([
  "그리고",
  "하지만",
  "그러나",
  "에서",
  "으로",
  "하는",
  "있는",
  "것은",
  "것이",
  "우리",
  "저는",
  "제가",
  "the",
  "and",
  "for",
  "our",
]);

export function tallyFreeText(responses: Response[]): FreeTextTally {
  const entries = responses
    .map((r) => ({ text: String(r.answer ?? "").trim(), createdAt: r.created_at }))
    .filter((e) => e.text.length > 0)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const freq: Record<string, number> = {};
  for (const e of entries) {
    const tokens = e.text
      .toLowerCase()
      .split(/[^0-9a-z가-힣]+/)
      .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
    for (const t of tokens) freq[t] = (freq[t] ?? 0) + 1;
  }
  const wordFreq = Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 40);

  return { totalResponses: entries.length, entries, wordFreq };
}

// 현재 문항에 응답한 고유 참가자 수
export function countResponded(responses: Response[]): number {
  return new Set(responses.map((r) => r.participant_id)).size;
}

export function answerToCsvCell(a: Answer): string {
  if (Array.isArray(a)) return a.join(" > ");
  return String(a);
}
