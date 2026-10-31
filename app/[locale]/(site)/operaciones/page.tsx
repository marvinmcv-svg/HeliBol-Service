import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/ui/PageHero";
import { OperationsExplorer } from "@/components/sections/OperationsExplorer";
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
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} image={img("bell212-jungle")} />
      <section className="grain relative overflow-hidden bg-hb-blue-deep py-24 text-white lg:py-32">
        <div aria-hidden className="hairline-grid absolute inset-0" />
        <div className="container-hb relative">
          <OperationsExplorer />
        </div>
      </section>
      <CtaBand quoteQuery={{ type: "energy" }} />
    </>
  );
}
