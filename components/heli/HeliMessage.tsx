"use client";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Phone } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import type { ChatMessage } from "./useHeliChat";
import { HeliAvatar } from "./HeliAvatar";
import { LeadCard } from "./LeadCard";
import { cn } from "@/lib/utils";

export function HeliMessage({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const t = useTranslations("heli");
  const mine = message.role === "user";
  const errorText =
    message.error === "rate_limited"
      ? t("rateLimited")
      : message.error === "limit"
        ? t("limit")
        : message.error
          ? t("error")
          : null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn("flex gap-2.5", mine && "flex-row-reverse")}
    >
      {!mine && <HeliAvatar thinking={streaming && !message.content} size="size-7" />}
      <div className={cn("flex max-w-[85%] flex-col gap-2", mine && "items-end")}>
        {(message.content || (!mine && streaming)) && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap",
              mine ? "rounded-br-md bg-hb-blue text-white" : "rounded-bl-md bg-white/[0.07] text-white/90",
            )}
          >
            {message.content || <span className="text-white/50">{t("thinking")}</span>}
          </div>
        )}
        {errorText && (
          <p className="rounded-2xl bg-hb-rescue/15 px-4 py-2.5 text-sm text-white/90">{errorText}</p>
        )}
        {message.lead && <LeadCard reference={message.lead} />}
        {message.handoff && (
          <div className="flex flex-wrap gap-2">
            <a
              href={message.handoff.phoneHref}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                message.handoff.urgency === "emergency"
                  ? "animate-pulse bg-hb-rescue text-white"
                  : "bg-white text-hb-night",
              )}
            >
              <Phone className="size-4" aria-hidden />
              {message.handoff.urgency === "emergency" ? t("emergencyCall") : message.handoff.phone}
            </a>
            {message.handoff.whatsapp && (
              <a
                href={message.handoff.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                  <path d={siWhatsapp.path} />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </motion.li>
  );
}
