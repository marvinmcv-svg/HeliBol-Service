"use client";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, Send, X, Phone } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { HeliAvatar } from "./HeliAvatar";
import { HeliMessage } from "./HeliMessage";
import { HeliQuickReplies } from "./HeliQuickReplies";
import { useHeliChat, type ChatMessage } from "./useHeliChat";
import { site, whatsappHref } from "@/content/site";
import { video } from "@/content/media";
import { siWhatsapp } from "simple-icons";

const topicPrefill: Record<string, { es: string; en: string }> = {
  scenic: { es: "Quiero consultar un vuelo panorámico", en: "I'd like to ask about a scenic flight" },
  quote: { es: "Quiero cotizar un vuelo", en: "I'd like a quote for a flight" },
  fleet: { es: "¿Qué aeronave me recomiendan?", en: "Which aircraft would you recommend?" },
  turnkey: { es: "Me interesa un proyecto Turnkey", en: "I'm interested in a turnkey project" },
};

/** 400×640 glass dialog (full-screen sheet on mobile) with focus trap and polite live region (plan §8, §10). */
export function HeliPanel({ onClose, topic }: { onClose: () => void; topic?: string }) {
  const t = useTranslations("heli");
  const locale = useLocale() as "es" | "en";
  const { messages, send, busy, reset, userTurns } = useHeliChat(locale, t("greeting"));
  const [input, setInput] = useState("");
  const [local, setLocal] = useState<ChatMessage[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();
  const chips = t.raw("chips") as string[];
  const limitReached = userTurns >= 30;

  useEffect(() => {
    const pre = topic ? topicPrefill[topic]?.[locale] : undefined;
    if (pre) setInput(pre);
    if (topic === "emergency") showHandoff("emergency");
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, local]);

  // Focus trap + Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = f[0];
      const last = f[f.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function showHandoff(urgency: "normal" | "emergency") {
    const numbers = site.emergencyNumbers.map((n) => `${n.label[locale]} ${n.number}`).join(" · ");
    const content =
      urgency === "emergency"
        ? locale === "es"
          ? `Si hay una emergencia en curso, llame ahora a Helibol 24/7: ${site.phone}. Servicios de emergencia en Bolivia: ${numbers}.`
          : `If there's an active emergency, call Helibol 24/7 now: ${site.phone}. Emergency services in Bolivia: ${numbers}.`
        : locale === "es"
          ? "Con gusto. Puede hablar directamente con nuestro equipo:"
          : "Of course. You can reach our team directly:";
    setLocal((l) => [
      ...l,
      {
        id: `local-${Date.now()}`,
        role: "assistant",
        content,
        handoff: { urgency, phone: site.phone, phoneHref: site.phoneHref, whatsapp: whatsappHref() },
      },
    ]);
  }

  const onChip = (chip: string, i: number) => {
    if (i === 2) return showHandoff("emergency");
    if (i === 4) return showHandoff("normal");
    void send(chip, topic);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || limitReached) return;
    void send(input, topic);
    setInput("");
  };

  const all = [...messages, ...local];
  const last = messages.at(-1);

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-lenis-prevent
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-hb-night/95 text-white shadow-2xl backdrop-blur-2xl sm:inset-auto sm:right-5 sm:bottom-5 sm:h-[min(640px,calc(100svh-40px))] sm:w-[400px] sm:rounded-[28px] sm:border sm:border-white/10"
    >
      <header className="relative flex items-center gap-3 overflow-hidden border-b border-white/10 px-5 py-4">
        <video
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-10"
          src={video.cockpit.mp4}
          poster={video.cockpit.poster}
          muted
          loop
          autoPlay
          playsInline
        />
        <div className="relative">
          <HeliAvatar thinking={busy} />
        </div>
        <div className="relative min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-lg leading-tight font-medium">
            {t("title")}
          </h2>
          <p className="text-xs text-white/60">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setLocal([]);
          }}
          aria-label="Reset"
          className="relative rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("title") + " — close"}
          className="relative rounded-full p-2 text-white/80 hover:bg-white/10"
        >
          <X className="size-5" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
        <ul aria-live="polite" aria-relevant="additions text" className="flex flex-col gap-4">
          {all.map((m) => (
            <HeliMessage key={m.id} message={m} streaming={busy && m.id === last?.id} />
          ))}
        </ul>
        {userTurns === 0 && local.length === 0 && (
          <div className="mt-5 pl-9">
            <HeliQuickReplies chips={chips} onPick={onChip} disabled={busy} />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <form onSubmit={submit} className="flex items-end gap-2">
          <label className="sr-only" htmlFor={`${titleId}-input`}>
            {t("placeholder")}
          </label>
          <textarea
            id={`${titleId}-input`}
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={2000}
            disabled={limitReached}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={limitReached ? t("limit") : t("placeholder")}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[15px] placeholder:text-white/40 focus:border-hb-blue focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim() || limitReached}
            aria-label={t("send")}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hb-blue transition-opacity disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </form>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <p className="text-[11px] leading-snug text-white/40">{t("disclaimer")}</p>
          <div className="flex shrink-0 gap-1.5">
            <a
              href={site.phoneHref}
              aria-label={`${t("human")} — ${site.phone}`}
              className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"
            >
              <Phone className="size-3.5" />
            </a>
            {whatsappHref() && (
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t("human")} — WhatsApp`}
                className="flex size-8 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                  <path d={siWhatsapp.path} />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
