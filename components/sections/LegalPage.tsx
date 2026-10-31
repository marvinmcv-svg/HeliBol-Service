import type { Localized } from "@/content/site";

export function LegalPage({
  title,
  updated,
  sections,
  locale,
}: {
  title: string;
  updated: string;
  sections: { h: Localized; p: Localized }[];
  locale: "es" | "en";
}) {
  return (
    <>
      <section className="grain hairline-grid relative bg-hb-night pt-40 pb-16 text-white">
        <div className="container-hb relative z-10">
          <h1 className="text-[clamp(2.5rem,6vw,5rem)] leading-none font-medium tracking-tight">{title}</h1>
          <p className="eyebrow mt-6 text-white/50">
            {locale === "es" ? "Actualizado" : "Updated"} · <time dateTime={updated}>{updated}</time>
          </p>
        </div>
      </section>
      <article className="container-hb max-w-3xl py-20">
        {sections.map((s) => (
          <section key={s.h.en} className="border-b border-line py-8 first:pt-0">
            <h2 className="font-sans text-xl font-semibold">{s.h[locale]}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{s.p[locale]}</p>
          </section>
        ))}
      </article>
    </>
  );
}
