// 데이터 모델 타입 정의
// 요구사항 5번 데이터 모델을 그대로 반영합니다.

export type SessionStatus = "waiting" | "active" | "ended";

export type QuestionType =
  | "single_choice"
  | "scale"
  | "ranking"
  | "binary"
  | "free_text";

export interface Session {
  id: string;
  title: string;
  description: string;
  status: SessionStatus;
  current_question_index: number;
  is_voting_open: boolean;
  is_result_visible: boolean;
  allow_response_edit: boolean; // 제출 후 수정 가능 여부 (기본 false)
  admin_key: string; // 진행자 비밀 키 (참가자에게 노출되지 않음)
  created_at: string;
  updated_at: string;
}

export interface ScaleMeta {
  min: number;
  max: number;
  labels: Record<number, string>; // { 1: "거의 영향 없다", ... }
}

export interface Question {
  id: string;
  session_id: string;
  order: number;
  title: string;
  short_context: string;
  type: QuestionType;
  options: string[]; // single_choice / ranking / binary 선택지. scale/free_text 는 빈 배열
  scale?: ScaleMeta | null; // scale 문항 전용
  free_text_placeholder?: string | null; // free_text 안내/예시
  image_prompt: string;
  image_url: string | null; // 비어 있으면 SVG 플레이스홀더 사용
  facilitator_note: string;
  discussion_prompt: string;
  result_interpretation: string;
  is_active: boolean;
}

export interface Participant {
  id: string;
  session_id: string;
  nickname: string | null;
  joined_at: string;
  device_type: string;
  user_agent: string | null;
}

// answer 는 문항 유형별로 형태가 다릅니다.
// single_choice / binary : 선택지 index (number)
// scale                  : 점수 (number, min~max)
// ranking                : 선택지 index 배열, 선호 순서대로 (number[])
// free_text              : 입력 텍스트 (string)
export type Answer = number | number[] | string;

export interface Response {
  id: string;
  session_id: string;
  question_id: string;
  participant_id: string;
  answer: Answer;
  created_at: string;
}

// 세션 생성 시 클라이언트로 돌려주는 정보
export interface CreatedSession {
  sessionId: string;
  adminKey: string;
}
