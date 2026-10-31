import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { OperationsLog } from "@/components/sections/OperationsLog";
import { CountUp } from "@/components/motion/CountUp";
import { site } from "@/content/site";
import { CtaBand } from "@/components/sections/CtaBand";
import { img } from "@/content/media";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/operaciones",
    title: t("operations"),
    description: t("operationsDescription"),
  });
}

export default async function OperationsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("operationsPage");
  const stats = [
    { label: t("statProjects"), value: "100+" },
    { label: t("statCountries"), value: String(site.areaServed.length), note: t("countriesNote") },
    { label: t("statSince"), value: String(site.founded) },
  ];
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} image={img("bell212-jungle")} />
      <section className="grain relative bg-hb-night pt-20 pb-10 text-white lg:pt-28">
        <div aria-hidden className="hairline-grid absolute inset-0" />
        <div className="container-hb relative">
          <dl className="grid grid-cols-3 gap-4 border-b border-white/10 pb-14 lg:pb-20">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="eyebrow text-white/50">{s.label}</dt>
                <dd className="mt-3 font-display text-[clamp(2.5rem,7vw,6rem)] leading-none font-medium text-white">
                  <CountUp value={s.value} />
                </dd>
                {s.note && <p className="mt-2 hidden text-sm text-white/50 sm:block">{s.note}</p>}
              </div>
            ))}
          </dl>
          <div className="mt-14 lg:mt-20">
            <OperationsLog />
          </div>
        </div>
      </section>
      <CtaBand quoteQuery={{ type: "energy" }} />
    </>
  );
}
