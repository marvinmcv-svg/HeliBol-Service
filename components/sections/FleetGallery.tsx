"use client";
import { motion, useReducedMotion } from "motion/react";
import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import type { Img } from "@/content/media";

/**
 * Masonry gallery: every photo keeps its native aspect ratio (no forced square crops),
 * and opens in the full-screen lightbox.
 */
export function FleetGallery({ images }: { images: Img[] }) {
  const t = useTranslations("fleetPage");
  const locale = useLocale() as "es" | "en";
  const reduced = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 [&>li]:mb-4">
        {images.map((im, i) => (
          <motion.li
            key={im.src}
            className="break-inside-avoid"
            initial={reduced ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (i % 2) * 0.08 }}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block w-full overflow-hidden rounded-[20px] bg-hb-sky"
              style={{ aspectRatio: `${im.width} / ${im.height}` }}
              aria-label={`${t("openGallery")}: ${im.alt[locale]}`}
              data-cursor="view"
            >
              <Image
                src={im.src}
                alt={im.alt[locale]}
                fill
                sizes="(min-width:1024px) 28vw, (min-width:640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={im.blurDataURL}
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-hb-night/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span
                aria-hidden
                className="absolute right-4 bottom-4 left-4 flex translate-y-3 items-end justify-between gap-3 text-left text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                <span className="line-clamp-2 text-sm leading-snug">{im.alt[locale]}</span>
                <span className="shrink-0 rounded-full bg-white/15 p-2 backdrop-blur-md">
                  <Maximize2 className="size-4" />
                </span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
      <Lightbox
        images={images}
        index={index}
        onIndex={setIndex}
        onClose={() => setIndex(null)}
        locale={locale}
        labels={{
          close: t("close"),
          prev: t("prev"),
          next: t("next"),
          counter: (current, total) => t("photo", { current, total }),
        }}
      />
    </>
  );
}
