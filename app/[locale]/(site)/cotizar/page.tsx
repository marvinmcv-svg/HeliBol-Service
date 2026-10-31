import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone } from "lucide-react";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { HeliButton } from "@/components/ui/HeliButton";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/cotizar", title: t("quote"), description: t("quoteDescription") });
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ type?: string; aircraft?: string }>;
}) {
  const { locale } = await params;
  const { type, aircraft } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("quote");
  const tc = await getTranslations("common");
  return (
    <>
      <section className="grain relative overflow-hidden bg-hb-night pt-36 pb-40 text-white lg:pt-44">
        <div aria-hidden className="hairline-grid absolute inset-0" />
        <div className="container-hb relative">
          <Eyebrow className="text-hb-sunset">{t("eyebrow")}</Eyebrow>
          <SplitHeading
            as="h1"
            immediate
            className="mt-6 text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] font-medium tracking-[-0.025em]"
          >
            {t("title")}
          </SplitHeading>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-white/75">{t("lead")}</p>
          </Reveal>
        </div>
      </section>
      <section className="bg-hb-sky pb-24 lg:pb-32">
        <div className="container-hb relative -mt-24 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <QuoteForm initialType={type} aircraft={aircraft} />
          <aside className="space-y-4 lg:pt-28">
            <div className="rounded-[24px] border border-hb-rescue/30 bg-white p-6">
              <p className="eyebrow text-hb-rescue">{tc("emergency")}</p>
              <a
                href={site.phoneHref}
                className="tabular mt-3 flex items-center gap-2 text-2xl font-semibold"
              >
                <Phone className="size-5" /> {site.phone}
              </a>
              <p className="mt-1 text-sm text-ink-soft">24/7</p>
            </div>
            <div className="rounded-[24px] bg-white p-6">
              <p className="text-ink-soft">{t("noPrices")}</p>
              <div className="mt-4">
                <HeliButton topic="quote" variant="ghost-dark" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
