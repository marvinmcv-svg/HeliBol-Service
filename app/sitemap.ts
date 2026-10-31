import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { services } from "@/content/services";
import { fleet } from "@/content/fleet";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/servicios",
    ...services.map((s) => `/servicios/${s.slug}`),
    "/flota",
    ...fleet.map((a) => `/flota/${a.slug}`),
    "/operaciones",
    "/vuelos-panoramicos",
    "/nosotros",
    "/cotizar",
    "/contacto",
    "/privacidad",
    "/terminos",
  ];
  return paths.map((p) => ({
    url: `${site.url}/es${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.split("/").length > 2 ? 0.7 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l === "es" ? "es-BO" : "en", `${site.url}/${l}${p}`]),
      ),
    },
  }));
}
