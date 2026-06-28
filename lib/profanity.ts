// 자유 입력 문항용 매우 가벼운 비속어 필터.
// MVP 수준의 기본 차단어 목록이며, 운영 시 확장 가능합니다.
// 정책: 매칭되면 진행자 검토 큐로 분류(자동 삭제 X). 진행자가 공개 여부를 결정합니다.

const BLOCKLIST = [
  "씨발", "시발", "ㅅㅂ", "병신", "ㅂㅅ", "지랄", "개새", "좆", "꺼져",
  "fuck", "shit", "bitch", "asshole",
];

export function isFlagged(text: string): boolean {
  const t = text.toLowerCase().replace(/\s+/g, "");
  return BLOCKLIST.some((w) => t.includes(w));
}

// 표시용 마스킹 (필요 시 사용)
export function maskFlagged(text: string): string {
  let out = text;
  for (const w of BLOCKLIST) {
    if (!w) continue;
    const re = new RegExp(w, "gi");
    out = out.replace(re, "■".repeat(w.length));
  }
  return out;
}
