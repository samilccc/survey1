// 외부 이미지 API 없이도 문항 카드가 어느 기기에서나 선명하게 보이도록,
// 이모지 대신 직접 그린 벡터(SVG) 아이콘 일러스트를 사용합니다.
// 실제 사진을 쓰려면 public/q/ 폴더에 01.png ~ 10.png(또는 .jpg)를 넣으면 자동 우선 표시됩니다.

type Concept = { icon: string; keyword: string };

// 각 아이콘은 0~100 좌표계의 stroke 기반 선화. group 에서 흰색 stroke 로 통일 렌더.
const ICONS: Record<number, string> = {
  // 1. 나침반 — 어디서부터 보는가(관점)
  1: `<circle cx='50' cy='50' r='34'/><path d='M50 30 L59 50 L50 70 L41 50 Z' fill='#fff' stroke='none'/><circle cx='50' cy='50' r='4' fill='ACCENT' stroke='none'/>`,
  // 2. 하트+맥박 — 마음을 움직이는 것
  2: `<path d='M50 72 C22 52 28 28 50 41 C72 28 78 52 50 72 Z'/><path d='M30 49 H41 L45 41 L51 57 L55 49 H70' stroke='ACCENT'/>`,
  // 3. 아기 — 현금과 출산 결정
  3: `<circle cx='50' cy='52' r='28'/><path d='M50 22 q9 -2 7 8' /><circle cx='42' cy='50' r='2.8' fill='#fff' stroke='none'/><circle cx='58' cy='50' r='2.8' fill='#fff' stroke='none'/><path d='M43 60 q7 6 14 0'/>`,
  // 4. 말 못하는 말풍선 — 제도와 현실의 간극
  4: `<path d='M26 30 H74 a8 8 0 0 1 8 8 V58 a8 8 0 0 1 -8 8 H46 L34 78 V66 H26 a8 8 0 0 1 -8 -8 V38 a8 8 0 0 1 8 -8 Z'/><path d='M34 34 L70 62' stroke='ACCENT'/>`,
  // 5. 퍼즐 조각 — 공백과 책임
  5: `<path d='M34 34 H46 a6 6 0 1 1 8 0 H66 V46 a6 6 0 1 1 0 8 V66 H54 a6 6 0 1 0 -8 0 H34 V54 a6 6 0 1 0 0 -8 Z'/>`,
  // 6. 말굽 자석 — 복지와 리텐션
  6: `<path d='M32 30 V54 a18 18 0 0 0 36 0 V30'/><path d='M32 30 H46 V54 a4 4 0 0 0 8 0 V30 H68' fill='none'/><path d='M32 30 H46 M54 30 H68' stroke='ACCENT'/>`,
  // 7. 메달 — 가장 먼저 바꿀 것(우선순위 1위)
  7: `<path d='M40 26 L46 50 M60 26 L54 50' /><circle cx='50' cy='62' r='17'/><path d='M50 54 l2.6 5.4 6 .7 -4.4 4.1 1.2 5.9 -5.4 -2.9 -5.4 2.9 1.2 -5.9 -4.4 -4.1 6 -.7 Z' fill='ACCENT' stroke='none'/>`,
  // 8. 저울 — 제도 vs 문화
  8: `<path d='M50 24 V70 M38 72 H62 M28 34 H72' /><path d='M28 34 L22 50 a8 8 0 0 0 12 0 Z' fill='none'/><path d='M72 34 L66 50 a8 8 0 0 0 12 0 Z' fill='none'/><circle cx='50' cy='28' r='3.5' fill='ACCENT' stroke='none'/>`,
  // 9. 지구 — 모두의 이슈
  9: `<circle cx='50' cy='50' r='32'/><ellipse cx='50' cy='50' rx='14' ry='32'/><path d='M18 50 H82 M24 33 H76 M24 67 H76'/>`,
  // 10. 대화 말풍선 — 지금 나누고 싶은 말
  10: `<path d='M22 30 H58 a7 7 0 0 1 7 7 V53 a7 7 0 0 1 -7 7 H38 L28 70 V60 H22 a7 7 0 0 1 -7 -7 V37 a7 7 0 0 1 7 -7 Z'/><circle cx='32' cy='45' r='2.6' fill='#fff' stroke='none'/><circle cx='40' cy='45' r='2.6' fill='#fff' stroke='none'/><circle cx='48' cy='45' r='2.6' fill='#fff' stroke='none'/><path d='M62 44 H80 a6 6 0 0 1 6 6 V62 a6 6 0 0 1 -6 6 H74 V76 L66 68 H62' stroke='ACCENT'/>`,
};

const KEYWORDS: Record<number, string> = {
  1: "어디서부터 보는가",
  2: "마음을 움직이는 것",
  3: "현금과 출산 결정",
  4: "제도와 현실의 간극",
  5: "공백과 책임",
  6: "복지와 리텐션",
  7: "가장 먼저 바꿀 것",
  8: "제도 vs 문화",
  9: "모두의 이슈",
  10: "지금 나누고 싶은 말",
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
  const [c1, c2, accent] = PALETTES[(order - 1 + PALETTES.length) % PALETTES.length];
  const iconRaw = ICONS[order] ?? ICONS[10];
  const icon = iconRaw.replace(/ACCENT/g, accent);
  const keyword = esc(KEYWORDS[order] ?? label ?? "관점형 서베이");
  const idA = `gA${order}`;
  const idB = `gB${order}`;
  const safe = String(order).padStart(2, "0");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='${idA}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${c1}'/>
      <stop offset='1' stop-color='${c2}'/>
    </linearGradient>
    <radialGradient id='${idB}' cx='0.8' cy='0.22' r='0.95'>
      <stop offset='0' stop-color='${accent}' stop-opacity='0.45'/>
      <stop offset='1' stop-color='${accent}' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#${idA})'/>
  <rect width='1600' height='900' fill='url(#${idB})'/>
  <circle cx='250' cy='770' r='250' fill='#ffffff' opacity='0.04'/>
  <text x='112' y='150' font-family='Pretendard, sans-serif' font-size='30' letter-spacing='6' font-weight='700' fill='#ffffff' opacity='0.5'>관점형 서베이 · ${safe} / 10</text>
  <g transform='translate(620,150) scale(3.6)' fill='none' stroke='#ffffff' stroke-width='4.2' stroke-linecap='round' stroke-linejoin='round'>${icon}</g>
  <text x='800' y='700' text-anchor='middle' font-family='Pretendard, sans-serif' font-size='62' font-weight='800' fill='#ffffff' opacity='0.96'>${keyword}</text>
  <rect x='700' y='742' width='200' height='6' rx='3' fill='${accent}'/>
  <text x='1490' y='840' text-anchor='end' font-family='Pretendard, sans-serif' font-size='190' font-weight='800' fill='#ffffff' opacity='0.09'>${safe}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
