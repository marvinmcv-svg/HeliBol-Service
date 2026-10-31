"use client";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { formatSpec, type Spec } from "@/content/fleet";
import { cn } from "@/lib/utils";

/** Interactive spec table with a metric/imperial toggle (plan §7 fleet detail). */
export function SpecTable({ specs }: { specs: Spec[] }) {
  const t = useTranslations("fleetPage");
  const locale = useLocale() as "es" | "en";
  const [system, setSystem] = useState<"metric" | "imperial">("metric");
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="eyebrow font-sans text-hb-blue-ink">{t("specs")}</h2>
        <div
          role="radiogroup"
          aria-label={t("specs")}
          className="relative flex rounded-full border border-line p-1 text-sm"
        >
          {(["metric", "imperial"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={system === s}
              onClick={() => setSystem(s)}
              className={cn(
                "relative z-10 rounded-full px-4 py-1.5 font-semibold transition-colors",
                system === s ? "text-white" : "text-ink-soft",
              )}
            >
              {system === s && (
                <motion.span
                  layoutId="unit-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-hb-blue"
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                />
              )}
              {t(s)}
            </button>
          ))}
        </div>
      </div>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        {specs.map((s) => (
          <div key={s.key} className="flex items-baseline justify-between gap-6 py-4">
            <dt className="text-ink-soft">{s.label[locale]}</dt>
            <motion.dd
              key={`${s.key}-${system}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="tabular text-right text-lg font-medium"
            >
              {formatSpec(s, system, locale)}
            </motion.dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-ink-mute">{t("specsNote")}</p>
    </div>
  );
}
