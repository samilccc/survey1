import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import {
  SEED_QUESTIONS,
  SESSION_TITLE,
  SESSION_SUBTITLE,
} from "@/lib/seed";

export const runtime = "nodejs";

// 추측하기 어려운 진행자 키 생성 (32 hex chars)
function makeAdminKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// POST /api/sessions  → 새 세션 생성 + 기본 10문항 시드
// body(optional): { title?, description?, cloneFrom? }
export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body = await req.json().catch(() => ({}));

    const title: string = body.title?.trim() || SESSION_TITLE;
    const description: string = body.description?.trim() || SESSION_SUBTITLE;
    const adminKey = makeAdminKey();

    // 1) 세션 생성
    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .insert({
        title,
        description,
        status: "waiting",
        current_question_index: 0,
        is_voting_open: false,
        is_result_visible: false,
        allow_response_edit: false,
        admin_key: adminKey,
      })
      .select()
      .single();

    if (sErr || !session) {
      return NextResponse.json(
        { error: "세션 생성 실패", detail: sErr?.message },
        { status: 500 }
      );
    }

    // 2) 문항 시드 (복제 요청 시 원본 문항을 그대로 복사할 수도 있음)
    let seedRows;
    if (body.cloneFrom) {
      const { data: src } = await supabase
        .from("questions")
        .select("*")
        .eq("session_id", body.cloneFrom)
        .order("order", { ascending: true });
      seedRows = (src ?? []).map((q: any) => ({
        session_id: session.id,
        order: q.order,
        title: q.title,
        short_context: q.short_context,
        type: q.type,
        options: q.options,
        scale: q.scale,
        free_text_placeholder: q.free_text_placeholder,
        image_prompt: q.image_prompt,
        image_url: q.image_url,
        facilitator_note: q.facilitator_note,
        discussion_prompt: q.discussion_prompt,
        result_interpretation: q.result_interpretation,
        is_active: false,
      }));
    } else {
      seedRows = SEED_QUESTIONS.map((q) => ({
        session_id: session.id,
        order: q.order,
        title: q.title,
        short_context: q.short_context,
        type: q.type,
        options: q.options,
        scale: q.scale,
        free_text_placeholder: q.free_text_placeholder,
        image_prompt: q.image_prompt,
        image_url: null,
        facilitator_note: q.facilitator_note,
        discussion_prompt: q.discussion_prompt,
        result_interpretation: q.result_interpretation,
        is_active: false,
      }));
    }

    const { error: qErr } = await supabase.from("questions").insert(seedRows);
    if (qErr) {
      // 문항 시드 실패 시 세션 롤백
      await supabase.from("sessions").delete().eq("id", session.id);
      return NextResponse.json(
        { error: "문항 시드 실패", detail: qErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: session.id, adminKey });
  } catch (e: any) {
    return NextResponse.json(
      { error: "서버 오류", detail: e?.message },
      { status: 500 }
    );
  }
}
