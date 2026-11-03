import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Search,
  Route,
  Plane,
  ShieldCheck,
  Clock,
  Phone,
  Droplets,
  Users,
  Camera,
  Package,
  Check,
} from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { AircraftCard } from "@/components/sections/AircraftCard";
import { BoliviaMap } from "@/components/sections/BoliviaMap";
import { CtaBand } from "@/components/sections/CtaBand";
import { Faq } from "@/components/ui/Faq";
import { JsonLd } from "@/components/ui/JsonLd";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import { services, getService, type StepIcon } from "@/content/services";
import { getAircraft } from "@/content/fleet";
import { operations } from "@/content/operations";
import { img } from "@/content/media";
import { site } from "@/content/site";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/jsonld";

const icons: Record<StepIcon, typeof Search> = {
  search: Search,
  route: Route,
  plane: Plane,
  shield: ShieldCheck,
  clock: Clock,
  phone: Phone,
  droplets: Droplets,
  users: Users,
  camera: Camera,
  package: Package,
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => services.map((s) => ({ locale, slug: s.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return pageMetadata({
    locale,
    path: `/servicios/${slug}`,
    title: s.title[locale],
    description: `${s.h1[locale]} ${s.promise[locale]}`,
    image: img(s.hero).src,
  });
}

export default async function ServiceDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = getService(slug);
  if (!s) notFound();
  const t = await getTranslations("servicesPage");
  const tc = await getTranslations("common");
  const tn = await getTranslations("nav");
  const op = operations.find((o) => o.id === s.operationId);
  const faqs = s.faqs.map((f) => ({ q: f.q[locale], a: f.a[locale] }));
  const url = `${site.url}/${locale}/servicios/${s.slug}`;

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({ name: s.title[locale], description: s.promise[locale], url }),
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Helibol", url: `${site.url}/${locale}` },
            { name: tn("services"), url: `${site.url}/${locale}/servicios` },
            { name: s.title[locale], url },
          ]),
        ]}
      />
      {/* 1. Hero */}
      <PageHero
        eyebrow={`${s.index} · ${s.title[locale].toUpperCase()}`}
        title={s.h1[locale]}
        lead={s.promise[locale]}
        image={img(s.hero)}
        accent={s.emergency ? "rescue" : "sunset"}
      >
        {s.emergency ? (
          <Button href={site.phoneHref} external variant="rescue" event="cta_call">
            <Phone className="size-4" /> {t("emergencyCall")} · {site.phone}
          </Button>
        ) : (
          <WhatsAppCta from={`service_${s.quoteType}`} />
        )}
        <HeliButton topic={s.emergency ? "emergency" : "quote"} />
      </PageHero>

      {/* 2. Challenge + 3. How */}
      <section className="bg-white py-24 lg:py-32">
        <div className="container-hb grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeader eyebrow={t("challenge")} title={s.title[locale]} />
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{s.challenge[locale]}</p>
              {s.slug === "energia-y-mineria" && (
                <p className="eyebrow mt-8 text-hb-blue-ink">{t("proof")}</p>
              )}
            </Reveal>
          </div>
          <div>
            <p className="eyebrow text-hb-blue-ink">{t("how")}</p>
            <ol className="mt-6 grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {s.steps.map((step, i) => {
                const Icon = icons[step.icon];
                return (
                  <Reveal
                    as="li"
                    key={i}
                    delay={i * 0.08}
                    className="rounded-[24px] border border-line bg-hb-sky/50 p-5 sm:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-full bg-hb-blue text-white sm:size-12">
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="eyebrow tabular text-ink-mute">0{i + 1}</span>
                    </div>
                    <h3 className="mt-4 font-sans text-lg font-semibold sm:mt-6">{step.title[locale]}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">{step.body[locale]}</p>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* 4. Aircraft + 5. Capabilities */}
      <section className="bg-hb-sky py-24 lg:py-32">
        <div className="container-hb grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="eyebrow text-hb-blue-ink">{t("aircraft")}</p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {s.aircraft.map((slug) => {
                const a = getAircraft(slug)!;
                return (
                  <li key={slug}>
                    <AircraftCard aircraft={a} locale={locale} cta={tc("viewSpecs")} />
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-hb-blue-ink">{t("capabilities")}</p>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {s.capabilities[locale].map((c) => (
                <li key={c} className="flex items-center gap-3 py-4 text-lg">
                  <Check className="size-5 shrink-0 text-hb-blue" aria-hidden /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Related operation */}
      {op && (
        <section className="grain relative overflow-hidden bg-hb-blue-deep py-24 text-white">
          <div aria-hidden className="hairline-grid absolute inset-0" />
          <div className="container-hb relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-hb-sunset">{t("related")}</p>
              <h2 className="mt-4 text-5xl font-medium tracking-tight">{op.name}</h2>
              <p className="eyebrow tabular mt-3 text-white/60">
                {op.year} · {op.region}, Bolivia
              </p>
              <p className="mt-6 max-w-md text-lg text-white/75">{op.description[locale]}</p>
              <div className="mt-8">
                <Button href="/operaciones" variant="ghost">
                  {tn("operations")}
                </Button>
              </div>
            </div>
            <BoliviaMap items={[op]} baseLabel="BASE" tilt={false} className="mx-auto w-full max-w-md" />
          </div>
        </section>
      )}

      {/* 7. FAQ */}
      <section className="bg-white py-24 lg:py-32">
        <div className="container-hb grid gap-12 lg:grid-cols-[1fr_2fr]">
          <SectionHeader eyebrow="FAQ" title={t("faq")} />
          <Faq items={faqs} />
        </div>
      </section>

      {/* 8. CTA */}
      <CtaBand quoteQuery={{ type: s.quoteType }} />
    </>
  );
}
