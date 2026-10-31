"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Eyebrow label that scrambles in like an instrument readout (plan M15). */
export function Eyebrow({
  children,
  className,
  dot = true,
}: {
  children: string;
  className?: string;
  dot?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = ref.current!.querySelector("[data-text]")!;
      gsap.to(el, {
        duration: 1.2,
        scrambleText: { text: children, chars: "0123456789ABCDEF·/", speed: 0.6, revealDelay: 0.25 },
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
      });
    },
    { scope: ref, dependencies: [children] },
  );

  return (
    <span ref={ref} className={cn("eyebrow inline-flex items-center gap-3", className)}>
      {dot && <span aria-hidden className="h-px w-8 bg-current opacity-60" />}
      <span data-text aria-label={children}>
        {children}
      </span>
    </span>
  );
}
