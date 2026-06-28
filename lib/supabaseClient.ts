import { createClient } from "@supabase/supabase-js";

// 브라우저(클라이언트)용 Supabase 클라이언트.
// 공개 anon 키를 사용하며, 읽기 / 실시간 구독 / 참가자 응답 insert 에 쓰입니다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // 빌드 타임 경고용. 실제 값은 .env.local 또는 Vercel 환경변수에서 주입됩니다.
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다."
  );
}

export const supabase = createClient(url || "http://localhost", anonKey || "anon", {
  realtime: { params: { eventsPerSecond: 10 } },
});
