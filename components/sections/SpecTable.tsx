"use client";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { UnitToggle, type UnitSystem } from "@/components/ui/UnitToggle";
import { specParts, specShare, type Spec } from "@/content/fleet";

/**
 * Spec sheet with a metric/imperial toggle. Rows draw in progressively on scroll, numbers count up
 * (and tween when the units change), and a hairline gauge shows each figure against the fleet's best.
 */
export function SpecTable({ specs }: { specs: Spec[] }) {
  const t = useTranslations("fleetPage");
  const locale = useLocale() as "es" | "en";
  const reduced = useReducedMotion();
  const [system, setSystem] = useState<UnitSystem>("metric");

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="eyebrow font-sans text-hb-blue-ink">{t("specs")}</h2>
        <UnitToggle value={system} onChange={setSystem} label={t("specs")} />
      </div>
      <ul className="mt-6 border-b border-line">
        {specs.map((s, i) => {
          const p = specParts(s, system, locale);
          const share = specShare(s);
          return (
            <motion.li
              key={s.key}
              className="relative py-5"
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.09 }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-line"
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.09 }}
              />
              <div className="flex items-baseline justify-between gap-6">
                <span className="text-ink-soft">{s.label[locale]}</span>
                <span className="tabular text-right text-lg font-medium">
                  {p.text ?? (
                    <>
                      {p.prefix}
                      <AnimatedNumber value={p.value!} locale={locale} delay={0.2 + i * 0.09} />
                      <motion.span
                        key={p.suffix}
                        initial={reduced ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block whitespace-pre text-ink-soft"
                      >
                        {p.suffix}
                      </motion.span>
                    </>
                  )}
                </span>
              </div>
              {share !== undefined && (
                <div aria-hidden className="mt-3 h-[3px] overflow-hidden rounded-full bg-hb-sky">
                  <motion.div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-hb-blue to-hb-sunset"
                    initial={{ scaleX: reduced ? share : 0 }}
                    whileInView={{ scaleX: share }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.09 }}
                  />
                </div>
              )}
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-ink-mute">{t("specsNote")}</p>
    </div>
  );
}
