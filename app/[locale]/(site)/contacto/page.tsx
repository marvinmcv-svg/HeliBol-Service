import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Siren } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { WhatsAppFunnel } from "@/components/forms/WhatsAppFunnel";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
    { icon: Phone, label: t("phone"), value: site.phone, href: site.phoneHref },
    ...(wa ? [{ icon: null, label: "WhatsApp", value: site.whatsappDisplay, href: wa }] : []),
    { icon: Mail, label: t("email"), value: site.email, href: `mailto:${site.email}` },
    {
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

      <section className="bg-white py-20 lg:py-28">
        <div className="container-hb">
          <p className="eyebrow text-hb-blue-ink">{t("cardsTitle")}</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <ul className="grid gap-4 sm:grid-cols-2">
              {cards.map((c, i) => (
                <Reveal as="li" key={c.label} delay={i * 0.06}>
                  <TiltCard className="h-full">
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col rounded-[24px] border border-line p-6 transition-colors hover:border-hb-blue"
                    >
                      {c.icon ? (
                        <c.icon className="size-6 text-hb-blue" aria-hidden />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="size-6 text-[#25D366]"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d={siWhatsapp.path} />
                        </svg>
                      )}
                      <p className="eyebrow mt-8 text-ink-mute">{c.label}</p>
                      <p className="tabular mt-1 text-lg font-medium break-words">{c.value}</p>
                    </a>
                  </TiltCard>
                </Reveal>
              ))}
            </ul>
            <aside className="flex flex-col rounded-[24px] bg-hb-rescue p-8 text-white">
              <Siren className="size-7" aria-hidden />
              <h2 className="mt-6 font-display text-2xl font-medium">{t("emergencyTitle")}</h2>
              <p className="mt-2 text-white/90">{t("emergencyBody")}</p>
              <a
                href={site.phoneHref}
                className="tabular mt-6 inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 font-semibold text-hb-rescue"
              >
                <Phone className="size-4" /> {site.phone}
              </a>
              <p className="mt-auto pt-6 text-sm text-white/80">
                {site.emergencyNumbers.map((n) => `${n.label[locale]} ${n.number}`).join(" · ")}
              </p>
            </aside>
          </div>
          <p className="mt-8 text-sm text-ink-soft">
            {t("emailAlt")}{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-hb-blue-ink hover:underline">
              {site.email}
            </a>{" "}
            ·{" "}
            <a
              href={site.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-hb-blue-ink hover:underline"
            >
              {tf("map")} ↗
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
