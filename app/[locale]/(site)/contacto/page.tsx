import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Siren } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { WhatsAppFunnel } from "@/components/forms/WhatsAppFunnel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactCard, type Accent } from "@/components/sections/ContactCard";
import { img } from "@/content/media";
import { site, whatsappHref } from "@/content/site";
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
    path: "/contacto",
    title: t("contact"),
    description: t("contactDescription"),
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contactPage");
  const tf = await getTranslations("footer");
  const wa = whatsappHref();
  const cards = [
    { icon: Phone, label: t("phone"), value: site.phone, href: site.phoneHref, accent: "blue" as Accent },
    ...(wa
      ? [{ icon: null, label: "WhatsApp", value: site.whatsappDisplay, href: wa, accent: "green" as Accent }]
      : []),
    {
      icon: Mail,
      label: t("email"),
      value: site.email,
      href: `mailto:${site.email}`,
      accent: "sunset" as Accent,
    },
    {
      accent: "sky" as Accent,
      icon: MapPin,
      label: t("visit"),
      value: `${site.address.street}, ${site.address.city}`,
      href: site.mapUrl,
    },
  ];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} image={img("ramp-dusk")} />

      <section className="relative overflow-hidden bg-hb-sky/60 py-20 lg:py-28">
        <div aria-hidden className="hairline-grid-light absolute inset-0" />
        <div className="container-hb relative">
          <SectionHeader eyebrow={t("funnelEyebrow")} title={t("funnelTitle")} lead={t("funnelLead")} />
          <div className="mt-12">
            <WhatsAppFunnel />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-hb-night py-20 text-white lg:py-28">
        {/* Soft colour fields behind the glass */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-hb-blue/30 blur-[120px]" />
          <div className="absolute top-1/3 -right-24 size-[30rem] rounded-full bg-hb-rescue/20 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 size-[28rem] rounded-full bg-hb-sunset/10 blur-[120px]" />
        </div>
        <div aria-hidden className="hairline-grid absolute inset-0 opacity-50" />
        <div className="container-hb relative">
          <p className="eyebrow text-hb-sunset">{t("cardsTitle")}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-[2fr_1fr] lg:gap-6">
            <ul className="grid gap-5 sm:grid-cols-2">
              {cards.map((c, i) => (
                <Reveal as="li" key={c.label} delay={i * 0.06}>
                  <ContactCard
                    href={c.href}
                    label={c.label}
                    value={c.value}
                    accent={c.accent}
                    icon={
                      c.icon ? (
                        <c.icon className="size-6" aria-hidden />
                      ) : (
                        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                          <path d={siWhatsapp.path} />
                        </svg>
                      )
                    }
                  />
                </Reveal>
              ))}
            </ul>

            <Reveal delay={0.2} className="h-full">
              <TiltCard className="h-full" max={8}>
                <aside
                  className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[28px] p-8 text-white [transform-style:preserve-3d] sm:p-9"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.04) 40%, transparent 100%), linear-gradient(180deg, #FF6A3D 0%, #E8431A 55%, #B42A0C 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 0 0 1px rgba(255,255,255,0.15), inset 0 -30px 50px -30px rgba(80,10,0,0.6), 0 40px 80px -24px rgba(232,67,26,0.6)",
                  }}
                >
                  <span aria-hidden className="glossy-sheen" />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[28px] bg-gradient-to-b from-white/15 to-transparent"
                  />
                  <div className="relative" style={{ transform: "translateZ(50px)" }}>
                    {/* Siren with pulsing rings */}
                    <span className="relative grid size-14 place-items-center">
                      {[0, 0.8].map((d) => (
                        <span
                          key={d}
                          aria-hidden
                          className="absolute inset-0 rounded-full border-2 border-white/70 motion-safe:animate-[hb-siren_1.6s_ease-out_infinite]"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                      <span className="relative grid size-14 place-items-center rounded-full bg-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_8px_20px_-6px_rgba(80,10,0,0.6)]">
                        <Siren className="size-7" aria-hidden />
                      </span>
                    </span>
                    <h2 className="mt-7 font-display text-3xl font-medium">{t("emergencyTitle")}</h2>
                    <p className="mt-3 text-white/90">{t("emergencyBody")}</p>
                  </div>
                  <a
                    href={site.phoneHref}
                    className="tabular relative mt-7 inline-flex items-center gap-2 self-start rounded-full bg-white px-6 py-3.5 font-semibold text-hb-rescue shadow-[inset_0_-2px_0_rgba(0,0,0,0.08),0_12px_24px_-8px_rgba(80,10,0,0.6)] transition-transform hover:-translate-y-0.5"
                    style={{ transform: "translateZ(60px)" }}
                  >
                    <Phone className="size-4" /> {site.phone}
                  </a>
                  <p
                    className="relative mt-auto pt-7 text-sm text-white/85"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    {site.emergencyNumbers.map((n) => `${n.label[locale]} ${n.number}`).join(" · ")}
                  </p>
                </aside>
              </TiltCard>
            </Reveal>
          </div>
          <p className="mt-10 text-sm text-white/60">
            {t("emailAlt")}{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-white hover:underline">
              {site.email}
            </a>{" "}
            ·{" "}
            <a
              href={site.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white hover:underline"
            >
              {tf("map")} ↗
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
