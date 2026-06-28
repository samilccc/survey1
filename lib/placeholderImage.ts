// 외부 이미지 API 없이도 문항 카드가 보기 좋도록,
// 문항 order 에 따라 결정적(deterministic)으로 16:9 SVG 그라데이션 플레이스홀더를 생성합니다.
// 추후 image_url 에 AI 생성 이미지 URL 을 넣으면 자동으로 교체됩니다.
// (요구사항 3-5: imagePrompt 필드 보관 + 기본 더미 이미지 + 교체 가능 구조)

const PALETTES: [string, string, string][] = [
  ["#0E1E44", "#1B3A8A", "#F4A28C"],
  ["#16295C", "#3B6BFF", "#E7C26A"],
  ["#0E1E44", "#7BB4B0", "#F4A28C"],
  ["#1B3A8A", "#5C84FF", "#FBF7F0"],
  ["#081229", "#2B53E6", "#7BB4B0"],
];

export function placeholderDataUri(order: number, label: string): string {
  const [c1, c2, accent] = PALETTES[order % PALETTES.length];
  const idA = `gA${order}`;
  const idB = `gB${order}`;
  const safe = String(order).padStart(2, "0");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='${idA}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${c1}'/>
      <stop offset='1' stop-color='${c2}'/>
    </linearGradient>
    <radialGradient id='${idB}' cx='0.8' cy='0.2' r='0.9'>
      <stop offset='0' stop-color='${accent}' stop-opacity='0.55'/>
      <stop offset='1' stop-color='${accent}' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#${idA})'/>
  <rect width='1600' height='900' fill='url(#${idB})'/>
  <circle cx='1280' cy='230' r='160' fill='${accent}' opacity='0.18'/>
  <circle cx='300' cy='700' r='220' fill='#ffffff' opacity='0.06'/>
  <g opacity='0.9'>
    <text x='90' y='760' font-family='Pretendard, sans-serif' font-size='220' font-weight='800' fill='#ffffff' opacity='0.14'>${safe}</text>
  </g>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
