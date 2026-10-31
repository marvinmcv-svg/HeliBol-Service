import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { BoliviaMap } from "@/components/sections/BoliviaMap";
import { operations } from "@/content/operations";

/** "Ya hemos estado ahí" (plan §6.7). */
export async function OperationsMap() {
  const t = await getTranslations("home.map");
  const locale = (await getLocale()) as "es" | "en";
  const years = [...new Set(operations.map((o) => o.year))].sort((a, b) => b - a);
  return (
    <section className="grain relative overflow-hidden bg-hb-blue-deep py-24 text-white lg:py-32">
      <div aria-hidden className="hairline-grid absolute inset-0" />
      <div className="container-hb relative grid items-center gap-12 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} dark />
          <Reveal delay={0.2}>
            <ol className="mt-10 space-y-5 border-l border-white/15 pl-6">
              {years.map((y) => (
                <li key={y}>
                  <p className="eyebrow tabular text-hb-sunset">{y}</p>
                  <p className="mt-1 text-white/85">
                    {operations
                      .filter((o) => o.year === y)
                      .map((o) => o.name)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <Button href="/operaciones" variant="ghost">
                {t("cta")}
              </Button>
            </div>
          </Reveal>
        </div>
        <BoliviaMap baseLabel={locale === "es" ? "BASE" : "BASE"} className="mx-auto w-full max-w-[640px]" />
      </div>
    </section>
  );
}
