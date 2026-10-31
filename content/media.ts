import blur from "./media-blur.json";
import type { Localized } from "./site";

/**
 * Curated image registry (plan §5). Label aircraft by what is IN the photo —
 * the Drive filenames for the fleet photos were swapped.
 */
const alts = {
  "hero-mountain-edge": {
    es: "Bell 212 de Helibol posado en una cresta sobre las nubes",
    en: "Helibol Bell 212 landed on a ridge above the clouds",
  },
  "bell412-golden-hour": {
    es: "Bell 412 de Helibol en la pista al atardecer",
    en: "Helibol Bell 412 on the ramp at golden hour",
  },
  "bell412-white-sky": { es: "Bell 412 de Helibol en vuelo", en: "Helibol Bell 412 in flight" },
  "bell412-belly": {
    es: "Bell 412 CP-3066 visto desde abajo en vuelo",
    en: "Bell 412 CP-3066 seen from below in flight",
  },
  "bell212-blue-sky": {
    es: "Bell 212 de Helibol en vuelo con cielo azul",
    en: "Helibol Bell 212 flying under a blue sky",
  },
  "bell212-jungle": {
    es: "Bell 212 aterrizado en un claro de la selva entre cañones",
    en: "Bell 212 landed in a jungle clearing between canyon walls",
  },
  "h125-plateau": {
    es: "Airbus H125 en el altiplano junto a tambores de combustible",
    en: "Airbus H125 on the high plateau beside fuel drums",
  },
  "h125-longline": {
    es: "H125 en operación long-line contra nubes dramáticas",
    en: "H125 flying a long-line against dramatic clouds",
  },
  "scenic-waterfall": {
    es: "Bell 412 sobrevolando una cascada y cañones rojos en Bolivia",
    en: "Bell 412 flying over a waterfall and red canyon walls in Bolivia",
  },
  "rescue-crew": {
    es: "Tripulación de rescate en trajes naranja cargando una camilla al helicóptero",
    en: "Rescue crew in orange suits loading a stretcher into the helicopter",
  },
  "rescue-skid": {
    es: "Tripulante de rescate de pie en el patín del helicóptero",
    en: "Rescue crew member standing on the helicopter skid",
  },
  "fire-drop": {
    es: "Helicóptero liberando agua desde un Bambi Bucket",
    en: "Helicopter releasing water from a Bambi Bucket",
  },
  "fire-bambi": {
    es: "Bell 212 en tierra con su Bambi Bucket naranja",
    en: "Bell 212 on the ground with its orange Bambi Bucket",
  },
  "logistics-camp": {
    es: "Dos helicópteros de Helibol en un helipuerto de campamento en la selva",
    en: "Two Helibol helicopters at a jungle camp helipad",
  },
  "cargo-pair": {
    es: "Helicóptero transportando carga externa con long-line",
    en: "Helicopter carrying an external load on a long-line",
  },
  "survey-1": {
    es: "Técnicos operando equipos de levantamiento aerotransportado",
    en: "Technicians operating airborne survey equipment",
  },
  "survey-2": {
    es: "Equipo de aeromagnetometría instalado en el helicóptero",
    en: "Aeromagnetic survey equipment mounted on the helicopter",
  },
  "team-hangar": {
    es: "Técnicos de Helibol sonriendo junto a un motor en el hangar",
    en: "Helibol engineers smiling around an engine in the hangar",
  },
  "heritage-bell47": {
    es: "Bell 47 histórico en El Trompillo, el origen de Helibol",
    en: "Vintage Bell 47 at El Trompillo — where Helibol began",
  },
  "ramp-dusk": { es: "Bell 212 en la plataforma al anochecer", en: "Bell 212 on the ramp at dusk" },
  "bw-headon": {
    es: "Helicóptero de frente en blanco y negro",
    en: "Head-on black-and-white helicopter",
  },
} satisfies Record<string, Localized>;

export type ImageKey = keyof typeof alts;

export type Img = { src: string; width: number; height: number; blurDataURL: string; alt: Localized };

export function img(key: ImageKey): Img {
  const b = (blur as Record<string, { w: number; h: number; blur: string }>)[key];
  if (!b) throw new Error(`Missing media: ${key} — run pnpm media`);
  return { src: `/media/img/${key}.jpg`, width: b.w, height: b.h, blurDataURL: b.blur, alt: alts[key] };
}

export const cutout = {
  bell412: { src: "/media/img/bell412-cutout.webp", alt: alts["bell412-white-sky"] },
};

export const video = {
  heroDesktop: {
    mp4: "/media/video/hero-desktop.mp4",
    webm: "/media/video/hero-desktop.webm",
    poster: "/media/video/hero-desktop-poster.jpg",
  },
  heroMobile: {
    mp4: "/media/video/hero-mobile.mp4",
    webm: "/media/video/hero-mobile.webm",
    poster: "/media/video/hero-mobile-poster.jpg",
  },
  crew: { mp4: "/media/video/crew-boarding.mp4", poster: "/media/video/crew-boarding-poster.jpg" },
  cockpit: { mp4: "/media/video/cockpit.mp4", poster: "/media/video/cockpit-poster.jpg" },
};
