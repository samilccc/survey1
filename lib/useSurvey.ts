"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Participant, Question, Response, Session } from "./types";

// 세션 상태 구독 (current_question_index, is_voting_open, is_result_visible ...)
export function useSession(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single()
      .then(({ data }) => {
        if (mounted) {
          setSession((data as Session) ?? null);
          setLoading(false);
        }
      });

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new as Session);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, loading };
}

// 문항 목록 (정적 — 세션 시작 후 거의 변하지 않으므로 1회 로드 + 편집 시 재요청)
export function useQuestions(sessionId: string, refreshKey = 0) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("order", { ascending: true })
      .then(({ data }) => {
        if (mounted) setQuestions((data as Question[]) ?? []);
      });
    return () => {
      mounted = false;
    };
  }, [sessionId, refreshKey]);

  return questions;
}

// 특정 문항의 응답 실시간 구독 (insert/update/delete 반영)
export function useResponses(
  sessionId: string,
  questionId: string | null,
  enabled = true
) {
  const [responses, setResponses] = useState<Response[]>([]);
  const qRef = useRef(questionId);
  qRef.current = questionId;

  useEffect(() => {
    if (!enabled || !questionId) {
      setResponses([]);
      return;
    }
    let mounted = true;

    const load = () => {
      supabase
        .from("responses")
        .select("*")
        .eq("question_id", questionId)
        .then(({ data }) => {
          if (mounted) setResponses((data as Response[]) ?? []);
        });
    };
    load();

    const channel = supabase
      .channel(`responses-${questionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "responses",
          filter: `question_id=eq.${questionId}`,
        },
        () => {
          // insert/update/delete 모두 단순 재로딩으로 일관성 유지
          if (qRef.current === questionId) load();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId, questionId, enabled]);

  return responses;
}

// 참가자 수 실시간 구독 (접속자 수 = 누적 참여자)
export function useParticipants(sessionId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = () => {
      supabase
        .from("participants")
        .select("*")
        .eq("session_id", sessionId)
        .then(({ data }) => {
          if (mounted) setParticipants((data as Participant[]) ?? []);
        });
    };
    load();

    const channel = supabase
      .channel(`participants-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => load()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return participants;
}

// 진행자 권한 작업 호출 헬퍼
export async function hostAction(
  sessionId: string,
  adminKey: string,
  action: string,
  payload?: unknown
) {
  const res = await fetch("/api/host", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, adminKey, action, payload }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "요청 실패");
  }
  return res.json();
}
