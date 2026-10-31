import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { site } from "@/content/site";

/** Per-page metadata with canonical + hreflang alternates (plan §10). `path` excludes the locale. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  noindex,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const clean = path === "/" ? "" : path;
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l === "es" ? "es-BO" : "en", `${site.url}/${l}${clean}`]),
  );
  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}/${locale}${clean}`,
      languages: { ...languages, "x-default": `${site.url}/es${clean}` },
    },
    openGraph: {
      type: "website",
      siteName: "Helibol",
      locale: locale === "es" ? "es_BO" : "en_US",
      url: `${site.url}/${locale}${clean}`,
      title,
      description,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}
