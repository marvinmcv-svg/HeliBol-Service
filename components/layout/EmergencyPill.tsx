"use client";
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function EmergencyPill({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <a
      href={site.phoneHref}
      onClick={() => track("cta_call", { from: "emergency_pill" })}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-hb-rescue/50 bg-hb-rescue/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors hover:bg-hb-rescue hover:text-white",
        className,
      )}
      aria-label={`${t("emergencyPill")} ${site.phone}`}
    >
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-hb-rescue opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-hb-rescue" />
      </span>
      <Phone className="size-3" aria-hidden />
      <span>
        {t("emergencyPill")} · <span className="tabular">{site.phone}</span>
      </span>
    </a>
  );
}
