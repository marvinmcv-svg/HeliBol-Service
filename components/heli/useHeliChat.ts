"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import type { HeliStreamEvent } from "@/app/api/heli/route";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  lead?: string;
  handoff?: { urgency: "normal" | "emergency"; phone: string; phoneHref: string; whatsapp: string };
  error?: "rate_limited" | "limit" | "bad_request" | "unavailable" | "refused";
};

const KEY = "hb-heli";
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

/** Chat state + NDJSON streaming client for /api/heli. Persists for the browser session. */
export function useHeliChat(locale: "es" | "en", greeting: string) {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as {
        id: string;
        messages: ChatMessage[];
      } | null;
      if (saved?.id) {
        setConversationId(saved.id);
        setMessages(saved.messages);
        return;
      }
    } catch {}
    setConversationId(uid());
    setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
  }, [greeting]);

  useEffect(() => {
    if (conversationId && !busy)
      sessionStorage.setItem(KEY, JSON.stringify({ id: conversationId, messages }));
  }, [conversationId, messages, busy]);

  const send = useCallback(
    async (text: string, topic?: string) => {
      const content = text.trim();
      if (!content || busy) return;
      const userMsg: ChatMessage = { id: uid(), role: "user", content };
      const replyId = uid();
      const history = [...messages, userMsg];
      setMessages([...history, { id: replyId, role: "assistant", content: "" }]);
      setBusy(true);
      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((ms) => ms.map((m) => (m.id === replyId ? fn(m) : m)));

      const ac = new AbortController();
      abortRef.current = ac;
      try {
        const res = await fetch("/api/heli", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            conversationId,
            locale,
            topic,
            leadCaptured: history.some((m) => m.lead),
            // The greeting is UI-only; the model introduces itself per the system prompt.
            messages: history
              .filter((m) => m.id !== "greeting" && m.content && !m.error)
              .map(({ role, content }) => ({ role, content })),
          }),
        });
        if (!res.ok || !res.body) {
          const j = (await res.json().catch(() => ({}))) as { code?: ChatMessage["error"] };
          patch((m) => ({ ...m, error: j.code ?? "unavailable" }));
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const ev = JSON.parse(line) as HeliStreamEvent;
            if (ev.type === "text") patch((m) => ({ ...m, content: m.content + ev.text }));
            else if (ev.type === "lead") {
              patch((m) => ({ ...m, lead: ev.reference }));
              track("heli_lead_captured");
            } else if (ev.type === "handoff") patch((m) => ({ ...m, handoff: ev }));
            else if (ev.type === "error") patch((m) => ({ ...m, error: ev.code }));
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") patch((m) => ({ ...m, error: "unavailable" }));
      } finally {
        patch((m) => ({ ...m, content: m.content.trim() }));
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, messages, conversationId, locale],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    sessionStorage.removeItem(KEY);
    setConversationId(uid());
    setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
  }, [greeting]);

  return { messages, send, busy, reset, userTurns: messages.filter((m) => m.role === "user").length };
}
