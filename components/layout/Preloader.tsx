"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { emblemPaths, emblemViewBox } from "@/components/ui/emblem-paths";

const KEY = "hb-preloaded";

/**
 * First-visit preloader (plan M1): the emblem draws in (DrawSVG), fills, "EST. 1988 → 2026"
 * counts, then a curtain wipes upward. ≤1.6s, skippable, once per session.
 * An inline script in <head> sets html[data-preloaded] on repeat visits so it never flashes.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (sessionStorage.getItem(KEY) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    sessionStorage.setItem(KEY, "1");
    const year = { v: 1988 };
    const yearEl = root.querySelector("[data-year]")!;
    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    tl.fromTo(
      root.querySelectorAll("path"),
      { drawSVG: "0%", fillOpacity: 0 },
      { drawSVG: "100%", duration: 0.7, ease: "power2.inOut", stagger: 0.05 },
    )
      .to(root.querySelectorAll("path"), { fillOpacity: 1, strokeOpacity: 0, duration: 0.3 }, "-=0.15")
      .to(
        year,
        {
          v: new Date().getFullYear(),
          duration: 0.8,
          ease: "power2.out",
          onUpdate: () => (yearEl.textContent = String(Math.round(year.v))),
        },
        0.2,
      )
      .to(root.querySelectorAll("[data-wings]"), { scaleX: 1, duration: 0.6, ease: "expo.out" }, 0.4)
      .to(root, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: "power3.inOut" }, "+=0.05");

    const skip = () => tl.progress(1);
    window.addEventListener("keydown", skip, { once: true });
    root.addEventListener("click", skip, { once: true });
    return () => {
      tl.kill();
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      data-preloader
      aria-hidden
      className="fixed inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center gap-8 bg-hb-night text-white"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <svg
        viewBox={emblemViewBox}
        className="size-24 text-hb-blue"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={0.6}
      >
        {emblemPaths.map((d) => (
          <path key={d.slice(0, 16)} d={d} fillOpacity={0} />
        ))}
      </svg>
      <div className="flex items-center gap-4">
        <span data-wings className="block h-px w-16 origin-right scale-x-0 bg-white/40" />
        <p className="eyebrow tabular text-white/80">
          EST. 1988 → <span data-year>1988</span>
        </p>
        <span data-wings className="block h-px w-16 origin-left scale-x-0 bg-white/40" />
      </div>
    </div>
  );
}
