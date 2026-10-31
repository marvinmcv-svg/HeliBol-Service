"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { fleet, formatSpec } from "@/content/fleet";
import { img } from "@/content/media";
import { cn } from "@/lib/utils";

/**
 * Fleet showroom (plan §6.6, M8): a pinned stage steps Bell 212 → Bell 412 → H125 as you scroll.
 * The aircraft crossfades, the spec table morphs and a giant outlined model name sits behind.
 */
export function FleetShowroom() {
  const t = useTranslations("home.fleet");
  const tc = useTranslations("common");
  const locale = useLocale() as "es" | "en";
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const a = fleet[index]!;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: ref.current!.querySelector("[data-stage]"),
            start: "top top",
            end: `+=${fleet.length * 80}%`,
            pin: true,
            scrub: true,
            snap: { snapTo: 1 / (fleet.length - 1), duration: 0.5, ease: "power3.inOut" },
            onUpdate: (self) =>
              setIndex(Math.min(fleet.length - 1, Math.round(self.progress * (fleet.length - 1)))),
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const imageFor = (i: number) => {
    const f = fleet[i]!;
    return f.cutout ? null : img(f.card);
  };

  return (
    <section ref={ref} className="relative bg-white">
      <div
        data-stage
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24 pb-12 lg:h-[100svh] lg:pt-[max(6.5rem,13svh)] lg:pb-[max(1.5rem,4svh)]"
      >
        <div aria-hidden className="hairline-grid-light absolute inset-0" />
        {/* Desktop: everything fits one viewport while pinned — header on top, the stage takes the rest. */}
        <div className="container-hb relative lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader eyebrow={t("eyebrow")} title={t("title")} compact />
            <div role="tablist" aria-label={t("eyebrow")} className="flex gap-2">
              {fleet.map((f, i) => (
                <button
                  key={f.slug}
                  role="tab"
                  type="button"
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors",
                    i === index
                      ? "border-hb-blue bg-hb-blue text-white"
                      : "border-line text-ink-soft hover:border-ink/40",
                  )}
                >
                  {f.model.replace("Airbus ", "")}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-10 grid items-center gap-10 lg:mt-[max(1rem,3svh)] lg:min-h-0 lg:flex-1 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            {/* Giant outlined model name */}
            <AnimatePresence mode="popLayout">
              <motion.p
                key={a.slug}
                aria-hidden
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-outline pointer-events-none absolute -top-6 left-0 font-display text-[18vw] leading-none font-semibold whitespace-nowrap select-none [--stroke:rgb(28_117_188/0.35)] lg:top-0 lg:text-[min(13vw,24svh)]"
              >
                {a.model.replace("Airbus ", "")}
              </motion.p>
            </AnimatePresence>

            <div
              className="relative aspect-[16/10] lg:aspect-auto lg:h-full lg:max-h-[62svh]"
              data-cursor="view"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={a.slug}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.94, x: 80 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 1.04, x: -80 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  {a.cutout ? (
                    <motion.div
                      className="absolute inset-0"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    >
                      <Image
                        src={a.cutout}
                        alt={img("bell412-white-sky").alt[locale]}
                        fill
                        sizes="(min-width:1024px) 55vw, 100vw"
                        className="object-contain drop-shadow-[0_40px_40px_rgba(6,19,31,0.25)]"
                      />
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 overflow-hidden rounded-[28px]">
                      <Image
                        src={imageFor(index)!.src}
                        alt={imageFor(index)!.alt[locale]}
                        fill
                        sizes="(min-width:1024px) 55vw, 100vw"
                        placeholder="blur"
                        blurDataURL={imageFor(index)!.blurDataURL}
                        className="object-cover"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={a.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="eyebrow text-hb-blue-ink">{a.variants}</p>
                  <h3 className="mt-3 text-4xl font-medium tracking-tight lg:text-[clamp(1.75rem,5svh,2.25rem)]">
                    {a.model}
                  </h3>
                  <p className="mt-1 font-display text-xl text-ink-soft lg:text-[clamp(1rem,2.6svh,1.25rem)]">
                    “{a.nickname[locale]}”
                  </p>
                  <dl className="mt-8 divide-y divide-line border-y border-line lg:mt-[max(1rem,3svh)]">
                    {a.specs.map((s) => (
                      <motion.div
                        layout
                        key={s.key}
                        className="flex items-baseline justify-between gap-6 py-3 lg:py-[clamp(0.35rem,1.3svh,0.75rem)]"
                      >
                        <dt className="text-sm text-ink-soft">{s.label[locale]}</dt>
                        <dd className="tabular text-right font-medium">{formatSpec(s, "metric", locale)}</dd>
                      </motion.div>
                    ))}
                  </dl>
                  <p className="mt-5 text-sm text-ink-soft lg:mt-[max(0.75rem,2svh)]">
                    <span className="font-semibold text-ink">{t("bestFor")}:</span>{" "}
                    {a.bestFor[locale].join(" · ")}
                  </p>
                  <Link
                    href={`/flota/${a.slug}`}
                    className="group mt-8 inline-flex items-center gap-2 font-semibold text-hb-blue lg:mt-[max(0.75rem,2.5svh)]"
                  >
                    {tc("viewSpecs")}{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <div className="container-hb relative pb-24">
        <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-hb-sky/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-xl font-medium">{t("turnkeyTitle")}</p>
            <p className="mt-1 max-w-2xl text-ink-soft">{t("turnkeyBody")}</p>
          </div>
          <Button
            href={{ pathname: "/cotizar", query: { type: "turnkey" } }}
            variant="ghost-dark"
            event="cta_quote"
          >
            {t("turnkeyCta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
