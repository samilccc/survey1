import type { QuestionType, ScaleMeta } from "./types";

// 세션 메타
export const SESSION_TITLE = "우리의 시간, 다시 디자인하다";
export const SESSION_SUBTITLE =
  "우리 팀 미팅을 ‘더 적은 부담 · 더 큰 가치’로 — 함께 그리는 실시간 서베이";

export interface SeedQuestion {
  order: number;
  title: string;
  short_context: string;
  type: QuestionType;
  options: string[];
  scale: ScaleMeta | null;
  free_text_placeholder: string | null;
  image_prompt: string;
  facilitator_note: string;
  discussion_prompt: string;
  result_interpretation: string;
}

export const SEED_QUESTIONS: SeedQuestion[] = [
  {
    order: 1,
    title: "우리 팀 미팅, 지금 이 정도면 적당한가요?",
    short_context:
      "좋고 나쁨을 가리는 게 아니라, 지금 우리 리듬이 나에게 맞는지 솔직하게 재보는 온도계입니다.",
    type: "scale",
    options: [],
    scale: {
      min: 1,
      max: 5,
      labels: {
        1: "전혀 그렇지 않다",
        2: "그렇지 않다",
        3: "보통이다",
        4: "그렇다",
        5: "매우 그렇다",
      },
    },
    free_text_placeholder: null,
    image_prompt:
      "A bright cheerful editorial illustration of a friendly analog gauge measuring team rhythm, soft sky blue and mint gradient, sunny yellow accent, light optimistic mood, flat modern vector, 16:9, no text, no logos, no faces",
    facilitator_note:
      "첫 문항은 분위기를 여는 온도계입니다. 평균과 분포로 우리 팀의 현재 체감을 가볍게 함께 봅니다.",
    discussion_prompt:
      "같은 팀인데도 점수가 갈린다면, 그 차이는 어디서 올까요? (역할·파트·업무 성격 등)",
    result_interpretation:
      "평균이 높으면(4~5) 지금 리듬이 대체로 맞다고 느끼는 것이고, 낮으면(1~2) 미팅 양·방식이 부담이라는 공통 신호입니다. 분포가 넓으면 역할·파트별로 체감이 크게 다르다는 뜻입니다.",
  },
  {
    order: 2,
    title: "미팅 시간을 더 값지게 쓸 수 있다면, 가장 개선하고 싶은 건?",
    short_context:
      "무엇을 ‘줄이자’가 아니라, 무엇을 ‘더 낫게’ 만들지 고르는 질문입니다.",
    type: "single_choice",
    options: [
      "횟수(빈도)",
      "길이(소요 시간)",
      "목적·안건의 명확성",
      "준비와 후속 정리",
      "지금도 충분히 좋아요",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A bright optimistic illustration of a hand polishing a glowing calendar block until it sparkles, sky blue and soft coral gradient, sunny highlights, cheerful flat vector, 16:9, no text, no logos, no faces",
    facilitator_note:
      "‘지금도 충분히 좋아요’를 당당히 고를 수 있게 안내해주세요. 특정 미팅을 지목하지 않고 개선 포인트만 모읍니다.",
    discussion_prompt:
      "가장 많이 나온 개선 포인트 하나를, 다음 주부터 당장 시도한다면 어떻게 바꿔볼 수 있을까요?",
    result_interpretation:
      "횟수·길이에 몰리면 ‘시간의 총량’이, 목적·준비에 몰리면 ‘미팅의 질’이 핵심 이슈입니다. ‘충분히 좋아요’가 많으면 큰 구조 변경보다 미세 조정이 어울립니다.",
  },
  {
    order: 3,
    title: "모두가 함께하는 정기 미팅 중, 나에게 가장 도움이 되는 순서대로 놓아주세요.",
    short_context:
      "없애고 싶은 걸 고르는 게 아니라, 나에게 실제로 도움이 되는 시간부터 꼽아보는 질문입니다.",
    type: "ranking",
    options: [
      "트렌드톡 (월, 팀즈)",
      "수요 현황공유 (대면)",
      "파트 미팅",
      "월간 팀스터디",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A bright friendly illustration of four glowing time-blocks arranged in order of helpfulness, mint and sky gradient, sunny star accents, playful light mood, flat modern vector, 16:9, no text, no logos, no faces",
    facilitator_note:
      "순위는 ‘도움의 크기’를 드러냅니다. 하위에 놓였다고 ‘없애자’가 아니라, ‘형태를 바꿔볼 후보’로 부드럽게 해석해주세요.",
    discussion_prompt:
      "상위에 놓인 미팅은 무엇을 주기에 도움이 되나요? 하위 미팅은 그 도움을 다른 방식으로도 채울 수 있을까요?",
    result_interpretation:
      "상위로 모인 미팅은 우리 팀에 실제 도움이 되는 시간입니다. 하위로 모인 미팅은 ‘형태(주기·길이·방식)’를 먼저 재설계해볼 후보입니다.",
  },
  {
    order: 4,
    title: "매주 수요일 대면 현황공유, 나에게 가장 큰 가치는?",
    short_context:
      "이 미팅의 ‘진짜 가치’가 어디에 있는지 알면, 그 가치는 지키고 나머지는 가볍게 만들 수 있습니다.",
    type: "single_choice",
    options: [
      "서로 얼굴 보고 연결되는 것",
      "업무 현황을 맞추는 것",
      "빠르게 논의·결정하는 것",
      "솔직히 큰 가치를 느끼기 어렵다",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A warm bright illustration of abstract figures gathering around a sunny round table, connection and warmth, soft coral and sky gradient, cheerful inviting, flat modern vector, 16:9, no text, no logos, no realistic faces",
    facilitator_note:
      "이 문항은 미팅을 평가하려는 게 아니라 ‘연결의 가치’와 ‘현황의 가치’를 분리해 보기 위한 것입니다. 솔직한 응답이 재설계의 열쇠입니다.",
    discussion_prompt:
      "만약 이 미팅의 핵심 가치가 ‘연결’이라면, 현황 공유는 다른 방식으로 옮겨도 그 연결이 유지될까요?",
    result_interpretation:
      "‘연결’에 몰리면 대면의 정서적 가치가 크므로 형태보다 주기 조정이 어울립니다. ‘현황 동기화’에 몰리면 비동기·대시보드로 대체할 여지가 큽니다. ‘가치를 느끼기 어렵다’가 있으면 목적 재정의가 필요합니다.",
  },
  {
    order: 5,
    title: "지금 우리 시점에서, 수요 현황공유는 어떻게 하면 좋을까요?",
    short_context:
      "가정이 아니라, 지금 우리 상황에 비춰 가장 맞는 방식을 골라주세요.",
    type: "single_choice",
    options: [
      "지금처럼 매주 유지",
      "격주로 진행",
      "안건이 있을 때만 (온디맨드)",
      "30분 이하로 짧게 유지",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A bright cheerful illustration of a calendar with some weeks glowing and some resting, flexible rhythm, mint and sky gradient, sunny accents, light optimistic mood, flat modern vector, 16:9, no text, no logos, no faces",
    facilitator_note:
      "이 문항이 이번 세션의 핵심 의사결정 재료입니다. ‘매주 유지’도 당당한 선택지임을 강조해주세요.",
    discussion_prompt:
      "가장 많이 나온 방식을 4주만 시범 운영해본다면, 무엇을 기준으로 ‘성공’이라고 판단할 수 있을까요?",
    result_interpretation:
      "격주·온디맨드에 몰리면 주기 유연화에 대한 합의가 있는 것입니다. ‘매주 유지’가 많으면 대면의 리듬 자체를 아낀다는 뜻이니, 대신 길이·안건을 손보는 방향이 좋습니다.",
  },
  {
    order: 6,
    title: "우리 미팅을 다시 디자인한다면, 더 지켜야 할 가치는?",
    short_context:
      "둘 다 소중하지만, 지금 우리에게 조금 더 무게가 실리는 쪽은 어디인가요?",
    type: "binary",
    options: [
      "서로 연결·유대 (얼굴 보고 함께)",
      "효율·몰입 (집중할 시간 확보)",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A bright balanced illustration of a friendly seesaw balancing a warm heart and a glowing focus clock, sky blue and coral gradient, sunny optimistic mood, flat modern vector, 16:9, no text, no logos, no faces",
    facilitator_note:
      "정답이 없는 균형 질문입니다. 팽팽히 갈리면 ‘둘 다 지키는 설계’로, 한쪽으로 쏠리면 그게 지금 우리 팀의 우선순위입니다.",
    discussion_prompt:
      "연결과 효율을 동시에 잡는 방법이 있을까요? (예: 짧지만 자주 얼굴 보기 / 몰아서 깊게 만나기)",
    result_interpretation:
      "‘연결’로 기울면 대면·정서적 시간을 지키되 형태를 가볍게, ‘효율’로 기울면 몰입 보호와 비동기 전환을 우선하는 방향이 팀의 뜻에 맞습니다.",
  },
  {
    order: 7,
    title: "우리 팀 미팅을 ‘더 적은 부담 + 더 큰 가치’로 만들 나의 아이디어 한 가지는?",
    short_context:
      "오늘의 대화를 실제 변화로 잇는, 가장 중요한 한 줄입니다. 길게 적어도 좋아요.",
    type: "free_text",
    options: [],
    scale: null,
    free_text_placeholder:
      "예: 수요 미팅은 격주로, 대신 팀 공간에 주간 업데이트를 올려요",
    image_prompt:
      "A bright cheerful illustration of a speech bubble with a glowing lightbulb, fresh idea and collaboration, sky blue and mint gradient, sunny sparkles, hopeful upbeat mood, flat modern vector, 16:9, no text, no logos, no faces",
    facilitator_note:
      "이 응답들이 곧 후속 액션 리스트입니다. 가장 많이 나온 키워드 1~2개를 즉석에서 골라 다음 스텝으로 이어가세요.",
    discussion_prompt:
      "나온 아이디어 중 ‘다음 주에 당장 해볼 수 있는 것’ 하나를 함께 고른다면?",
    result_interpretation:
      "반복되는 키워드가 팀의 우선 실행 과제입니다. 실현이 쉬운 것부터 하나 정해 4주 시범 운영 → 회고로 이어가면 좋습니다.",
  },
];
