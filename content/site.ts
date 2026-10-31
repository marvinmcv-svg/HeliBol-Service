/** Single source of truth for company facts. Anything marked VERIFY is listed in TODO.md (plan §12). */
export type Localized = { es: string; en: string };
export type LocalizedList = { es: string[]; en: string[] };

export const site = {
  name: "Helibol",
  legalName: "HELIBOL S.R.L.", // ends with "." — don't append another
  founded: 1988,
  brandLine: "VERTICAL EFFICIENCY · EST. 1988",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://helibol.com",
  phone: "+591 3 352 9469",
  phoneHref: "tel:+59133529469",
  email: "info@helibol.com",
  // Client to supply the WhatsApp Business number (plan §12.6). Empty → WhatsApp CTAs are hidden.
  whatsapp: process.env.NEXT_PUBLIC_HELIBOL_WHATSAPP ?? "",
  address: {
    street: "Hangar 22, Aeropuerto El Trompillo",
    city: "Santa Cruz de la Sierra",
    country: "Bolivia",
    countryCode: "BO",
  },
  mapUrl: "https://maps.app.goo.gl/gjpMLZKtps7ER59V7",
  // El Trompillo — HUD coordinates and ICAO code (VERIFY, plan §12.11)
  geo: { lat: -17.811, lng: -63.171 },
  hudCoords: "17°47′S 63°11′W",
  icao: "SLET",
  areaServed: ["BO", "AR", "PE"],
  // Bolivian emergency numbers (VERIFY, plan §12.12)
  emergencyNumbers: [
    { label: { es: "Policía", en: "Police" }, number: "110" },
    { label: { es: "Ambulancia", en: "Ambulance" }, number: "118" },
    { label: { es: "Bomberos", en: "Fire" }, number: "119" },
  ],
} as const;

export const yearsFlying = new Date().getFullYear() - site.founded; // 38 in 2026

export function whatsappHref(text?: string) {
  if (!site.whatsapp) return "";
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${site.whatsapp.replace(/\D/g, "")}${q}`;
}
