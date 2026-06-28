import { createClient } from "@supabase/supabase-js";

// 서버(API Route)용 Supabase 클라이언트.
// service_role 키를 사용하므로 RLS 를 우회합니다. 절대 클라이언트로 노출 금지.
// 세션 생성 / 진행자 권한 작업에만 사용합니다.
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !serviceKey) {
    throw new Error(
      "서버 환경변수(NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
