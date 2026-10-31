"use client";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useLayoutEffect, useRef, useState } from "react";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap, useGSAP } from "@/lib/gsap";

if (typeof window !== "undefined") gsap.registerPlugin(MotionPathPlugin);
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

/** Smooth flight path through every milestone dot, bulging alternately left and right between them. */
function buildPath(points: { x: number; y: number }[], amp: number, top: number, bottom: number) {
  if (!points.length) return "";
  const pts = [{ x: points[0]!.x, y: top }, ...points, { x: points[points.length - 1]!.x, y: bottom }];
  let d = `M${pts[0]!.x},${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!,
      b = pts[i]!;
    const s = i % 2 ? 1 : -1;
    const dy = b.y - a.y;
    d += ` C${a.x + amp * s},${a.y + dy * 0.35} ${b.x + amp * s},${b.y - dy * 0.35} ${b.x},${b.y}`;
  }
  return d;
}

/** Top-down helicopter glyph that flies along the path (rotor spins in CSS). */
function HeliGlyph() {
  return (
    <g data-heli>
      <g transform="scale(1.6) translate(-14,-14)">
        <ellipse cx="14" cy="16" rx="5" ry="7.5" fill="#1C75BC" stroke="white" strokeWidth="1.5" />
        <rect x="13" y="22" width="2" height="12" rx="1" fill="#1C75BC" />
        <rect x="9.5" y="32" width="9" height="2" rx="1" fill="#1C75BC" />
        <g className="origin-[14px_15px] animate-[spin_0.35s_linear_infinite] motion-reduce:animate-none">
          <line
            x1="0"
            y1="15"
            x2="28"
            y2="15"
            stroke="#06131F"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            x1="14"
            y1="1"
            x2="14"
            y2="29"
            stroke="#06131F"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
        <circle cx="14" cy="15" r="1.8" fill="#F2A23A" />
      </g>
    </g>
  );
}

/**
 * "Since 1988" timeline: a flight path draws itself as you scroll, a helicopter flies its tip,
 * milestones pop in as it reaches them (dot burst, year scramble, card slide), photos parallax and
 * the Bell 47 turns from sepia to colour. Reduced motion: everything static and visible.
 */
export function Timeline({ items }: { items: Item[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale() as "es" | "en";
  const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);

  // Measure the milestone dots and rebuild the path whenever the layout changes.
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const measure = () => {
      const box = root.getBoundingClientRect();
      const dots = [...root.querySelectorAll<HTMLElement>("[data-dot]")].map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      const wide = box.width >= 768;
      const d = buildPath(dots, wide ? 70 : 10, 0, box.height);
      setGeo((g) => (g && g.d === d ? g : { d, w: box.width, h: box.height }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = ref.current!;
      if (!geo) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const path = root.querySelector<SVGPathElement>("[data-path]")!;
      const heli = root.querySelector<SVGGElement>("[data-heli]");
      const flight = { start: "top 62%", end: "bottom 62%" };

      if (reduced) {
        gsap.set(path, { drawSVG: "100%" });
        if (heli) gsap.set(heli, { autoAlpha: 0 });
        return;
      }

      gsap.fromTo(
        path,
        { drawSVG: "0%" },
        { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: root, ...flight, scrub: 0.6 } },
      );
      if (heli)
        gsap.to(heli, {
          ease: "none",
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 90 },
          scrollTrigger: { trigger: root, ...flight, scrub: 0.6 },
        });

      root.querySelectorAll<HTMLElement>("[data-item]").forEach((item, i) => {
        const dot = item.querySelector("[data-dot]");
        const ring = item.querySelector("[data-ring]");
        const year = item.querySelector<HTMLElement>("[data-year]");
        const copy = item.querySelectorAll("[data-copy] > :not([data-year])");
        const media = item.querySelector("[data-media]");
        const fromLeft = i % 2 === 0;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: dot, start: "center 62%", toggleActions: "play none none reverse" },
        });
        tl.from(dot, { scale: 0, duration: 0.6, ease: "back.out(3)" })
          .fromTo(
            ring,
            { scale: 0.4, autoAlpha: 0.9 },
            { scale: 2.6, autoAlpha: 0, duration: 1, ease: "power2.out" },
            "<",
          )
          .from(
            year,
            {
              autoAlpha: 0,
              scale: 0.7,
              duration: 0.8,
              ease: "expo.out",
              scrambleText: {
                text: year?.textContent ?? "",
                // Digits for real years ("1988"), letters for word labels ("Crecimiento").
                chars: /^\d+$/.test(year?.textContent ?? "") ? "0123456789" : "upperAndLowerCase",
                speed: 0.6,
              },
            },
            "<",
          )
          .from(copy, { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.08, ease: "expo.out" }, "<0.1")
          .fromTo(
            media,
            { clipPath: fromLeft ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", x: fromLeft ? 40 : -40 },
            { clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: 1.2, ease: "expo.out" },
            "<",
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
    { scope: ref, dependencies: [geo?.d], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className="relative overflow-x-clip">
      {geo && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={geo.w}
          height={geo.h}
          viewBox={`0 0 ${geo.w} ${geo.h}`}
        >
          <path
            d={geo.d}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="2"
            strokeDasharray="2 8"
            strokeLinecap="round"
          />
          <path
            data-path
            d={geo.d}
            fill="none"
            stroke="url(#tl-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="tl-grad" x1="0" y1="0" x2="0" y2={geo.h} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F2A23A" />
              <stop offset="35%" stopColor="#1C75BC" />
              <stop offset="100%" stopColor="#0B3A63" />
            </linearGradient>
          </defs>
          <HeliGlyph />
        </svg>
      )}
      <ol className="relative space-y-24 md:space-y-40">
        {items.map((it, i) => {
          const image = img(images[i] ?? "bell412-golden-hour");
          const even = i % 2 === 0;
          return (
            <li
              key={it.title}
              data-item
              className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-8 pl-12 md:grid-cols-2 md:gap-28 md:pl-0"
            >
              <span
                aria-hidden
                className="absolute top-2 left-4 z-10 -translate-x-1/2 md:top-1/2 md:left-1/2 md:-translate-y-1/2"
              >
                <span
                  data-ring
                  className="absolute inset-0 rounded-full border-2 border-hb-sunset opacity-0"
                />
                <span
                  data-dot
                  className="relative block size-4 rounded-full border-[3px] border-hb-blue bg-white shadow-[0_0_0_6px_rgba(28,117,188,0.12)]"
                />
              </span>
              <div data-copy className={cn(even ? "md:order-1 md:text-right" : "md:order-2")}>
                <p
                  data-year
                  className={cn(
                    "tabular font-display text-[clamp(2.25rem,9vw,6rem)] leading-none font-medium text-hb-blue",
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
                data-media
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_30px_60px_-30px_rgba(6,19,31,0.4)]",
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
                      className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      style={{ objectPosition: image.position }}
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
