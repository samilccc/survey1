// 외부 이미지 API 없이도 문항 카드가 어느 기기에서나 선명하게 보이도록,
// 직접 그린 벡터(SVG) 아이콘 일러스트를 사용합니다. (밝고 산뜻한 팔레트)
// 실제 사진을 쓰려면 public/q/ 폴더에 01.png ~ 11.png(또는 .jpg)를 넣으면 자동 우선 표시됩니다.

const ICONS: Record<number, string> = {
  // 1. 게이지 — 우리 미팅 리듬(양)
  1: `<path d='M22 62 A28 28 0 0 1 78 62'/><path d='M50 62 L66 40'/><circle cx='50' cy='62' r='4' fill='#fff' stroke='none'/><path d='M25 58 l4 -1 M50 34 v4 M75 58 l-4 -1' stroke='ACCENT'/>`,
  // 2. 반짝임 — 더 낫게 만들기
  2: `<path d='M50 26 L55 45 L74 50 L55 55 L50 74 L45 55 L26 50 L45 45 Z'/><path d='M72 28 v9 M67.5 32.5 h9' stroke='ACCENT'/>`,
  // 3. 포디엄+별 — 지키고 싶은 순서
  3: `<rect x='28' y='48' width='12' height='24' rx='3'/><rect x='44' y='36' width='12' height='36' rx='3'/><rect x='60' y='56' width='12' height='16' rx='3'/><path d='M50 20 l2.6 5.4 6 .7 -4.4 4.1 1.2 5.9 -5.4 -2.9 -5.4 2.9 1.2 -5.9 -4.4 -4.1 6 -.7 Z' fill='ACCENT' stroke='none'/>`,
  // 4. 두 사람 — 얼굴 보는 연결
  4: `<circle cx='36' cy='44' r='10'/><circle cx='64' cy='44' r='10'/><path d='M22 72 q14 -15 28 0'/><path d='M50 72 q14 -15 28 0'/><circle cx='50' cy='40' r='3.5' fill='ACCENT' stroke='none'/>`,
  // 5. 캘린더 — 수요일 주기
  5: `<rect x='24' y='28' width='52' height='46' rx='6'/><path d='M24 41 H76'/><path d='M37 22 V32 M63 22 V32'/><circle cx='40' cy='53' r='3' fill='ACCENT' stroke='none'/><circle cx='52' cy='53' r='3' fill='#fff' stroke='none'/><circle cx='64' cy='53' r='3' fill='#fff' stroke='none'/><circle cx='40' cy='64' r='3' fill='#fff' stroke='none'/><circle cx='52' cy='64' r='3' fill='ACCENT' stroke='none'/>`,
  // 6. 저울 — 연결 vs 효율
  6: `<path d='M50 24 V70 M38 72 H62 M28 34 H72'/><path d='M28 34 L22 50 a8 8 0 0 0 12 0 Z'/><path d='M72 34 L66 50 a8 8 0 0 0 12 0 Z'/><circle cx='50' cy='28' r='3.5' fill='ACCENT' stroke='none'/>`,
  // 7. 말풍선+전구 — 나의 아이디어
  7: `<path d='M24 30 H70 a7 7 0 0 1 7 7 V57 a7 7 0 0 1 -7 7 H44 L32 74 V64 H24 a7 7 0 0 1 -7 -7 V37 a7 7 0 0 1 7 -7 Z'/><path d='M47 40 a7 7 0 0 1 5 12 c-1 1 -1.5 2 -1.5 3.5 h-7 c0 -1.5 -.5 -2.5 -1.5 -3.5 a7 7 0 0 1 5 -12 Z' stroke='ACCENT'/>`,
  // 8. 종+진동 — 무엇이 끊는가
  8: `<path d='M50 26 a13 13 0 0 0 -13 13 v8 l-5 8 h36 l-5 -8 v-8 a13 13 0 0 0 -13 -13 Z'/><path d='M45 63 a5 5 0 0 0 10 0'/><path d='M71 34 l6 -4 M73 46 l7 0 M71 58 l6 4' stroke='ACCENT'/>`,
  // 9. 방패+체크 — 몰입을 지키는 법
  9: `<path d='M50 22 L74 32 V52 C74 66 63 74 50 78 C37 74 26 66 26 52 V32 Z'/><path d='M40 50 l7 7 14 -15' stroke='ACCENT'/>`,
  // 10. 저울 — 연결 vs 효율
  10: `<path d='M50 24 V70 M38 72 H62 M28 34 H72'/><path d='M28 34 L22 50 a8 8 0 0 0 12 0 Z'/><path d='M72 34 L66 50 a8 8 0 0 0 12 0 Z'/><circle cx='50' cy='28' r='3.5' fill='ACCENT' stroke='none'/>`,
  // 11. 말풍선+전구 — 나의 아이디어
  11: `<path d='M24 30 H70 a7 7 0 0 1 7 7 V57 a7 7 0 0 1 -7 7 H44 L32 74 V64 H24 a7 7 0 0 1 -7 -7 V37 a7 7 0 0 1 7 -7 Z'/><path d='M47 40 a7 7 0 0 1 5 12 c-1 1 -1.5 2 -1.5 3.5 h-7 c0 -1.5 -.5 -2.5 -1.5 -3.5 a7 7 0 0 1 5 -12 Z' stroke='ACCENT'/>`,
};

const KEYWORDS: Record<number, string> = {
  1: "우리의 미팅 리듬",
  2: "더 낫게 만들기",
  3: "가장 도움이 되는",
  4: "얼굴을 보는 가치",
  5: "수요일, 어떻게?",
  6: "연결 vs 효율",
  7: "나의 아이디어",
  8: "무엇이 끊는가",
  9: "몰입을 지키는 법",
  10: "연결 vs 효율",
  11: "나의 아이디어",
};

// 밝고 산뜻한 그라데이션 (흰 텍스트가 읽히도록 중간 채도 유지)
const PALETTES: [string, string, string][] = [
  ["#1E5BD6", "#22A7E6", "#FFE08A"],
  ["#0E9AA0", "#1FBBA6", "#FFD98A"],
  ["#4F46E5", "#6D5FEA", "#FFD98A"],
  ["#2563EB", "#2AA5E8", "#FFE08A"],
  ["#0891B2", "#1FC0C9", "#FFD98A"],
  ["#5B54E6", "#8A7DF0", "#FFDA4D"],
];

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function placeholderDataUri(order: number, label?: string): string {
  const [c1, c2, accent] = PALETTES[(order - 1 + PALETTES.length) % PALETTES.length];
  const iconRaw = ICONS[order] ?? ICONS[11];
  const icon = iconRaw.replace(/ACCENT/g, accent);
  const keyword = esc(KEYWORDS[order] ?? label ?? "우리의 시간");
  const idA = `gA${order}`;
  const idB = `gB${order}`;
  const safe = String(order).padStart(2, "0");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='${idA}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${c1}'/>
      <stop offset='1' stop-color='${c2}'/>
    </linearGradient>
    <radialGradient id='${idB}' cx='0.82' cy='0.2' r='0.95'>
      <stop offset='0' stop-color='#ffffff' stop-opacity='0.28'/>
      <stop offset='1' stop-color='#ffffff' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#${idA})'/>
  <rect width='1600' height='900' fill='url(#${idB})'/>
  <circle cx='250' cy='770' r='250' fill='#ffffff' opacity='0.07'/>
  <text x='112' y='150' font-family='Pretendard, sans-serif' font-size='30' letter-spacing='6' font-weight='700' fill='#ffffff' opacity='0.7'>우리의 시간 · ${safe} / 7</text>
  <g transform='translate(620,150) scale(3.6)' fill='none' stroke='#ffffff' stroke-width='4.2' stroke-linecap='round' stroke-linejoin='round'>${icon}</g>
  <text x='800' y='700' text-anchor='middle' font-family='Pretendard, sans-serif' font-size='62' font-weight='800' fill='#ffffff' opacity='0.98'>${keyword}</text>
  <rect x='700' y='742' width='200' height='6' rx='3' fill='${accent}'/>
  <text x='1490' y='840' text-anchor='end' font-family='Pretendard, sans-serif' font-size='190' font-weight='800' fill='#ffffff' opacity='0.12'>${safe}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
