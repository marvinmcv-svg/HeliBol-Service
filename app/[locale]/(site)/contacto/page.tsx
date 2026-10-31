import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Mail, MapPin, Siren } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { ContactForm } from "@/components/forms/ContactForm";
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
    ...(wa ? [{ icon: null, label: "WhatsApp", value: "WhatsApp", href: wa }] : []),
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
      <section className="bg-white py-20">
        <ul className="container-hb grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal as="li" key={c.label} delay={i * 0.06}>
              <TiltCard className="h-full">
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-[24px] border border-line p-6 transition-colors hover:border-hb-blue"
                >
                  {c.icon ? (
                    <c.icon className="size-6 text-hb-blue" aria-hidden />
                  ) : (
                    <svg viewBox="0 0 24 24" className="size-6 text-hb-blue" fill="currentColor" aria-hidden>
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
      </section>

      <section className="bg-white pb-24 lg:pb-32">
        <div className="container-hb grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-4xl font-medium tracking-tight">{t("formTitle")}</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
          <aside className="space-y-6">
            <div className="rounded-[24px] bg-hb-rescue p-8 text-white">
              <Siren className="size-7" aria-hidden />
              <h2 className="mt-6 font-display text-2xl font-medium">{t("emergencyTitle")}</h2>
              <p className="mt-2 text-white/90">{t("emergencyBody")}</p>
              <a
                href={site.phoneHref}
                className="tabular mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-hb-rescue"
              >
                <Phone className="size-4" /> {site.phone}
              </a>
              <p className="mt-4 text-sm text-white/80">
                {site.emergencyNumbers.map((n) => `${n.label[locale]} ${n.number}`).join(" · ")}
              </p>
            </div>
            <a
              href={site.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm font-semibold text-hb-blue"
            >
              {tf("map")} ↗
            </a>
          </aside>
        </div>
      </section>
    </>
  );
}
