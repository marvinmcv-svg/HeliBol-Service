import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BadgeCheck, MapPin } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealImage } from "@/components/motion/RevealImage";
import { Timeline } from "@/components/sections/Timeline";
import { ValuesDeck } from "@/components/sections/ValuesDeck";
import { TeamSpotlight } from "@/components/sections/TeamSpotlight";
import { CtaBand } from "@/components/sections/CtaBand";
import { WingBadge } from "@/components/ui/WingBadge";
import { img, video } from "@/content/media";
import { site, yearsFlying } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale, path: "/nosotros", title: t("about"), description: t("aboutDescription") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("aboutPage");
  const tf = await getTranslations("footer");
  const tc = await getTranslations("common");
  const people = t.raw("people") as { role: string; tag: string; body: string }[];
  const timeline = t.raw("timeline") as { year: string; title: string; body: string }[];
  const values = t.raw("values") as { title: string; body: string }[];
  const certs = t.raw("certs") as string[];
  const mapEmbed = `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=15&output=embed`;

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        image={img("bell212-blue-sky")}
        video={{
          desktop: video.heroDesktop,
          mobile: video.heroMobile,
          label: { pause: tc("pauseVideo"), play: tc("playVideo") },
        }}
      >
        <WingBadge
          years={yearsFlying}
          label={tf("badge").replace(/^\d+\s*/, "")}
          className="h-16 w-auto text-hb-sunset"
        />
      </PageHero>

      <section className="bg-white py-24 lg:py-36">
        <div className="container-hb">
          <SectionHeader eyebrow="1988 → 2026" title={t("timelineTitle")} align="center" className="mb-20" />
          <Timeline items={timeline} />
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-hb-night py-24 text-white lg:py-32">
        <div aria-hidden className="hairline-grid absolute inset-0" />
        <div className="container-hb relative">
          <SectionHeader eyebrow={t("valuesTitle").toUpperCase()} title={t("valuesTitle")} dark />
          <div className="mt-14">
            <ValuesDeck values={values} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-hb-sky py-24 lg:py-32">
        <div aria-hidden className="hairline-grid-light absolute inset-0" />
        <div className="container-hb relative">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
            <SectionHeader
              eyebrow={t("peopleTitle").toUpperCase()}
              title={t("peopleTitle")}
              lead={t("peopleBody")}
            />
            <div className="relative hidden aspect-[16/9] overflow-hidden rounded-[28px] lg:block">
              <RevealImage image={img("team-hangar")} sizes="40vw" parallax={6} />
            </div>
          </div>
          <p className="eyebrow mt-12 text-ink-mute">{t("peopleHint")}</p>
          <div className="mt-6 lg:pb-12">
            <TeamSpotlight people={people} />
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container-hb">
          <p className="eyebrow text-hb-blue-ink">{t("certTitle")}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {certs.map((c) => (
              <li
                key={c}
                className="flex items-center gap-3 rounded-[20px] border border-line p-6 text-lg font-medium"
              >
                <BadgeCheck className="size-6 shrink-0 text-hb-blue" aria-hidden /> {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white pb-24 lg:pb-32">
        <div className="container-hb grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <SectionHeader eyebrow="HANGAR 22 · SLET" title={t("visitTitle")} lead={t("visitBody")} />
            <a
              href={site.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-hb-blue"
            >
              <MapPin className="size-4" /> {tf("map")} ↗
            </a>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-line">
            <iframe
              title={t("visitTitle")}
              src={mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale-[0.4]"
            />
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
