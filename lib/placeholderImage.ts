// 외부 이미지 API 없이도 문항 카드가 "의도된 콘셉트 카드"로 보이도록,
// 문항 order 에 따라 결정적으로 16:9 SVG(아이콘 + 키워드 + 인덱스)를 생성합니다.
// 실제 이미지를 넣고 싶으면:
//   1) DB의 image_url 에 주소를 넣거나,
//   2) public/q/ 폴더에 01.png ~ 10.png (또는 .jpg) 로 저장하면 자동으로 우선 표시됩니다.

type Concept = { icon: string; keyword: string };

// 문항 주제에 맞춘 아이콘 + 한 줄 키워드(제목과 중복되지 않는 보조 개념어)
const CONCEPTS: Record<number, Concept> = {
  1: { icon: "🧭", keyword: "어디서부터 보는가" },
  2: { icon: "💞", keyword: "마음을 움직이는 것" },
  3: { icon: "👶", keyword: "현금과 출산 결정" },
  4: { icon: "🤐", keyword: "제도와 현실의 간극" },
  5: { icon: "🧩", keyword: "공백과 책임" },
  6: { icon: "🧲", keyword: "복지와 리텐션" },
  7: { icon: "🥇", keyword: "가장 먼저 바꿀 것" },
  8: { icon: "⚖️", keyword: "제도 vs 문화" },
  9: { icon: "🌍", keyword: "모두의 이슈" },
  10: { icon: "💬", keyword: "지금 나누고 싶은 말" },
};

const PALETTES: [string, string, string][] = [
  ["#0E1E44", "#1B3A8A", "#F4A28C"],
  ["#16295C", "#3B6BFF", "#E7C26A"],
  ["#0E1E44", "#3B6BFF", "#7BB4B0"],
  ["#1B3A8A", "#5C84FF", "#F4A28C"],
  ["#081229", "#2B53E6", "#7BB4B0"],
  ["#16295C", "#1B3A8A", "#E7C26A"],
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function placeholderDataUri(order: number, label?: string): string {
  const concept: Concept =
    CONCEPTS[order] ?? { icon: "🗳️", keyword: label ? label : "관점형 서베이" };
  const [c1, c2, accent] = PALETTES[(order - 1 + PALETTES.length) % PALETTES.length];
  const idA = `gA${order}`;
  const idB = `gB${order}`;
  const safe = String(order).padStart(2, "0");
  const kw = esc(concept.keyword);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='${idA}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${c1}'/>
      <stop offset='1' stop-color='${c2}'/>
    </linearGradient>
    <radialGradient id='${idB}' cx='0.78' cy='0.22' r='0.9'>
      <stop offset='0' stop-color='${accent}' stop-opacity='0.5'/>
      <stop offset='1' stop-color='${accent}' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#${idA})'/>
  <rect width='1600' height='900' fill='url(#${idB})'/>
  <circle cx='1300' cy='220' r='150' fill='${accent}' opacity='0.16'/>
  <circle cx='250' cy='760' r='240' fill='#ffffff' opacity='0.05'/>
  <text x='110' y='150' font-family='Pretendard, sans-serif' font-size='30' letter-spacing='6' font-weight='700' fill='#ffffff' opacity='0.55'>관점형 서베이 · ${safe} / 10</text>
  <text x='800' y='470' text-anchor='middle' font-size='300'>${concept.icon}</text>
  <text x='800' y='650' text-anchor='middle' font-family='Pretendard, sans-serif' font-size='62' font-weight='800' fill='#ffffff' opacity='0.95'>${kw}</text>
  <rect x='690' y='700' width='220' height='6' rx='3' fill='${accent}' opacity='0.8'/>
  <text x='1490' y='830' text-anchor='end' font-family='Pretendard, sans-serif' font-size='200' font-weight='800' fill='#ffffff' opacity='0.10'>${safe}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
