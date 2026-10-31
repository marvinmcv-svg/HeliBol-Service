"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Giant outlined HELIBOL that fills with blue as it scrolls into view (plan §6.12). */
export function BigWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const fill = ref.current!.querySelector("[data-fill]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(fill, { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      gsap.fromTo(
        fill,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: true },
        },
      );
    },
    { scope: ref },
  );
  const cls =
    "block whitespace-nowrap text-center font-display text-[18.5vw] leading-[0.8] font-semibold tracking-[-0.04em] select-none";
  return (
    <div ref={ref} aria-hidden className="relative -mb-[2vw] overflow-hidden">
      <span className={`${cls} text-outline [--stroke:rgb(255_255_255/0.28)]`}>HELIBOL</span>
      <span
        data-fill
        className={`${cls} absolute inset-0 text-hb-blue`}
        style={{ clipPath: "inset(100% 0% 0% 0%)" }}
      >
        HELIBOL
      </span>
    </div>
  );
}
