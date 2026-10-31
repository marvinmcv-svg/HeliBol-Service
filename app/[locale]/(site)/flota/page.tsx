import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { AircraftCard } from "@/components/sections/AircraftCard";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { Button } from "@/components/ui/Button";
import { fleet } from "@/content/fleet";
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
  return pageMetadata({ locale, path: "/flota", title: t("fleet"), description: t("fleetDescription") });
}

export default async function FleetPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fleetPage");
  const tc = await getTranslations("common");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} image={img("bell412-belly")} />
      <section className="bg-hb-sky py-24 lg:py-32">
        <ul className="container-hb grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fleet.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 0.08}>
              <AircraftCard aircraft={a} locale={locale} cta={tc("viewSpecs")} />
            </Reveal>
          ))}
        </ul>
        <div className="container-hb mt-14">
          <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-2xl font-medium">{t("turnkeyTitle")}</p>
              <p className="mt-1 max-w-2xl text-ink-soft">{t("turnkeyBody")}</p>
            </div>
            <Button
              href={{ pathname: "/cotizar", query: { type: "turnkey" } }}
              variant="ghost-dark"
              event="cta_quote"
            >
              {t("turnkeyCta")}
            </Button>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
