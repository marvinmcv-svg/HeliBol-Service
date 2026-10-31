"use client";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { UnitToggle, type UnitSystem } from "@/components/ui/UnitToggle";
import { Link } from "@/i18n/navigation";
import { fleet, specParts, specShare, type Spec } from "@/content/fleet";

const ROWS: Spec["key"][] = ["pax", "hook", "cruise", "engine"];

/** Side-by-side fleet comparison with the unit toggle and gauges against the fleet's best figure. */
export function FleetCompare() {
  const t = useTranslations("fleetPage");
  const locale = useLocale() as "es" | "en";
  const reduced = useReducedMotion();
  const [system, setSystem] = useState<UnitSystem>("metric");
  const label = (key: Spec["key"]) =>
    fleet.flatMap((a) => a.specs).find((s) => s.key === key)?.label[locale] ?? key;

  return (
    <div className="rounded-[28px] border border-line bg-white p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl font-medium tracking-tight">{t("compare")}</h2>
        <UnitToggle value={system} onChange={setSystem} label={t("compare")} />
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="w-[22%] pb-4" />
              {fleet.map((a) => (
                <th key={a.slug} scope="col" className="pb-4 pl-4 align-bottom">
                  <Link
                    href={`/flota/${a.slug}`}
                    className="group inline-flex flex-col transition-colors hover:text-hb-blue"
                  >
                    <span className="eyebrow text-ink-mute">{a.variants}</span>
                    <span className="mt-1 font-display text-xl font-medium">{a.model}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((key, r) => (
              <tr key={key} className="border-b border-line last:border-0">
                <th scope="row" className="py-5 pr-4 text-sm font-medium text-ink-soft">
                  {label(key)}
                </th>
                {fleet.map((a, c) => {
                  const s = a.specs.find((x) => x.key === key);
                  if (!s)
                    return (
                      <td key={a.slug} className="py-5 pl-4 text-ink-mute">
                        —
                      </td>
                    );
                  const p = specParts(s, system, locale);
                  const share = specShare(s);
                  const best = share === 1;
                  return (
                    <td key={a.slug} className="py-5 pl-4 align-top">
                      <span className="tabular text-lg font-medium">
                        {p.text ?? (
                          <>
                            {p.prefix}
                            <AnimatedNumber value={p.value!} locale={locale} delay={r * 0.1 + c * 0.05} />
                            <span className="text-ink-soft">{p.suffix}</span>
                          </>
                        )}
                      </span>
                      {share !== undefined && (
                        <span
                          aria-hidden
                          className="mt-2.5 block h-[3px] overflow-hidden rounded-full bg-hb-sky"
                        >
                          <motion.span
                            className={`block h-full origin-left rounded-full ${best ? "bg-hb-sunset" : "bg-hb-blue"}`}
                            initial={{ scaleX: reduced ? share : 0 }}
                            whileInView={{ scaleX: share }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 1.5,
                              ease: [0.16, 1, 0.3, 1],
                              delay: 0.2 + r * 0.1 + c * 0.05,
                            }}
                          />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm text-ink-mute">{t("specsNote")}</p>
    </div>
  );
}
