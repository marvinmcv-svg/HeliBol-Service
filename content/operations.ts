import type { Localized } from "./site";

/**
 * Track record (plan §6.7, from Helibol's own timeline).
 * Coordinates are approximate locality/block centroids for the map — VERIFY with the client.
 */
export type Sector = "energy";
export type Operation = {
  id: string;
  name: string;
  year: number;
  sector: Sector;
  region: string; // Bolivian department
  lat: number;
  lng: number;
  /** Which side of the pin the map label sits on (avoids overlaps). */
  label?: "left" | "right";
  description: Localized;
};

export const base = { name: "El Trompillo", lat: -17.811, lng: -63.171 };

export const operations: Operation[] = [
  {
    id: "sara-boomerang-2023",
    name: "Sara Boomerang 2D",
    year: 2023,
    sector: "energy",
    region: "Santa Cruz",
    lat: -17.35,
    lng: -63.75,
    description: { es: "Apoyo aéreo a sísmica 2D.", en: "Air support for a 2D seismic survey." },
  },
  {
    id: "charagua-2019",
    name: "Charagua",
    year: 2019,
    sector: "energy",
    region: "Santa Cruz",
    lat: -19.79,
    lng: -63.2,
    description: { es: "Apoyo a exploración en el Chaco.", en: "Exploration support in the Chaco." },
  },
  {
    id: "isarsama-2019",
    label: "left",
    name: "San Miguel Isarsama",
    year: 2019,
    sector: "energy",
    region: "Cochabamba",
    lat: -16.95,
    lng: -65.05,
    description: { es: "Apoyo a exploración en el trópico.", en: "Exploration support in the tropics." },
  },
  {
    id: "chirca-2019",
    label: "left",
    name: "Chirca",
    year: 2019,
    sector: "energy",
    region: "Chuquisaca",
    lat: -20.6,
    lng: -64.25,
    description: {
      es: "Apoyo a exploración en el subandino.",
      en: "Exploration support in the sub-Andean belt.",
    },
  },
  {
    id: "beni-norte-2018",
    label: "left",
    name: "Beni Norte",
    year: 2018,
    sector: "energy",
    region: "Beni",
    lat: -13.9,
    lng: -66.4,
    description: {
      es: "Logística aérea en la llanura beniana.",
      en: "Air logistics across the Beni plains.",
    },
  },
  {
    id: "entre-rios-2018",
    label: "left",
    name: "Entre Ríos Norte / Sur",
    year: 2018,
    sector: "energy",
    region: "Tarija",
    lat: -21.53,
    lng: -64.17,
    description: { es: "Campaña de exploración en Tarija.", en: "Exploration campaign in Tarija." },
  },
  {
    id: "miguillas-2018",
    label: "left",
    name: "Miguillas",
    year: 2018,
    sector: "energy",
    region: "La Paz",
    lat: -16.95,
    lng: -67.35,
    description: { es: "Apoyo aéreo en los valles de La Paz.", en: "Air support in the La Paz valleys." },
  },
  {
    id: "huacareta-2017",
    label: "right",
    name: "Entre Ríos / Huacareta",
    year: 2017,
    sector: "energy",
    region: "Chuquisaca",
    lat: -20.38,
    lng: -64.03,
    description: { es: "Exploración en el pie de monte.", en: "Exploration in the foothills." },
  },
];
