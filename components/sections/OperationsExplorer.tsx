"use client";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { BoliviaMap } from "./BoliviaMap";
import { operations } from "@/content/operations";
import { cn } from "@/lib/utils";

/** Full map + filterable project list by year, sector and region (plan §7 Operaciones). */
export function OperationsExplorer() {
  const t = useTranslations("operationsPage");
  const locale = useLocale() as "es" | "en";
  const years = useMemo(() => [...new Set(operations.map((o) => o.year))].sort((a, b) => b - a), []);
  const regions = useMemo(() => [...new Set(operations.map((o) => o.region))].sort(), []);
  const [year, setYear] = useState<number | "all">("all");
  const [region, setRegion] = useState<string | "all">("all");
  const items = operations.filter(
    (o) => (year === "all" || o.year === year) && (region === "all" || o.region === region),
  );

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border-hb-sunset bg-hb-sunset text-hb-night"
        : "border-white/20 text-white/75 hover:border-white/50",
    );

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <fieldset>
          <legend className="eyebrow text-white/50">{t("year")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={year === "all"}
              className={chip(year === "all")}
              onClick={() => setYear("all")}
            >
              {t("all")}
            </button>
            {years.map((y) => (
              <button
                key={y}
                type="button"
                aria-pressed={year === y}
                className={cn(chip(year === y), "tabular")}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="eyebrow text-white/50">{t("region")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={region === "all"}
              className={chip(region === "all")}
              onClick={() => setRegion("all")}
            >
              {t("all")}
            </button>
            {regions.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={region === r}
                className={chip(region === r)}
                onClick={() => setRegion(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-6">
          <legend className="eyebrow text-white/50">{t("sector")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={chip(true)}>{t("energy")}</span>
          </div>
        </fieldset>

        <p className="eyebrow mt-10 text-hb-sunset" aria-live="polite">
          {t("count", { count: items.length })}
        </p>
        <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
          <AnimatePresence initial={false}>
            {items.map((o) => (
              <motion.li
                key={o.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-baseline justify-between gap-6 py-4"
              >
                <div>
                  <p className="text-lg font-medium">{o.name}</p>
                  <p className="text-sm text-white/60">{o.description[locale]}</p>
                </div>
                <div className="text-right">
                  <p className="tabular font-display text-xl text-hb-sunset">{o.year}</p>
                  <p className="text-xs text-white/50">{o.region}</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {items.length === 0 && <li className="py-6 text-white/60">{t("empty")}</li>}
        </ul>
      </div>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <BoliviaMap key={`${year}-${region}`} items={items} baseLabel="BASE" />
      </div>
    </div>
  );
}
