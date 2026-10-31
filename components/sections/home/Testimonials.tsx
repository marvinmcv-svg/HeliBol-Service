import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { testimonials } from "@/content/testimonials";

/**
 * Testimonials (plan §6.10). Never fabricated: hidden unless NEXT_PUBLIC_SHOW_TESTIMONIALS=true
 * AND real, client-approved quotes exist in content/testimonials.ts.
 */
export async function Testimonials() {
  if (process.env.NEXT_PUBLIC_SHOW_TESTIMONIALS !== "true" || testimonials.length === 0) return null;
  const t = await getTranslations("home.testimonials");
  const locale = (await getLocale()) as "es" | "en";
  return (
    <section className="bg-hb-sky py-24 lg:py-32">
      <div className="container-hb">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
        <ul className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((q) => (
            <li key={q.name} className="rounded-[24px] bg-white p-8 shadow-sm">
              <blockquote className="text-lg leading-relaxed">“{q.quote[locale]}”</blockquote>
              <p className="mt-6 font-semibold">{q.name}</p>
              <p className="text-sm text-ink-soft">{q.role[locale]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
