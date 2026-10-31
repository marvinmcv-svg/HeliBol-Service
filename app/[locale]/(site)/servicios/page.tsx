import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { services } from "@/content/services";
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
    path: "/servicios",
    title: t("services"),
    description: t("servicesDescription"),
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("servicesPage");
  const tc = await getTranslations("common");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} image={img("logistics-camp")}>
        <Button href="/cotizar" event="cta_quote">
          {tc("quote")}
        </Button>
        <HeliButton />
      </PageHero>
      <section className="bg-white py-24 lg:py-32">
        <ul className="container-hb grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal as="li" key={s.slug} delay={(i % 3) * 0.08}>
              <ServiceCard service={s} locale={locale} cta={tc("viewService")} />
            </Reveal>
          ))}
        </ul>
      </section>
      <CtaBand />
    </>
  );
}
