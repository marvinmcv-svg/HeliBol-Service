import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { RevealImage } from "@/components/motion/RevealImage";
import { SpecTable } from "@/components/sections/SpecTable";
import { CtaBand } from "@/components/sections/CtaBand";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { FloatingCutout } from "@/components/sections/FloatingCutout";
import { JsonLd } from "@/components/ui/JsonLd";
import { fleet, getAircraft } from "@/content/fleet";
import { img } from "@/content/media";
import { site } from "@/content/site";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => fleet.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const a = getAircraft(slug);
  if (!a) return {};
  return pageMetadata({
    locale,
    path: `/flota/${slug}`,
    title: `${a.model} (${a.variants})`,
    description: a.summary[locale],
    image: img(a.hero).src,
  });
}

export default async function AircraftPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const a = getAircraft(slug);
  if (!a) notFound();
  const t = await getTranslations("fleetPage");
  const tn = await getTranslations("nav");
  const hero = img(a.card);
  const quoteType = a.slug === "bell-412" ? "vip" : a.slug === "bell-212" ? "energy" : "scenic";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Helibol", url: `${site.url}/${locale}` },
          { name: tn("fleet"), url: `${site.url}/${locale}/flota` },
          { name: a.model, url: `${site.url}/${locale}/flota/${a.slug}` },
        ])}
      />
      <section className="grain relative isolate overflow-hidden bg-hb-night pt-36 pb-20 text-white lg:pt-44">
        <div aria-hidden className="hairline-grid absolute inset-0" />
        <p
          aria-hidden
          className="text-outline pointer-events-none absolute top-28 left-1/2 -translate-x-1/2 font-display text-[22vw] leading-none font-semibold whitespace-nowrap select-none [--stroke:rgb(255_255_255/0.12)]"
        >
          {a.model.replace("Airbus ", "")}
        </p>
        <div className="container-hb relative grid items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Eyebrow className="text-hb-sunset">{a.variants}</Eyebrow>
            <SplitHeading
              as="h1"
              immediate
              className="mt-6 text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.025em]"
            >
              {a.model}
            </SplitHeading>
            <Reveal delay={0.2}>
              <p className="mt-2 font-display text-2xl text-white/70">“{a.nickname[locale]}”</p>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{a.summary[locale]}</p>
              <p className="eyebrow mt-8 text-white/50">{t("idealFor")}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {a.bestFor[locale].map((b) => (
                  <li key={b} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm">
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button
                  href={{ pathname: "/cotizar", query: { type: quoteType, aircraft: a.slug } }}
                  event="cta_quote"
                >
                  {t("request")}
                </Button>
                <HeliButton topic="fleet" />
              </div>
            </Reveal>
          </div>
          <div className="relative aspect-[16/10]">
            {a.cutout ? (
              <FloatingCutout src={a.cutout} alt={img("bell412-white-sky").alt[locale]} />
            ) : (
              <div className="absolute inset-0 overflow-hidden rounded-[28px]">
                <Image
                  src={hero.src}
                  alt={hero.alt[locale]}
                  fill
                  priority
                  sizes="(min-width:1024px) 55vw, 100vw"
                  placeholder="blur"
                  blurDataURL={hero.blurDataURL}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 lg:py-32">
        <div className="container-hb grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <SpecTable specs={a.specs} />
          <div>
            <h2 className="eyebrow font-sans text-hb-blue-ink">{t("gallery")}</h2>
            <ul className="mt-6 grid grid-cols-2 gap-4">
              {a.gallery.map((key, i) => (
                <li
                  key={key}
                  className={`relative overflow-hidden rounded-[20px] ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
                >
                  <RevealImage
                    image={img(key)}
                    sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <CtaBand quoteQuery={{ type: quoteType, aircraft: a.slug }} />
    </>
  );
}
