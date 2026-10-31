"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "./SmoothScroll";
import { cn } from "@/lib/utils";

/** Infinite ticker that speeds up with scroll velocity (plan M11). */
export function Marquee({
  items,
  className,
  speed = 40,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const track = ref.current?.querySelector<HTMLElement>("[data-track]");
      if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const half = track.scrollWidth / 2;
      const tween = gsap.to(track, { x: -half, duration: half / speed, ease: "none", repeat: -1 });
      const onScroll = ({ velocity }: { velocity: number }) => {
        gsap.to(tween, {
          timeScale: 1 + Math.min(Math.abs(velocity) / 8, 4),
          duration: 0.3,
          overwrite: true,
        });
        gsap.to(tween, { timeScale: 1, duration: 1.2, delay: 0.3 });
      };
      lenis?.on("scroll", onScroll);
      return () => lenis?.off("scroll", onScroll);
    },
    { scope: ref, dependencies: [lenis] },
  );

  const row = (hidden: boolean) =>
    items.map((t, i) => (
      <span
        key={`${hidden}-${i}`}
        aria-hidden={hidden || undefined}
        className="flex shrink-0 items-center gap-8 pr-8"
      >
        <span>{t}</span>
        <span className="size-1.5 rounded-full bg-hb-sunset" />
      </span>
    ));

  return (
    <div ref={ref} className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div data-track className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
