import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Cake, Heart, Gem, Briefcase, Camera, ShieldCheck } from "lucide-react";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { RevealImage } from "@/components/motion/RevealImage";
import { TiltCard } from "@/components/motion/TiltCard";
import { Faq } from "@/components/ui/Faq";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { CtaBand } from "@/components/sections/CtaBand";
import { img } from "@/content/media";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { faqJsonLd, serviceJsonLd } from "@/lib/jsonld";
import type { Locale } from "@/i18n/routing";

const occasionIcons = [Cake, Heart, Gem, Briefcase, Camera];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({
    locale,
    path: "/vuelos-panoramicos",
    title: t("scenic"),
    description: t("scenicDescription"),
    image: img("scenic-waterfall").src,
  });
}

/** Family / tourism / VIP landing (plan §7). No prices — CTA opens Heli or the form with service=scenic. */
export default async function ScenicPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("scenicPage");
  const tm = await getTranslations("meta");
  const occasions = t.raw("occasions") as { title: string; body: string }[];
  const how = t.raw("how") as { title: string; body: string }[];
  const faqs = t.raw("faqs") as { q: string; a: string }[];

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: tm("scenic"),
            description: tm("scenicDescription"),
            url: `${site.url}/${locale}/vuelos-panoramicos`,
          }),
          faqJsonLd(faqs),
        ]}
      />
      <section className="grain relative isolate overflow-hidden bg-hb-night pt-36 pb-24 text-white lg:pt-44 lg:pb-32">
        <div aria-hidden className="hairline-grid absolute inset-0" />
        <div className="container-hb relative grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow className="text-hb-sunset">{t("eyebrow")}</Eyebrow>
            <SplitHeading
              as="h1"
              immediate
              className="mt-6 text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] font-medium tracking-[-0.03em]"
            >
              {t("title")}
            </SplitHeading>
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">{t("lead")}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button
                  href={{ pathname: "/cotizar", query: { type: "scenic" } }}
                  variant="light"
                  event="cta_quote"
                >
                  {t("cta")}
                </Button>
                <HeliButton topic="scenic" />
              </div>
              <p className="mt-6 text-sm text-white/50">{t("noPrices")}</p>
            </Reveal>
          </div>
          <TiltCard max={6} className="mx-auto w-full max-w-sm">
            <div className="relative aspect-[844/1500] overflow-hidden rounded-[32px] border border-white/10">
              <RevealImage
                image={img("scenic-waterfall")}
                sizes="(min-width:1024px) 30vw, 80vw"
                priority
                parallax={5}
              />
            </div>
          </TiltCard>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="container-hb">
          <SectionHeader eyebrow={t("occasionsTitle").toUpperCase()} title={t("occasionsTitle")} />
          <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {occasions.map((o, i) => {
              const Icon = occasionIcons[i] ?? Heart;
              return (
                <Reveal as="li" key={o.title} delay={i * 0.06}>
                  <TiltCard className="h-full">
                    <div className="h-full rounded-[24px] border border-line bg-hb-sky/50 p-6">
                      <Icon className="size-6 text-hb-blue" aria-hidden />
                      <h3 className="mt-8 text-xl font-medium">{o.title}</h3>
                      <p className="mt-1 text-sm text-ink-soft">{o.body}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-hb-sky py-24 lg:py-32">
        <div className="container-hb grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow={t("howTitle").toUpperCase()} title={t("howTitle")} />
            <ol className="mt-10 space-y-6">
              {how.map((h, i) => (
                <Reveal as="li" key={h.title} delay={i * 0.08} className="flex gap-5">
                  <span className="tabular flex size-12 shrink-0 items-center justify-center rounded-full bg-hb-blue font-display text-lg text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-sans text-lg font-semibold">{h.title}</h3>
                    <p className="mt-1 text-ink-soft">{h.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
              <RevealImage image={img("bell412-golden-hour")} sizes="(min-width:1024px) 50vw, 100vw" />
            </div>
            <Reveal delay={0.1}>
              <div className="mt-6 flex gap-4 rounded-[24px] bg-white p-6">
                <ShieldCheck className="size-6 shrink-0 text-hb-blue" aria-hidden />
                <div>
                  <h3 className="font-sans font-semibold">{t("safetyTitle")}</h3>
                  <p className="mt-1 text-ink-soft">{t("safetyBody")}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="container-hb grid gap-12 lg:grid-cols-[1fr_2fr]">
          <SectionHeader eyebrow="FAQ" title={t("faqTitle")} />
          <Faq items={faqs} />
        </div>
      </section>
      <CtaBand quoteQuery={{ type: "scenic" }} />
    </>
  );
}
