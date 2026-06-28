# 복지일까, 투자일까 — 실시간 관점형 서베이 툴

> 팀미팅용 **대화 촉진형 실시간 서베이 도구**. 발표자가 짧은 인사이트 브리핑을 한 뒤, 팀원들이 모바일로 익명 투표하고, 발표자가 원하는 타이밍에 결과를 공개하며 서로의 관점 차이를 확인합니다. 주제는 *“출산·육아 복지는 복지인가, 인재 전략인가?”* 입니다.

정답을 맞히는 퀴즈가 아니라, **정답 없는 관점형 서베이**입니다. 결과가 갈릴수록 좋은 대화가 만들어지도록 설계했습니다.

---

## 1. 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| 프론트엔드 | Next.js 14 (App Router) + TypeScript + Tailwind CSS | GitHub→Vercel 무중단 배포, 발표자/참가자 화면 분리, 빠른 MVP |
| 실시간/DB | Supabase (Postgres + Realtime) | 다기기 실시간 동기화 + 익명 참여 + RLS, 무료 티어로 충분 |
| 차트 | Recharts | 막대/도넛/분포/랭킹/좌우대비 등 유형별 시각화 |
| 배포 | Vercel | env 변수만 넣으면 즉시 배포 |

실시간 동기화 구조: 참가자/발표자 모두 Supabase **anon 키**로 읽기 + Realtime 구독을 합니다. 세션 진행 권한(투표 열기·닫기, 결과 공개, 문항 이동 등)은 Next.js **API Route**가 **service-role 키**로 처리하며, 세션마다 발급되는 `admin_key`(32자리 hex)로 보호됩니다.

---

## 2. 빠른 시작 (로컬)

### 사전 준비
- Node.js 18.17+ (또는 20+)
- 무료 [Supabase](https://supabase.com) 계정

### ① 의존성 설치
```bash
npm install
```

### ② Supabase 프로젝트 만들기
1. [supabase.com](https://supabase.com) → **New project** 생성 (Region은 가까운 곳, 예: Northeast Asia).
2. 좌측 **SQL Editor** → **New query** → 이 저장소의 [`supabase/schema.sql`](supabase/schema.sql) 전체 내용을 붙여넣고 **Run**.
   - 4개 테이블(`sessions`, `questions`, `participants`, `responses`), RLS 정책, Realtime publication, 트리거가 한 번에 생성됩니다.
3. **Project Settings → API** 에서 아래 3개 값을 확인합니다.
   - `Project URL`
   - `anon` `public` 키
   - `service_role` `secret` 키 (절대 외부 노출 금지)

### ③ 환경변수 설정
`.env.example` 을 복사해 `.env.local` 을 만들고 값을 채웁니다.
```bash
cp .env.example .env.local
```
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...        # anon public 키
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...            # service_role secret 키 (서버 전용)
```
> `NEXT_PUBLIC_` 접두사가 붙은 값만 브라우저에 노출됩니다. service-role 키에는 **절대** 접두사를 붙이지 마세요.

### ④ 실행
```bash
npm run dev
```
`http://localhost:3000` 접속 → **새 세션 시작하기** 클릭 → 자동으로 발표자 화면(`/host/[id]?key=...`)으로 이동합니다.

---

## 3. 배포 (Vercel)

1. 이 프로젝트를 GitHub 저장소에 push 합니다.
2. [vercel.com](https://vercel.com) → **Add New Project** → 해당 저장소 import.
3. **Environment Variables** 에 위 3개 값(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)을 그대로 등록합니다.
4. **Deploy**. 빌드가 끝나면 발급된 도메인(예: `https://your-app.vercel.app`)이 그대로 발표/참가 주소가 됩니다.

별도 백엔드 서버는 필요 없습니다. (Supabase가 DB+실시간을 담당)

---

## 4. 사용 흐름

### 발표자 (노트북 / 발표 화면)
1. 랜딩 페이지에서 **새 세션 시작하기** → 발표자 화면으로 이동.
2. **대기 화면**: 큰 QR 코드 + 참가 URL + 현재 접속자 수. 5~7분 브리핑 후 **브리핑 후 시작**.
3. **진행 화면**: 문항 이미지·제목·설명 + 하단 컨트롤바.
   - `투표 열기 / 닫기`, `결과 공개 / 숨기기`, `이전 / 다음`
   - 우측 패널: 진행자 노트, 토론 질문, 결과 해석, 보조 컨트롤(응답 초기화, 수정 허용 토글, CSV/JSON 다운로드, 세션 종료)
   - 상단: `응답 n명 / 접속 n명` 실시간, 전체화면(⛶) 버튼
4. **종료 화면**: 전체 문항 결과 요약 + CSV/JSON 다운로드 + 다시 진행.

### 참가자 (모바일 전용)
QR 스캔 → (닉네임 선택, 랜덤 생성 가능) → 한 화면에 한 문항 → 큰 버튼으로 응답 → 제출 완료 → 발표자가 결과를 공개하면 자신의 응답 + 전체 분포 확인.

---

## 5. 발표자 URL vs 참가자 URL (보안 모델)

| | URL 형태 | 권한 |
|---|---|---|
| 발표자 | `/host/[sessionId]?key=ADMIN_KEY` | 32자리 hex 키를 가진 사람만 진행 가능 |
| 참가자 | `/join/[sessionId]` | QR로 공유, 익명 응답만 가능 |

- `admin_key` 는 세션 생성 시 서버에서 무작위 생성되어 **발표자 URL에만** 들어갑니다. 추측이 사실상 불가능합니다.
- 모든 진행 권한 작업은 API Route에서 `admin_key` 일치를 검증한 뒤 service-role로만 수행됩니다. 참가자는 키가 없으므로 세션을 조작할 수 없습니다.
- **MVP 한계(의도된 단순화)**: RLS가 응답 읽기를 허용하므로, 기술적으로 숙련된 참가자가 개발자 도구로 결과 공개 전 응답을 조회할 가능성은 있습니다. 신뢰 기반 팀미팅 용도에서는 충분히 안전하며, 앱 UI는 공개 전까지 결과를 절대 보여주지 않습니다. 외부 대규모 공개가 필요하면 아래 *향후 확장*의 RLS 강화를 참고하세요.

---

## 6. 데이터 모델

`supabase/schema.sql` 에 정의된 4개 테이블입니다.

- **sessions** — `id`, `title`, `description`, `status`(waiting/active/ended), `current_question_index`, `is_voting_open`, `is_result_visible`, `allow_response_edit`, `admin_key`, `created_at`, `updated_at`
- **questions** — `id`, `session_id`, `order`, `title`, `short_context`, `type`(single_choice/scale/ranking/binary/free_text), `options`(jsonb), `scale`(jsonb), `free_text_placeholder`, `image_prompt`, `image_url`, `facilitator_note`, `discussion_prompt`, `result_interpretation`, `is_active`
- **participants** — `id`, `session_id`, `nickname`, `joined_at`, `device_type`, `user_agent`
- **responses** — `id`, `session_id`, `question_id`, `participant_id`, `answer`(jsonb), `created_at` · `UNIQUE(question_id, participant_id)` 로 1인 1응답(수정 시 upsert)

**응답(answer) 인코딩**
| 유형 | 저장 형태 | 예 |
|------|-----------|-----|
| single_choice / binary | 선택지 인덱스(number) | `2` |
| scale | 점수(number) | `4` |
| ranking | 선호순 인덱스 배열(number[]) | `[2,0,4,1,3,5]` |
| free_text | 문자열 | `"유연근무 기준"` |

**집계 로직** (`lib/tally.ts`): 단일/양자=득표 카운트, 척도=평균+분포, 순위=가중점수(1순위 = N점), 자유입력=한/영 토큰화 → 워드 빈도 + 카드 목록.

---

## 7. 기본 문항 데이터 (seed)

`lib/seed.ts` 에 세션 제목·부제와 **10개 문항**이 모두 들어 있습니다 (Q1~Q10, 유형별 한국어 제목/설명/선택지/이미지 프롬프트/진행자 노트/토론 질문/결과 해석 포함). 세션을 새로 만들면 이 시드가 자동으로 DB에 복제됩니다.

문항을 바꾸려면 `lib/seed.ts` 의 `SEED_QUESTIONS` 배열을 수정하면 됩니다. 진행 중에는 발표자 화면의 **문항 편집 / 순서 변경** 기능으로도 조정할 수 있습니다.

---

## 8. 문항 이미지 교체 방법

각 문항은 `image_prompt`(영문 생성 프롬프트)와 `image_url`(실제 이미지 주소)을 가집니다.

- `image_url` 이 비어 있으면 → 문항 번호·테마 컬러 기반의 **16:9 SVG 그라데이션 더미**가 자동 표시됩니다 (`lib/placeholderImage.ts`). 그대로 발표해도 어색하지 않습니다.
- 실제 이미지를 넣으려면:
  1. `image_prompt` 를 그대로 **DALL·E / Midjourney / Imagen** 등에 입력해 16:9 이미지를 생성.
  2. 생성한 이미지를 Supabase Storage(또는 임의의 CDN/`public/` 폴더)에 업로드.
  3. `lib/seed.ts` 의 해당 문항 `image_url` 에 주소를 채우거나, 발표자 **문항 편집** 기능으로 입력.

자동화하려면 세션 생성 API에서 이미지 생성 API를 호출해 `image_url` 을 채우도록 확장할 수 있습니다.

---

## 9. 관리자 추가 기능

문항 편집·순서 변경, 세션 복제(시드 또는 기존 세션 복제), 결과 초기화(문항별/전체), QR 다운로드(PNG), 전체화면 모드, 결과 공개 토글, 응답 마감 후 재오픈, 랜덤 닉네임, 다크모드(발표자=딥블루 보드룸 / 참가자=따뜻한 라이트), 자유입력 비속어 플래그(자동 삭제가 아닌 진행자 검토용 마스킹) 가 포함되어 있습니다.

---

## 10. 향후 확장 아이디어

- **실시간 접속자(Presence)**: 현재 “접속자 수”는 누적 참여자 기준입니다. Supabase Realtime Presence로 진짜 동시 접속 인원으로 교체 가능.
- **RLS 강화**: 결과 공개 전 응답 조회를 서버 RPC로만 허용해 MVP 한계 제거.
- **이미지 자동 생성**: 세션 생성 시 이미지 API 연동.
- **다국어**: 영어 세션/문항 토글.
- **세션 템플릿 라이브러리**: 주제별 문항 세트 저장·재사용.
- **결과 리포트 PDF**: 세션 종료 후 요약을 PDF로 내보내기.
- **발표자 인증 강화**: 매직링크/조직 SSO 연동(현재는 URL 키 기반).

---

## 11. 스크립트

```bash
npm run dev     # 로컬 개발
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # 린트
```

## 12. 디렉터리 구조

```
app/
  page.tsx                  # 랜딩 (새 세션 시작)
  host/[sessionId]/         # 발표자 화면 (대기/진행/종료)
  join/[sessionId]/         # 참가자 모바일 화면
  api/sessions/             # 세션 생성 + 시드 (service-role)
  api/host/                 # 진행 권한 작업 (admin_key 검증)
components/
  QRDisplay, QuestionImage
  charts/ResultChart, FreeTextCloud
lib/
  seed.ts                   # 세션 제목·부제 + 10개 문항
  types.ts, tally.ts, export.ts, profanity.ts
  placeholderImage.ts, nickname.ts
  supabaseClient.ts, supabaseAdmin.ts, useSurvey.ts
supabase/
  schema.sql                # 테이블 + RLS + Realtime + 트리거
```
