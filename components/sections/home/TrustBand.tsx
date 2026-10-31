import { getTranslations } from "next-intl/server";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { yearsFlying } from "@/content/site";

/** Four odometer stats on a glass strip + scroll-velocity marquee (plan §6.3, M7/M11). */
export async function TrustBand() {
  const t = await getTranslations("home");
  const stats = [
    { value: String(yearsFlying), label: t("stats.years") },
    { value: "100+", label: t("stats.projects") },
    { value: "3", label: t("stats.countries"), note: t("stats.countriesNote") },
    { value: "24/7", label: t("stats.emergency") },
  ];
  return (
    <section className="relative z-10 -mt-px bg-hb-night pt-4 text-white lg:pt-10">
      <div className="container-hb">
        <div className="glass grid grid-cols-2 overflow-hidden rounded-[28px] lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="border-white/10 p-6 not-last:border-r max-lg:even:border-r-0 max-lg:nth-[n+3]:border-t sm:p-8"
            >
              <div className="font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-none font-medium tracking-tight">
                <CountUp value={s.value} />
              </div>
              <span aria-hidden className="mt-4 block h-0.5 w-8 bg-hb-sunset" />
              <p className="mt-3 text-sm text-white/75">{s.label}</p>
              {s.note && <p className="eyebrow mt-1 text-[10px] text-white/45">{s.note}</p>}
            </Reveal>
          ))}
        </div>
      </div>
      <Marquee
        items={t.raw("marquee") as string[]}
        className="eyebrow mt-12 border-y border-white/10 py-5 text-[13px] text-white/60 lg:mt-16"
      />
    </section>
  );
}
