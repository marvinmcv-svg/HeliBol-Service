"use client";
import Script from "next/script";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const KEY = "hb-consent";
const GA = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** GA4 / Meta Pixel load only after explicit consent (plan §2). Vercel Analytics is cookieless. */
export function Consent() {
  const t = useTranslations("consent");
  const [choice, setChoice] = useState<"granted" | "denied" | null | undefined>(undefined);

  useEffect(() => {
    setChoice((localStorage.getItem(KEY) as "granted" | "denied" | null) ?? null);
  }, []);

  const decide = (c: "granted" | "denied") => {
    localStorage.setItem(KEY, c);
    setChoice(c);
  };

  if (!GA && !PIXEL) return null;

  return (
    <>
      {choice === "granted" && GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {choice === "granted" && PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}
      <AnimatePresence>
        {choice === null && (
          <motion.div
            role="region"
            aria-label="Cookies"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-4 left-4 z-[60] max-w-sm rounded-3xl border border-white/10 bg-hb-night/95 p-5 text-sm text-white shadow-2xl"
          >
            <p className="leading-relaxed text-white/80">
              {t("text")}{" "}
              <Link href="/privacidad" className="underline underline-offset-4">
                {t("policy")}
              </Link>
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => decide("granted")}
                className="rounded-full bg-white px-4 py-2 font-semibold text-hb-night"
              >
                {t("accept")}
              </button>
              <button
                type="button"
                onClick={() => decide("denied")}
                className="rounded-full border border-white/30 px-4 py-2"
              >
                {t("decline")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
