"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Odometer: each digit slots vertically to its value (plan M7). Non-digits ("+", "/") stay static. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const cols = gsap.utils.toArray<HTMLElement>("[data-digit]", ref.current);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cols.forEach((c) => gsap.set(c, { yPercent: -Number(c.dataset.digit) * 5 }));
        return;
      }
      gsap.fromTo(
        cols,
        { yPercent: 0 },
        {
          yPercent: (i, el: HTMLElement) => -(Number(el.dataset.digit) + 10) * (100 / 20),
          duration: 2,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <span
      ref={ref}
      className={cn("tabular inline-flex leading-none", className)}
      aria-label={value}
      role="img"
    >
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="relative inline-block h-[1em] overflow-hidden">
            {/* Invisible copy sizes the slot to the target digit (proportional figures). */}
            <span className="invisible">{ch}</span>
            <span data-digit={ch} className="absolute inset-x-0 top-0 flex flex-col items-center">
              {Array.from({ length: 20 }, (_, n) => (
                <span key={n} className="block h-[1em]">
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
