// 익명 랜덤 닉네임 생성 (요구사항 12). 차분하고 따뜻한 톤.
const ADJ = [
  "차분한", "다정한", "사려깊은", "든든한", "유연한", "성실한",
  "솔직한", "너그러운", "단단한", "꼼꼼한", "포근한", "신중한",
];
const NOUN = [
  "동료", "팀원", "리더", "관찰자", "기획자", "조율가",
  "응원단", "탐험가", "대화가", "설계자", "안내자", "파트너",
];

export function randomNickname(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a} ${n}${num}`;
}
