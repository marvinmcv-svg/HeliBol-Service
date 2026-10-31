"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Headline split by line, each rising through a mask (plan M2). */
export function SplitHeading({
  as: Tag = "h2",
  children,
  className,
  immediate = false,
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Animate on mount instead of on scroll. */
  immediate?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      // autoSplit re-splits after fonts load / resize and re-runs onSplit.
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            stagger: 0.09,
            delay,
            ease: "expo.out",
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 85%", once: true },
          });
        },
      });
      gsap.set(el, { autoAlpha: 1 });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={cn("[.js_&]:invisible", className)}>
      {children}
    </Tag>
  );
}
