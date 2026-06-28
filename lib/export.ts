import type { Participant, Question, Response, Session } from "./types";
import { answerToCsvCell } from "./tally";

function csvEscape(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

// 응답을 사람이 읽기 좋은 텍스트로 변환 (CSV 용)
function readableAnswer(q: Question, answer: any): string {
  if (q.type === "single_choice" || q.type === "binary") {
    return q.options[answer as number] ?? String(answer);
  }
  if (q.type === "ranking" && Array.isArray(answer)) {
    return answer.map((i: number) => q.options[i] ?? i).join(" > ");
  }
  if (q.type === "scale") {
    const label = q.scale?.labels?.[answer as number];
    return label ? `${answer} (${label})` : String(answer);
  }
  return answerToCsvCell(answer);
}

export function buildCsv(
  questions: Question[],
  participants: Participant[],
  responses: Response[]
): string {
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const pMap = new Map(participants.map((p) => [p.id, p]));
  const header = [
    "question_order",
    "question_title",
    "question_type",
    "nickname",
    "answer_raw",
    "answer_readable",
    "created_at",
  ];
  const lines = [header.join(",")];
  for (const r of responses) {
    const q = qMap.get(r.question_id);
    const p = pMap.get(r.participant_id);
    if (!q) continue;
    lines.push(
      [
        String(q.order),
        csvEscape(q.title),
        q.type,
        csvEscape(p?.nickname ?? "익명"),
        csvEscape(JSON.stringify(r.answer)),
        csvEscape(readableAnswer(q, r.answer)),
        r.created_at,
      ].join(",")
    );
  }
  return lines.join("\n");
}

export function buildJson(
  session: Session,
  questions: Question[],
  participants: Participant[],
  responses: Response[]
) {
  return JSON.stringify(
    {
      session,
      participantCount: participants.length,
      questions: questions.map((q) => ({
        order: q.order,
        title: q.title,
        type: q.type,
        options: q.options,
        responses: responses
          .filter((r) => r.question_id === q.id)
          .map((r) => ({
            answer: r.answer,
            readable: readableAnswer(q, r.answer),
            created_at: r.created_at,
          })),
      })),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
