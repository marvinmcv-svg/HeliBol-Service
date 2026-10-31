import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Cursor } from "@/components/motion/Cursor";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { Consent } from "@/components/layout/Consent";
import { HeliLauncher } from "@/components/heli/HeliLauncher";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { JsonLd } from "@/components/ui/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";

const clash = localFont({
  src: "../fonts/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
});
const interTight = localFont({
  src: "../fonts/InterTight-Variable-latin.woff2",
  variable: "--font-inter-tight",
  weight: "100 900",
  display: "swap",
});

export const viewport: Viewport = { themeColor: "#06131F", colorScheme: "dark light" };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(site.url),
    title: { default: t("siteTitle"), template: "%s · Helibol" },
    ...pageMetadata({
      locale: locale as Locale,
      path: "/",
      title: t("siteTitle"),
      description: t("siteDescription"),
    }),
    applicationName: "Helibol",
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/media/logos/hlb-favicon.png", type: "image/png" },
      ],
      apple: "/media/logos/hlb-favicon.png",
    },
  };
}

// Runs before paint: enables JS-only styles and skips the preloader on repeat visits.
const bootScript = `document.documentElement.classList.add('js');try{if(sessionStorage.getItem('hb-preloaded')||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.setAttribute('data-preloaded','')}catch(e){}`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html
      lang={locale === "es" ? "es-BO" : "en"}
      className={`${clash.variable} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <JsonLd data={organizationJsonLd(locale)} />
      </head>
      <body>
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-[300] rounded-full bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            {t("skip")}
          </a>
          <Preloader />
          <SmoothScroll>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <HeliLauncher />
            <WhatsAppWidget />
          </SmoothScroll>
          <Cursor />
          <Consent />
        </NextIntlClientProvider>
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
