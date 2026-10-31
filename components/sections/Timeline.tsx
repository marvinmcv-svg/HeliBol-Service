"use client";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { img, type ImageKey } from "@/content/media";
import { cn } from "@/lib/utils";

type Item = { year: string; title: string; body: string };
const images: ImageKey[] = [
  "heritage-bell47",
  "logistics-camp",
  "survey-1",
  "h125-plateau",
  "bell412-golden-hour",
];

/**
 * "Since 1988" timeline (plan M10): the spine draws as you scroll, years scale up when active,
 * photos parallax, and the Bell 47 starts in sepia and turns to colour.
 */
export function Timeline({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale() as "es" | "en";

  useGSAP(
    () => {
      const root = ref.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(root.querySelector("[data-spine]"), { scaleY: 1 });
        return;
      }
      gsap.fromTo(
        root.querySelector("[data-spine]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top 60%", end: "bottom 60%", scrub: true },
        },
      );
      root.querySelectorAll<HTMLElement>("[data-item]").forEach((item) => {
        const year = item.querySelector("[data-year]");
        gsap.fromTo(
          year,
          { scale: 0.7, opacity: 0.25 },
          {
            scale: 1,
            opacity: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 70%", end: "top 40%", scrub: true },
          },
        );
        const photo = item.querySelector("[data-photo]");
        gsap.fromTo(
          photo,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        const sepia = item.querySelector("[data-sepia]");
        if (sepia)
          gsap.fromTo(
            sepia,
            { filter: "sepia(1) saturate(0.6) contrast(1.05)" },
            {
              filter: "sepia(0) saturate(1) contrast(1)",
              ease: "none",
              scrollTrigger: { trigger: item, start: "top 75%", end: "bottom 45%", scrub: true },
            },
          );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative">
      <div aria-hidden className="absolute top-0 bottom-0 left-4 w-px bg-line md:left-1/2">
        <div data-spine className="h-full w-px origin-top bg-hb-blue" />
      </div>
      <ol className="space-y-24 md:space-y-36">
        {items.map((it, i) => {
          const image = img(images[i] ?? "bell412-golden-hour");
          const even = i % 2 === 0;
          return (
            <li
              key={it.title}
              data-item
              className="relative grid items-center gap-8 pl-12 md:grid-cols-2 md:gap-20 md:pl-0"
            >
              <span
                aria-hidden
                className="absolute top-2 left-4 size-3 -translate-x-1/2 rounded-full border-2 border-hb-blue bg-white md:top-1/2 md:left-1/2"
              />
              <div className={cn(even ? "md:order-1 md:text-right" : "md:order-2")}>
                <p
                  data-year
                  className={cn(
                    "tabular font-display text-6xl font-medium text-hb-blue md:text-8xl",
                    even ? "origin-right" : "origin-left",
                  )}
                >
                  {it.year}
                </p>
                <h3 className="mt-3 text-2xl font-medium">{it.title}</h3>
                <p className={cn("mt-3 max-w-md leading-relaxed text-ink-soft", even && "md:ml-auto")}>
                  {it.body}
                </p>
              </div>
              <div
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-[24px]",
                  even ? "md:order-2" : "md:order-1",
                )}
              >
                <div data-photo className="absolute inset-x-0 -inset-y-[10%]">
                  <div data-sepia={i === 0 ? "" : undefined} className="absolute inset-0">
                    <Image
                      src={image.src}
                      alt={image.alt[locale]}
                      fill
                      sizes="(min-width:768px) 45vw, 90vw"
                      placeholder="blur"
                      blurDataURL={image.blurDataURL}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
