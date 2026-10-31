"use client";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Img } from "@/content/media";
import { cn } from "@/lib/utils";

/**
 * Image reveal (plan M12): clip-path inset 100%→0 with a 1.2→1.0 scale, plus optional
 * scroll parallax. Fills its (relatively positioned, sized) parent.
 */
export function RevealImage({
  image,
  sizes,
  className,
  imgClassName,
  parallax = 0,
  priority = false,
  reveal = true,
  cursor = true,
}: {
  image: Img;
  sizes: string;
  className?: string;
  imgClassName?: string;
  /** yPercent travel while scrolling past, e.g. 10. */
  parallax?: number;
  priority?: boolean;
  reveal?: boolean;
  cursor?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale() as "es" | "en";

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const wrap = ref.current!;
      const inner = wrap.querySelector<HTMLElement>("[data-inner]")!;
      if (reveal) {
        gsap.fromTo(
          wrap,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.3,
            ease: "expo.out",
            scrollTrigger: { trigger: wrap, start: "top 88%", once: true },
          },
        );
        gsap.fromTo(
          inner,
          { scale: 1.2 },
          {
            scale: 1,
            duration: 1.6,
            ease: "expo.out",
            scrollTrigger: { trigger: wrap, start: "top 88%", once: true },
          },
        );
      }
      if (parallax) {
        gsap.fromTo(
          inner.firstElementChild,
          { yPercent: -parallax },
          {
            yPercent: parallax,
            ease: "none",
            scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn("absolute inset-0 overflow-hidden", className)}
      data-cursor={cursor ? "view" : undefined}
    >
      <div data-inner className="absolute inset-0 will-change-transform">
        <div className={cn("absolute inset-0", parallax ? "-inset-y-[12%]" : "")}>
          <Image
            src={image.src}
            alt={image.alt[locale]}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            className={cn("object-cover", imgClassName)}
            style={{ objectPosition: image.position }}
          />
        </div>
      </div>
    </div>
  );
}
