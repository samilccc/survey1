// 결과 기반 '대화 가이드' — 결과값(승자 옵션 / 순위 1위 / 척도 구간)에 따라
// 방향성 + 팀원 심중 표현 + 즉석 토론 질문을 즉시(0초) 보여준다.
// DB 변경 없이 문항 order 로 매핑되는 정적 데이터.

import type { Question, Response } from "./types";
import { tallyChoice, tallyScale, tallyRanking } from "./tally";

export type Guide = { direction: string; sentiment: string; prompt: string };

// key: single/binary/ranking = 승자 옵션 index(문자열) 또는 "split"
//      scale = "low" | "mid" | "high"
const GUIDES: Record<number, Record<string, Guide>> = {
  1: {
    high: {
      direction:
        "대체로 지금 리듬이 편안하다는 신호예요. 큰 수술보다 미세 조정에 집중하면 됩니다.",
      sentiment: "“지금이 나쁘지 않은데, 굳이 크게 흔들 필요 있나?”",
      prompt: "그래도 딱 하나만 더 낫게 만든다면 무엇일까요?",
    },
    mid: {
      direction:
        "무난하지만 ‘딱 좋다’는 아니에요. 조용히 쌓인 개선 여지가 있을 수 있습니다.",
      sentiment: "“그럭저럭 굴러가긴 하는데, 애매하다.”",
      prompt: "‘보통’을 ‘좋다’로 끌어올리려면 무엇이 바뀌어야 할까요?",
    },
    low: {
      direction:
        "지금 리듬이 부담이라는 공통 신호예요. 오늘 대화가 실제 변화로 이어질 좋은 타이밍입니다.",
      sentiment: "“조금 벅차다. 내 시간이 부족하다.”",
      prompt: "가장 먼저 덜어내거나 바꾸고 싶은 미팅은 무엇인가요?",
    },
  },
  2: {
    "0": {
      direction:
        "‘시간의 총량’이 부담이라는 뜻이에요. 빈도(격주·온디맨드) 조정이 1순위 후보입니다.",
      sentiment: "“미팅이 너무 자주 돌아온다.”",
      prompt: "어떤 미팅부터 빈도를 조정해볼 수 있을까요?",
    },
    "1": {
      direction:
        "미팅 자체보다 ‘늘어짐’이 문제예요. 타임박스(25·50분)와 안건 압축이 효과적입니다.",
      sentiment: "“회의가 길어질수록 집중이 흐트러진다.”",
      prompt: "우리 미팅에 ‘종료 시간’을 정한다면 몇 분이 적당할까요?",
    },
    "2": {
      direction:
        "‘왜 모이는지’가 흐릿하다는 신호예요. 안건·목적을 미리 공유하는 규칙이 필요합니다.",
      sentiment: "“내가 왜 이 회의에 있는지 모를 때가 있다.”",
      prompt: "회의 전 ‘한 줄 목적’을 공유한다면 누가 언제 올릴까요?",
    },
    "3": {
      direction:
        "회의 자체보다 앞뒤(준비·정리)가 약한 것. 간단한 노트·액션 정리로 큰 효과가 납니다.",
      sentiment: "“회의는 했는데 뭐가 정해졌는지 흐릿하다.”",
      prompt: "회의 끝에 ‘결정·다음 액션 3줄’을 남긴다면 어디에 남길까요?",
    },
    "4": {
      direction: "큰 구조 변경보다 유지·미세 조정이 어울립니다.",
      sentiment: "“지금도 충분히 잘 되고 있다.”",
      prompt: "그래도 아주 작게 하나 더 낫게 만든다면?",
    },
    split: {
      direction: "개선 포인트가 갈렸어요 — 사람마다 아쉬운 지점이 다릅니다.",
      sentiment: "각자 다른 곳에서 아쉬움을 느끼고 있어요.",
      prompt: "가장 많이 나온 두 가지를 동시에 손보려면 무엇부터 시작할까요?",
    },
  },
  3: {
    "0": {
      direction:
        "트렌드톡이 가장 큰 도움을 줍니다 — 확실히 지켜야 할 시간이에요.",
      sentiment: "“새로운 걸 배우고 관점을 나누는 게 좋다.”",
      prompt: "트렌드톡의 좋은 점을, 다른 미팅에도 옮길 수 있을까요?",
    },
    "1": {
      direction:
        "대면 현황공유가 가장 도움된다는 결과. 형태보다 지금 리듬을 유지하는 게 맞아요.",
      sentiment: "“얼굴 보고 맞추는 게 안심된다.”",
      prompt: "이 가치를 지키면서 더 가볍게 만들 방법이 있을까요?",
    },
    "2": {
      direction:
        "실무에 밀착한 파트 미팅이 핵심. 전체 미팅은 더 가볍게 가도 된다는 힌트예요.",
      sentiment: "“내 일에 직접 닿는 대화가 제일 유용하다.”",
      prompt: "파트 미팅이 유용한 이유를, 전체 미팅에도 적용한다면?",
    },
    "3": {
      direction:
        "깊이 있는 팀스터디가 가장 도움된다는 결과. 월 1회의 밀도를 더 살릴 여지가 있어요.",
      sentiment: "“가끔 깊게 파는 시간이 진짜 남는다.”",
      prompt: "팀스터디의 깊이를, 정기 미팅에도 조금 나눠 넣을 수 있을까요?",
    },
    split: {
      direction:
        "도움의 순서가 사람마다 갈렸어요. ‘모두에게 똑같은 미팅’이 꼭 정답은 아닐 수 있습니다.",
      sentiment: "각자 필요한 미팅이 다릅니다.",
      prompt: "누구에게나 필수인 미팅과, 선택적으로 가도 될 미팅을 나눠본다면?",
    },
  },
  4: {
    "0": {
      direction:
        "이 미팅의 핵심은 ‘정서적 연결’. 비동기로 대체가 어려우니, 주기는 조정하되 대면은 지키는 게 좋아요.",
      sentiment: "“얼굴 보는 것 자체가 힘이 된다.”",
      prompt: "연결은 지키면서 현황 공유만 다른 방식으로 옮긴다면?",
    },
    "1": {
      direction:
        "가치가 ‘현황 동기화’에 있다면 — 비동기 업데이트·대시보드로 옮길 여지가 큽니다.",
      sentiment: "“정보만 맞으면 꼭 모여야 하나 싶다.”",
      prompt: "현황을 비동기로 옮기면, 대면 시간엔 무엇을 하면 좋을까요?",
    },
    "2": {
      direction:
        "빠른 논의·결정이 핵심이라면, 미팅을 ‘결정이 필요할 때’ 중심으로 재편할 수 있어요.",
      sentiment: "“막힌 걸 빨리 뚫는 자리가 필요하다.”",
      prompt: "결정할 게 없는 주엔, 이 미팅을 어떻게 하면 좋을까요?",
    },
    "3": {
      direction:
        "가치를 느끼기 어렵다는 신호 — 목적 재정의가 시급합니다. 없애기보다 ‘왜 모이는지’부터 다시 잡아요.",
      sentiment: "“솔직히 이 시간이 아깝게 느껴질 때가 있다.”",
      prompt: "이 미팅에 꼭 하나의 목적만 남긴다면 무엇이어야 할까요?",
    },
    split: {
      direction:
        "이 미팅의 가치가 사람마다 다르게 느껴져요 — 한 미팅이 여러 역할을 하고 있다는 뜻입니다.",
      sentiment: "누군가에겐 연결, 누군가에겐 현황이에요.",
      prompt: "한 미팅에 섞인 목적들을 분리하면 더 가벼워질까요?",
    },
  },
  5: {
    "0": {
      direction:
        "대면의 리듬 자체를 아낀다는 결과. 주기는 지키되 길이·안건을 손보는 방향이 좋아요.",
      sentiment: "“매주 보는 리듬이 팀을 붙잡아준다.”",
      prompt: "매주 유지하되, 딱 하나 더 가볍게 만든다면?",
    },
    "1": {
      direction:
        "격주 전환에 대한 합의가 보여요 — 4주 시범 운영으로 바로 실험해볼 만합니다.",
      sentiment: "“매주는 부담, 하지만 아예 없애긴 아쉽다.”",
      prompt: "격주로 바꾸면, 안 만나는 주엔 현황을 어떻게 나눌까요?",
    },
    "2": {
      direction:
        "‘필요할 때만’ 선호 — 고정 미팅보다 유연한 연결을 원한다는 신호예요.",
      sentiment: "“안건 없는 날 모이는 게 제일 아깝다.”",
      prompt: "‘안건이 있다’의 기준을 누가 어떻게 정하면 좋을까요?",
    },
    "3": {
      direction:
        "미팅은 유지하되 ‘밀도’를 원해요. 30분·타임박스가 바로 시도 가능한 해법입니다.",
      sentiment: "“있어도 되는데, 짧고 굵게 하자.”",
      prompt: "30분 안에 끝내려면 무엇을 빼야 할까요?",
    },
    split: {
      direction:
        "방식이 갈렸어요 — 팀이 아직 하나의 답을 찾지 못했다는 건강한 신호입니다.",
      sentiment: "각자 편한 리듬이 달라요.",
      prompt: "‘4주만 이렇게 해보자’ 하나를 정한다면 무엇으로 실험할까요?",
    },
  },
  6: {
    "0": {
      direction:
        "지금 우리는 ‘연결’에 더 무게를 둡니다. 효율화를 하더라도 얼굴 보는 시간은 지키는 설계가 맞아요.",
      sentiment: "“그래도 사람은 봐야 힘이 난다.”",
      prompt: "연결을 지키면서 효율을 높이는 방법은? (짧지만 자주 만나기 등)",
    },
    "1": {
      direction:
        "지금 우리는 ‘효율·몰입’을 더 원합니다. 몰입 보호·비동기 전환을 우선해도 좋다는 뜻이에요.",
      sentiment: "“집중할 시간이 더 절실하다.”",
      prompt: "효율을 높이되, 최소한의 연결은 어떻게 지킬까요?",
    },
    split: {
      direction:
        "팽팽하게 갈렸어요 — 둘 다 포기 못 한다는 뜻입니다. ‘둘 다 지키는 설계’가 답이에요.",
      sentiment: "“연결도 효율도 둘 다 소중하다.”",
      prompt: "연결과 효율을 한 번에 잡는 우리만의 방법을 하나 정한다면?",
    },
  },
  7: {
    default: {
      direction:
        "여기 모인 한 줄들이 곧 우리의 실행 목록이에요. 반복되는 키워드가 우선 과제입니다.",
      sentiment: "모두가 ‘이건 바꾸고 싶다’를 조심스레 꺼냈어요.",
      prompt: "가장 많이 나온 아이디어 하나를, 다음 주부터 4주만 시범 운영해볼까요?",
    },
  },
};

export function resolveGuide(q: Question, responses: Response[]): Guide | null {
  const map = GUIDES[q.order];
  if (!map) return null;
  if (responses.length === 0) return null;

  if (q.type === "free_text") return map.default ?? null;

  if (q.type === "scale") {
    const t = tallyScale(q, responses);
    const avg = t.average;
    const key = avg < 2.6 ? "low" : avg > 3.6 ? "high" : "mid";
    return map[key] ?? null;
  }

  if (q.type === "ranking") {
    const t = tallyRanking(q, responses);
    if (t.ranked.length === 0) return null;
    const top = t.ranked[0];
    const second = t.ranked[1];
    if (
      map.split &&
      second &&
      t.totalResponses >= 3 &&
      top.score - second.score < 0.6
    ) {
      return map.split;
    }
    return map[String(top.optionIndex)] ?? map.split ?? null;
  }

  // single_choice / binary
  const t = tallyChoice(q, responses);
  const order = t.counts.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
  const top = order[0];
  const second = order[1];
  if (
    map.split &&
    second &&
    t.totalResponses >= 3 &&
    top.c - second.c <= 1 &&
    top.c < t.totalResponses
  ) {
    return map.split;
  }
  return map[String(top.i)] ?? map.split ?? null;
}
