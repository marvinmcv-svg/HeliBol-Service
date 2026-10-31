import type { ImageKey } from "./media";
import type { Localized, LocalizedList } from "./site";

/** Specs taken from the current site — VERIFY against official sheets before launch (plan §12.5). */
export type Spec =
  | { key: "engine"; label: Localized; text: string }
  | { key: "power"; label: Localized; value: number; unit: "shp" }
  | { key: "pax"; label: Localized; value: number; unit: "pax" }
  | { key: "hook"; label: Localized; value: number; unit: "kg" }
  | { key: "cruise"; label: Localized; value: number; unit: "kmh" }
  | { key: "rotor"; label: Localized; text: Localized };

export type AircraftSlug = "bell-212" | "bell-412" | "h125";

export type Aircraft = {
  slug: AircraftSlug;
  model: string;
  variants: string;
  nickname: Localized;
  summary: Localized;
  bestFor: LocalizedList;
  specs: Spec[];
  card: ImageKey;
  hero: ImageKey;
  cutout?: string;
  gallery: ImageKey[];
};

const L = {
  engine: { es: "Motor", en: "Engine" },
  power: { es: "Potencia", en: "Power" },
  pax: { es: "Pasajeros", en: "Passengers" },
  hook: { es: "Carga en gancho", en: "Hook capacity" },
  cruise: { es: "Crucero", en: "Cruise" },
  rotor: { es: "Rotor", en: "Rotor" },
} satisfies Record<string, Localized>;

export const fleet: Aircraft[] = [
  {
    slug: "bell-212",
    model: "Bell 212",
    variants: "212 / 212HP",
    nickname: { es: "El caballo de batalla", en: "The workhorse" },
    summary: {
      es: "Bimotor, robusto y probado en las condiciones más duras. Nuestra referencia para sísmica, combate de incendios, carga externa pesada y SAR.",
      en: "Twin-engine, rugged and proven in the harshest conditions. Our go-to for seismic, firefighting, heavy external cargo and SAR.",
    },
    bestFor: {
      es: ["Sísmica", "Combate de incendios", "Carga externa pesada", "SAR"],
      en: ["Seismic", "Firefighting", "Heavy external cargo", "SAR"],
    },
    specs: [
      { key: "engine", label: L.engine, text: "P&W PT6T-3 Twin-Pac" },
      { key: "power", label: L.power, value: 1800, unit: "shp" },
      { key: "pax", label: L.pax, value: 14, unit: "pax" },
      { key: "hook", label: L.hook, value: 2041, unit: "kg" },
      { key: "cruise", label: L.cruise, value: 185, unit: "kmh" },
    ],
    card: "bell212-blue-sky",
    hero: "bell212-jungle",
    gallery: ["bell212-jungle", "fire-bambi", "ramp-dusk", "hero-mountain-edge", "logistics-camp"],
  },
  {
    slug: "bell-412",
    model: "Bell 412",
    variants: "412 / 412HP",
    nickname: { es: "Potencia y confort", en: "Power meets comfort" },
    summary: {
      es: "Rotor de cuatro palas para un vuelo más suave, con interior VIP disponible. Ideal para traslados ejecutivos, personal y MEDEVAC.",
      en: "A four-blade rotor for a smoother ride, with a VIP interior available. Ideal for executive transfers, personnel and MEDEVAC.",
    },
    bestFor: {
      es: ["VIP y ejecutivos", "Transporte de personal", "MEDEVAC"],
      en: ["VIP and executive", "Personnel transport", "MEDEVAC"],
    },
    specs: [
      { key: "engine", label: L.engine, text: "P&W PT6T-3DF" },
      {
        key: "rotor",
        label: L.rotor,
        text: { es: "4 palas (vuelo más suave)", en: "4-blade (smoother ride)" },
      },
      { key: "pax", label: L.pax, value: 14, unit: "pax" },
      { key: "cruise", label: L.cruise, value: 220, unit: "kmh" },
    ],
    card: "bell412-golden-hour",
    hero: "bell412-belly",
    cutout: "/media/img/bell412-cutout.webp",
    gallery: ["bell412-golden-hour", "bell412-belly", "bell412-white-sky", "scenic-waterfall"],
  },
  {
    slug: "h125",
    model: "Airbus H125",
    variants: "AS350 B3",
    nickname: { es: "Rey de las alturas", en: "King of high altitude" },
    summary: {
      es: "Monomotor ágil con desempeño excepcional en altura y calor. Perfecto para los Andes, levantamientos, filmación y vuelos panorámicos.",
      en: "An agile single with exceptional hot-and-high performance. Perfect for the Andes, survey, filming and scenic flights.",
    },
    bestFor: {
      es: ["Andes y altura", "Levantamientos", "Filmación", "Vuelos panorámicos"],
      en: ["Andes and high altitude", "Survey", "Filming", "Scenic flights"],
    },
    specs: [
      { key: "engine", label: L.engine, text: "Turbomeca Arriel 2D" },
      { key: "pax", label: L.pax, value: 5, unit: "pax" },
      { key: "hook", label: L.hook, value: 1400, unit: "kg" },
      { key: "cruise", label: L.cruise, value: 235, unit: "kmh" },
    ],
    card: "h125-plateau",
    hero: "h125-longline",
    gallery: ["h125-plateau", "h125-longline", "survey-2"],
  },
];

export const getAircraft = (slug: string) => fleet.find((a) => a.slug === slug);

/** Format a spec value for metric or imperial display. */
export function formatSpec(spec: Spec, system: "metric" | "imperial", locale: "es" | "en"): string {
  const nf = new Intl.NumberFormat(locale === "es" ? "es-BO" : "en-US");
  switch (spec.key) {
    case "engine":
      return spec.text;
    case "rotor":
      return spec.text[locale];
    case "power":
      return `${nf.format(spec.value)} shp`;
    case "pax":
      return locale === "es" ? `hasta ${spec.value}` : `up to ${spec.value}`;
    case "hook":
      return system === "metric"
        ? `${nf.format(spec.value)} kg`
        : `${nf.format(Math.round(spec.value * 2.20462))} lb`;
    case "cruise":
      return system === "metric"
        ? `${nf.format(spec.value)} km/h`
        : `${nf.format(Math.round(spec.value * 0.539957))} kt`;
  }
}
