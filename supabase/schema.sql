-- =====================================================================
-- 복지일까, 투자일까 — 실시간 서베이 툴 / Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 실행하세요.
-- =====================================================================

-- UUID 생성 함수 (대부분의 Supabase 프로젝트에 기본 활성화되어 있음)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 테이블
-- ---------------------------------------------------------------------

create table if not exists public.sessions (
  id                      uuid primary key default gen_random_uuid(),
  title                   text not null,
  description             text not null default '',
  status                  text not null default 'waiting',  -- waiting | active | ended
  current_question_index  int  not null default 0,
  is_voting_open          boolean not null default false,
  is_result_visible       boolean not null default false,
  allow_response_edit     boolean not null default false,   -- 제출 후 수정 허용 (기본 false)
  admin_key               text not null,                    -- 진행자 비밀 키 (참가자 노출 X)
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists public.questions (
  id                      uuid primary key default gen_random_uuid(),
  session_id              uuid not null references public.sessions(id) on delete cascade,
  "order"                 int  not null,
  title                   text not null,
  short_context           text not null default '',
  type                    text not null,  -- single_choice | scale | ranking | binary | free_text
  options                 jsonb not null default '[]'::jsonb,
  scale                   jsonb,
  free_text_placeholder   text,
  image_prompt            text not null default '',
  image_url               text,
  facilitator_note        text not null default '',
  discussion_prompt       text not null default '',
  result_interpretation   text not null default '',
  is_active               boolean not null default false
);

create index if not exists questions_session_order_idx
  on public.questions(session_id, "order");

create table if not exists public.participants (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.sessions(id) on delete cascade,
  nickname    text,
  joined_at   timestamptz not null default now(),
  device_type text not null default 'unknown',
  user_agent  text
);

create index if not exists participants_session_idx
  on public.participants(session_id);

create table if not exists public.responses (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.sessions(id) on delete cascade,
  question_id     uuid not null references public.questions(id) on delete cascade,
  participant_id  uuid not null references public.participants(id) on delete cascade,
  answer          jsonb not null,
  created_at      timestamptz not null default now()
);

create index if not exists responses_question_idx
  on public.responses(question_id);
create index if not exists responses_session_idx
  on public.responses(session_id);

-- 한 참가자가 한 문항에 1회만 응답 (수정 허용 시 앱에서 update/upsert 처리)
create unique index if not exists responses_unique_participant_question
  on public.responses(question_id, participant_id);

-- ---------------------------------------------------------------------
-- RLS (Row Level Security)
--   * 읽기 / 실시간 구독은 anon 에게 허용 (참가자·발표 화면 모두 필요)
--   * 참가자 join(participants insert), 응답(responses insert/update) 허용
--   * 세션/문항 변경은 클라이언트에서 막음 → 서버(API Route, service_role)로만 수행
-- ---------------------------------------------------------------------

alter table public.sessions     enable row level security;
alter table public.questions    enable row level security;
alter table public.participants enable row level security;
alter table public.responses    enable row level security;

-- 읽기 허용
create policy "read sessions"     on public.sessions     for select using (true);
create policy "read questions"    on public.questions    for select using (true);
create policy "read participants" on public.participants for select using (true);
create policy "read responses"    on public.responses    for select using (true);

-- 참가자 join
create policy "join participants" on public.participants for insert with check (true);

-- 응답 작성 / 수정 (수정 허용 옵션은 앱 로직에서 제어)
create policy "create responses"  on public.responses    for insert with check (true);
create policy "update responses"  on public.responses    for update using (true) with check (true);

-- 주의: sessions / questions 에 대한 insert/update/delete 정책은 일부러 만들지 않습니다.
--       => anon 클라이언트는 세션/문항을 변경할 수 없고, 서버의 service_role 만 가능합니다.

-- ---------------------------------------------------------------------
-- Realtime (Postgres Changes 구독을 위한 publication 등록)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.responses;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.questions;

-- updated_at 자동 갱신 트리거 (선택)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists sessions_touch on public.sessions;
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();
