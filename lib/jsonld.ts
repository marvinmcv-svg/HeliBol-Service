import { site } from "@/content/site";
import type { Locale } from "@/i18n/routing";
import { visibleSocials } from "@/content/socials";

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.legalName,
    alternateName: "Helibol",
    url: `${site.url}/${locale}`,
    logo: `${site.url}/media/logos/helibol-blue.svg`,
    image: `${site.url}/media/img/hero-mountain-edge.jpg`,
    foundingDate: String(site.founded),
    slogan: "Vertical Efficiency",
    email: site.email,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressCountry: site.address.countryCode,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: site.areaServed.map((c) => ({ "@type": "Country", name: c })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "emergency",
        hoursAvailable: "Mo-Su 00:00-23:59",
        availableLanguage: ["es", "en"],
      },
    ],
    sameAs: visibleSocials()
      .filter((s) => s.name !== "WhatsApp")
      .map((s) => s.url),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function serviceJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    serviceType: name,
    provider: { "@id": `${site.url}/#organization` },
    areaServed: site.areaServed.map((c) => ({ "@type": "Country", name: c })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
