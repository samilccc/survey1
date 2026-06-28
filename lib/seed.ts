import type { QuestionType, ScaleMeta } from "./types";

// 세션 메타
export const SESSION_TITLE = "복지일까, 투자일까: 출산·육아 지원의 새로운 의미";
export const SESSION_SUBTITLE =
  "IT·게임업계의 출산·육아 복지 트렌드를 통해 보는 조직문화와 리텐션의 변화";

// 새 세션 생성 시 DB에 함께 들어가는 문항 템플릿
// (id / session_id 는 서버에서 생성)
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
    title: "이 주제, 여러분은 어디에서부터 보이나요?",
    short_context:
      "방금 브리핑을 들은 직후, 출산·육아 복지를 어떤 관점에서 가장 먼저 바라보는지 확인합니다.",
    type: "single_choice",
    options: [
      "직원 개인을 위한 복리후생",
      "핵심 인재를 지키기 위한 리텐션 전략",
      "좋은 회사를 보여주는 채용 브랜딩",
      "기업이 감당해야 할 사회적 책임",
      "아직은 비용 부담이 더 크게 느껴진다",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A modern Korean office seminar scene, diverse employees looking at a large screen with the question \u201Cwelfare or investment\u201D represented by abstract icons, warm professional atmosphere, corporate insight session, pastel and deep blue color palette, 16:9, no logos, no real faces, refined editorial illustration style",
    facilitator_note:
      "첫 문항은 정답을 묻는 것이 아니라 관점의 출발점을 확인하기 위한 질문입니다. 결과가 갈릴수록 좋은 대화가 만들어집니다.",
    discussion_prompt:
      "같은 제도를 보고도 어떤 사람은 복지로, 어떤 사람은 투자로, 어떤 사람은 비용으로 봅니다. 왜 이런 차이가 생긴다고 생각하시나요?",
    result_interpretation:
      "복리후생 응답이 많으면 구성원 경험 중심의 인식이 강합니다. 리텐션 응답이 많으면 인재 전략 관점이 이미 공유되어 있습니다. 사회적 책임 응답이 많으면 조직의 역할을 넓게 보는 문화가 있습니다. 비용 부담 응답이 많으면 실행 가능성과 형평성 논의가 필요합니다.",
  },
  {
    order: 2,
    title: "가장 강력하게 마음을 움직이는 지원은 무엇인가요?",
    short_context:
      "크래프톤의 1억 원 지원 사례처럼 경제적 지원이 주목받지만, 실제 체감 가치는 사람마다 다를 수 있습니다.",
    type: "single_choice",
    options: [
      "출산·육아 관련 현금 지원",
      "육아휴직 기간 확대",
      "재택근무·유연근무",
      "어린이집·돌봄 인프라",
      "복귀 후 평가·승진 불이익 방지",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A balanced scale in a modern office, one side showing financial support icons, the other side showing time, childcare, flexibility, and fair evaluation icons, Korean workplace context, thoughtful employees in discussion, sophisticated corporate illustration, warm but professional, 16:9, no logos",
    facilitator_note:
      "이 문항은 \u201C돈이냐 시간이냐 문화냐\u201D를 직접 비교하게 만듭니다. 팀원들의 우선순위가 꽤 다르게 나올 가능성이 높습니다.",
    discussion_prompt:
      "내가 선택한 지원이 가장 중요하다고 느낀 이유는 무엇인가요? 실제로 제도를 사용하는 입장이라면 어떤 지원이 가장 안심이 될까요?",
    result_interpretation:
      "현금 지원이 많으면 즉각적이고 명확한 보상에 대한 니즈가 큽니다. 유연근무가 많으면 시간 통제권이 핵심입니다. 평가 불이익 방지가 많으면 제도보다 신뢰의 문제가 큽니다. 돌봄 인프라가 많으면 개인이 해결하기 어려운 현실 지원이 중요합니다.",
  },
  {
    order: 3,
    title: "\u201C1억 지원\u201D은 실제 출산 결정에 영향을 줄까요?",
    short_context:
      "강력한 현금 지원이 개인의 삶의 결정에 얼마나 영향을 줄 수 있다고 보는지 확인합니다.",
    type: "scale",
    options: [],
    scale: {
      min: 1,
      max: 5,
      labels: {
        1: "거의 영향 없다",
        2: "일부 참고는 된다",
        3: "어느 정도 영향 있다",
        4: "꽤 큰 영향이 있다",
        5: "결정에 매우 큰 영향을 준다",
      },
    },
    free_text_placeholder: null,
    image_prompt:
      "A symbolic crossroads illustration in a Korean city-office context, one path showing career continuity and another showing family planning, soft glowing financial support icon in the center, reflective and respectful tone, modern editorial illustration, 16:9, pastel blue and warm neutral palette, no text, no logos",
    facilitator_note:
      "민감한 주제이므로 개인의 실제 출산 계획을 묻는 것이 아니라, 제도의 영향력에 대한 인식을 묻는 질문임을 강조해주세요.",
    discussion_prompt:
      "금액이 충분히 크면 삶의 결정을 바꿀 수 있을까요? 아니면 돈보다 더 중요한 조건이 있을까요?",
    result_interpretation:
      "평균이 높으면 현금 지원의 상징성과 실질 영향력을 크게 보는 분위기입니다. 평균이 낮으면 출산 결정은 조직 복지만으로 움직이기 어렵다는 인식이 강합니다. 분포가 양극화되면 개인의 생애 단계와 가치관에 따라 인식 차이가 큽니다.",
  },
  {
    order: 4,
    title:
      "제도가 있어도 사람들이 마음 편히 쓰지 못하는 가장 큰 이유는 무엇일까요?",
    short_context:
      "제도와 실제 사용 사이의 간극이 어디에서 생기는지 확인합니다.",
    type: "single_choice",
    options: [
      "업무 공백을 남긴다는 부담",
      "동료에게 일이 몰릴 것 같은 미안함",
      "평가·승진에서 불이익을 받을 것 같은 불안",
      "리더가 진심으로 지지하지 않을 것 같은 느낌",
      "복귀 후 내 자리가 애매해질 것 같은 걱정",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A professional office worker standing between an open door labeled opportunity through visual symbols and a shadow of workplace pressure, team desks in the background, subtle emotional tension, respectful Korean corporate culture scene, modern warm illustration, 16:9, no actual text, no logos",
    facilitator_note:
      "이 문항은 제도와 실제 사용 사이의 간극을 드러내는 핵심 질문입니다. 결과를 공개한 뒤에는 \u201C그래서 문화가 중요하다\u201D는 메시지로 연결할 수 있습니다.",
    discussion_prompt:
      "우리 주변에서 제도를 쓰기 어렵게 만드는 신호는 어떤 것들이 있을까요? 말로는 허용되지만 실제로는 부담을 주는 장면은 무엇일까요?",
    result_interpretation:
      "업무 공백·동료 부담 응답이 많으면 팀 운영 구조의 문제가 큽니다. 평가 불이익 응답이 많으면 공정성 장치가 중요합니다. 리더 지지 응답이 많으면 관리자 행동이 제도 체감도를 좌우합니다. 복귀 불안 응답이 많으면 리보딩 프로그램이 필요합니다.",
  },
  {
    order: 5,
    title: "육아휴직자의 업무 공백은 누구의 책임에 가장 가까울까요?",
    short_context:
      "업무 공백을 바라보는 책임의 관점이 사람마다 어떻게 다른지 확인합니다.",
    type: "single_choice",
    options: [
      "휴직을 사용하는 개인",
      "팀장 또는 리더",
      "남아 있는 팀원 전체",
      "회사의 제도와 운영 시스템",
      "개인·팀·회사가 함께 나눠야 할 책임",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A round table in a Korean corporate meeting room with empty chair, manager, teammates, and company system represented by abstract connected icons, balanced responsibility theme, inclusive and thoughtful mood, modern editorial illustration, 16:9, no logos",
    facilitator_note:
      "의견 차이가 크게 날 수 있는 질문입니다. 누가 옳고 그른지 판단하지 말고, 책임을 바라보는 관점이 어떻게 다른지 확인하는 데 집중해주세요.",
    discussion_prompt:
      "개인의 생애 이벤트가 팀의 업무 운영에 영향을 줄 때, 조직은 어디까지 책임져야 할까요?",
    result_interpretation:
      "개인 응답이 많으면 자기책임 관점이 강합니다. 팀장 응답이 많으면 리더십의 조정 역할을 중시합니다. 회사 시스템 응답이 많으면 구조적 해결을 기대합니다. 공동 책임 응답이 많으면 성숙한 조직문화 논의로 확장하기 좋습니다.",
  },
  {
    order: 6,
    title:
      "좋은 육아 복지가 리텐션에 영향을 주는 가장 큰 이유는 무엇일까요?",
    short_context:
      "리텐션은 단순한 퇴사 방지가 아니라, 오래 머물 수 있는 이유를 만드는 일입니다.",
    type: "single_choice",
    options: [
      "경제적 부담을 줄여주기 때문에",
      "경력 단절 위험을 낮춰주기 때문에",
      "회사가 나를 책임진다는 신뢰를 주기 때문에",
      "장기적으로 일할 수 있는 삶의 구조를 만들어주기 때문에",
      "가족과 커리어를 선택지로 갈라놓지 않기 때문에",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A long bridge connecting career, family, trust, and future stability in a modern Korean workplace landscape, employees walking confidently across, warm light, strategic HR and retention concept, refined corporate illustration, 16:9, no logos, no real faces",
    facilitator_note:
      "리텐션은 단순히 \u201C퇴사 방지\u201D가 아니라, 장기적으로 머물 수 있는 이유를 만드는 것입니다.",
    discussion_prompt:
      "사람이 회사를 오래 다니게 되는 이유는 보상일까요, 신뢰일까요, 삶과 일의 지속 가능성일까요?",
    result_interpretation:
      "경제적 부담 응답이 많으면 보상 중심 리텐션 관점입니다. 경력 단절 응답이 많으면 커리어 지속성이 핵심입니다. 신뢰 응답이 많으면 조직과 구성원 간 심리적 계약이 중요합니다. 삶의 구조 응답이 많으면 장기적 일하는 방식의 문제로 볼 수 있습니다.",
  },
  {
    order: 7,
    title: "우리 조직이 하나만 먼저 바꿀 수 있다면 무엇이 우선일까요?",
    short_context:
      "모든 것을 한 번에 바꿀 수 없다면, 어디부터 시작하는 것이 가장 효과적인지 우선순위를 정합니다.",
    type: "ranking",
    options: [
      "더 강한 경제적 지원",
      "더 자유로운 유연근무",
      "육아휴직·복귀자에 대한 평가 보호",
      "대체인력·업무 재배분 시스템",
      "리더 대상 일·가정 양립 교육",
      "육아 중인 선배 롤모델 가시화",
    ],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "A strategic priority board in a modern office, sticky notes with abstract icons for money, time, fairness, staffing, leadership, role model, Korean employees arranging priorities together, collaborative and polished illustration, 16:9, no readable text, no logos",
    facilitator_note:
      "순위형 문항입니다. 결과는 1순위만 보지 말고 전체 가중 점수로 해석해주세요. 조직이 당장 할 수 있는 일과 장기적으로 필요한 일을 나눠 이야기하면 좋습니다.",
    discussion_prompt:
      "가장 먼저 바꿔야 할 것과 가장 오래 걸리지만 중요한 것은 같을까요, 다를까요?",
    result_interpretation:
      "유연근무·평가 보호가 상위라면 제도의 실사용성이 핵심입니다. 대체인력·업무 재배분이 상위라면 팀 운영 설계가 병목입니다. 리더 교육이 상위라면 제도보다 리더십 행동 변화가 필요합니다. 롤모델 가시화가 상위라면 문화적 신호와 사례 공유가 중요합니다.",
  },
  {
    order: 8,
    title: "\u201C좋은 제도\u201D와 \u201C좋은 문화\u201D 중 무엇이 먼저일까요?",
    short_context: "제도가 문화를 만들까요, 문화가 제도를 작동시킬까요?",
    type: "binary",
    options: ["좋은 제도가 먼저다", "좋은 문화가 먼저다"],
    scale: null,
    free_text_placeholder: null,
    image_prompt:
      "Two abstract pillars in a modern corporate hall, one representing policy and system, the other representing culture and trust, balanced tension, Korean workplace seminar mood, elegant editorial illustration, 16:9, deep blue and warm pastel palette, no logos, no text",
    facilitator_note:
      "둘 다 중요하지만 일부러 양자택일하게 만드는 문항입니다. 결과가 갈릴수록 토론이 좋아집니다.",
    discussion_prompt:
      "제도가 먼저 있어야 사람들이 안심할까요? 아니면 문화가 준비되어 있어야 제도가 실제로 작동할까요?",
    result_interpretation:
      "제도가 많으면 명확한 기준과 장치가 필요하다는 인식입니다. 문화가 많으면 리더십과 팀 분위기가 제도보다 강한 신호라는 인식입니다. 결과가 반반이면 \u201C제도는 최소 조건, 문화는 작동 조건\u201D으로 정리할 수 있습니다.",
  },
  {
    order: 9,
    title: "이 이슈가 부모 직원에게만 해당된다고 생각하시나요?",
    short_context:
      "출산·육아 복지를 특정 집단의 복지로 볼지, 조직 전체의 운영 과제로 볼지 확인합니다.",
    type: "scale",
    options: [],
    scale: {
      min: 1,
      max: 5,
      labels: {
        1: "거의 부모 직원 개인의 이슈다",
        2: "주로 당사자 중심 이슈다",
        3: "당사자와 팀 모두의 이슈다",
        4: "조직 운영 전반의 이슈다",
        5: "미래 인재 전략과 사회적 책임의 이슈다",
      },
    },
    free_text_placeholder: null,
    image_prompt:
      "A wide view of a modern Korean office ecosystem, parents, non-parents, managers, HR, and teammates connected by subtle lines, workplace support as shared system, inclusive and strategic mood, modern editorial illustration, 16:9, no logos",
    facilitator_note:
      "이 문항은 \u201C나와 직접 관련 있는가\u201D를 넘어 \u201C조직 전체에 어떤 의미가 있는가\u201D로 시야를 넓히는 역할을 합니다.",
    discussion_prompt:
      "부모가 아닌 구성원에게도 출산·육아 복지가 중요한 이유가 있을까요?",
    result_interpretation:
      "낮은 점수가 많으면 당사자 중심 복지로 인식됩니다. 중간 점수가 많으면 팀 운영 이슈로 인식됩니다. 높은 점수가 많으면 조직문화·인재전략·사회적 책임으로 확장해 볼 준비가 되어 있습니다.",
  },
  {
    order: 10,
    title: "지금 우리 팀에서 가장 먼저 이야기해보고 싶은 주제는 무엇인가요?",
    short_context:
      "오늘 주제를 듣고, 우리 팀에서 더 이야기해보고 싶은 키워드나 질문을 짧게 적어주세요.",
    type: "free_text",
    options: [],
    scale: null,
    free_text_placeholder:
      "예: 육아휴직자의 업무 공백 / 유연근무의 기준 / 복귀자의 평가 보호 / 동료 부담을 줄이는 방식 / 부모·비부모 형평성 / 제도보다 중요한 리더의 태도",
    image_prompt:
      "A calm closing scene of a Korean team meeting, employees sharing thoughts on cards around a table, warm professional lighting, reflective organizational culture workshop, modern inclusive editorial illustration, 16:9, no logos, no readable text",
    facilitator_note:
      "이 문항은 세션 마지막 회고가 아니라, 이후 팀 대화를 열기 위한 의제 수집용입니다. 결과는 워드클라우드 또는 카드형 목록으로 보여주세요.",
    discussion_prompt:
      "가장 많이 나온 키워드 1~2개를 골라 바로 짧게 이야기해보세요. \u201C왜 이 주제가 우리 팀에 중요할까?\u201D를 묻는 방식이 좋습니다.",
    result_interpretation:
      "반복적으로 등장하는 단어가 현재 팀의 진짜 관심사입니다. 민감한 표현은 익명성을 유지한 채 묶어서 보여주세요. 이 결과는 이후 조직문화 개선 과제나 후속 미팅 의제로 활용할 수 있습니다.",
  },
];
