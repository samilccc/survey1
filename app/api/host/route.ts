import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// POST /api/host
// body: { sessionId, adminKey, action, payload? }
// admin_key 가 일치할 때만 세션/문항을 변경합니다. (진행자 권한 경계)
export async function POST(req: NextRequest) {
  try {
    const supabase = getAdminClient();
    const { sessionId, adminKey, action, payload } = await req.json();

    if (!sessionId || !adminKey || !action) {
      return NextResponse.json({ error: "필수 값 누락" }, { status: 400 });
    }

    // 진행자 키 검증
    const { data: session, error: sErr } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sErr || !session) {
      return NextResponse.json({ error: "세션 없음" }, { status: 404 });
    }
    if (session.admin_key !== adminKey) {
      return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    // 현재 문항 목록 (이동 범위 계산용)
    const { data: questions } = await supabase
      .from("questions")
      .select("id, order")
      .eq("session_id", sessionId)
      .order("order", { ascending: true });
    const maxIndex = Math.max(0, (questions?.length ?? 1) - 1);

    const clamp = (i: number) => Math.min(Math.max(i, 0), maxIndex);

    // 세션 패치 헬퍼
    const patchSession = async (patch: Record<string, any>) => {
      const { error } = await supabase
        .from("sessions")
        .update(patch)
        .eq("id", sessionId);
      if (error) throw new Error(error.message);
    };

    switch (action) {
      case "start":
        await patchSession({ status: "active" });
        break;
      case "end":
        await patchSession({
          status: "ended",
          is_voting_open: false,
        });
        break;
      case "open_vote":
        await patchSession({ is_voting_open: true });
        break;
      case "close_vote":
        await patchSession({ is_voting_open: false });
        break;
      case "reveal":
        await patchSession({ is_result_visible: true });
        break;
      case "hide":
        await patchSession({ is_result_visible: false });
        break;
      case "next":
        await patchSession({
          current_question_index: clamp(session.current_question_index + 1),
          is_voting_open: false,
          is_result_visible: false,
        });
        break;
      case "prev":
        await patchSession({
          current_question_index: clamp(session.current_question_index - 1),
          is_voting_open: false,
          is_result_visible: false,
        });
        break;
      case "goto":
        await patchSession({
          current_question_index: clamp(Number(payload?.index ?? 0)),
          is_voting_open: false,
          is_result_visible: false,
        });
        break;
      case "set_edit":
        await patchSession({ allow_response_edit: !!payload?.value });
        break;
      case "reset_responses": {
        // 특정 문항(payload.questionId) 또는 세션 전체 응답 초기화
        let del = supabase.from("responses").delete().eq("session_id", sessionId);
        if (payload?.questionId) del = del.eq("question_id", payload.questionId);
        const { error } = await del;
        if (error) throw new Error(error.message);
        await patchSession({ is_result_visible: false });
        break;
      }
      case "edit_question": {
        // 문항 편집 (요구사항 12)
        const { questionId, fields } = payload ?? {};
        if (!questionId || !fields) {
          return NextResponse.json({ error: "편집 값 누락" }, { status: 400 });
        }
        const allowed = [
          "title",
          "short_context",
          "options",
          "scale",
          "free_text_placeholder",
          "image_prompt",
          "image_url",
          "facilitator_note",
          "discussion_prompt",
          "result_interpretation",
        ];
        const patch: Record<string, any> = {};
        for (const k of allowed) if (k in fields) patch[k] = fields[k];
        const { error } = await supabase
          .from("questions")
          .update(patch)
          .eq("id", questionId)
          .eq("session_id", sessionId);
        if (error) throw new Error(error.message);
        break;
      }
      case "reorder": {
        // 문항 순서 변경 (요구사항 12): payload.orders = [{ id, order }]
        const orders: { id: string; order: number }[] = payload?.orders ?? [];
        for (const o of orders) {
          await supabase
            .from("questions")
            .update({ order: o.order })
            .eq("id", o.id)
            .eq("session_id", sessionId);
        }
        break;
      }
      default:
        return NextResponse.json({ error: "알 수 없는 action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "서버 오류", detail: e?.message },
      { status: 500 }
    );
  }
}
