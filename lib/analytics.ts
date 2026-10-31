"use client";
import { track as vercelTrack } from "@vercel/analytics";

export type HbEvent =
  "cta_quote" | "cta_whatsapp" | "heli_open" | "heli_lead_captured" | "quote_submitted" | "cta_call";

type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

/** Plan §2 analytics events. Vercel Analytics is cookieless; GA4/Meta only fire once consent is given. */
export function track(event: HbEvent, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(event, props);
    const w = window as W;
    w.gtag?.("event", event, props);
    if (event === "quote_submitted" || event === "heli_lead_captured") w.fbq?.("track", "Lead", props);
    else w.fbq?.("trackCustom", event, props);
  } catch {
    /* analytics must never break the UI */
  }
}
