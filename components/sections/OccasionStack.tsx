"use client";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight, Briefcase, Cake, Camera, Gem, Heart } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { siWhatsapp } from "simple-icons";
import { img, type ImageKey } from "@/content/media";
import { whatsappHref } from "@/content/site";
import { track } from "@/lib/analytics";

type Occasion = { title: string; body: string; tag: string };

const media: { key: ImageKey; icon: typeof Cake }[] = [
  { key: "bell412-golden-hour", icon: Cake },
  { key: "scenic-waterfall", icon: Heart },
  { key: "hero-mountain-edge", icon: Gem },
  { key: "bell412-white-sky", icon: Briefcase },
  { key: "h125-longline", icon: Camera },
];

/**
 * Stack-pinning scroll: each occasion card pins in place and the next one slides over it, while
 * the cards underneath recede (scale + dim). Reduced motion keeps the sticky stack, no transforms.
 */
export function OccasionStack({
  items,
  cta,
  messagePrefix,
}: {
  items: Occasion[];
  cta: string;
  messagePrefix: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = items.length;

  return (
    <div ref={ref} className="relative">
      {items.map((o, i) => (
        <Card
          key={o.title}
          o={o}
          i={i}
          n={n}
          progress={scrollYProgress}
          cta={cta}
          href={whatsappHref(`${messagePrefix} ${o.title}.`)}
        />
      ))}
    </div>
  );
}

function Card({
  o,
  i,
  n,
  progress,
  cta,
  href,
}: {
  o: Occasion;
  i: number;
  n: number;
  progress: MotionValue<number>;
  cta: string;
  href: string;
}) {
  const locale = useLocale() as "es" | "en";
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { key, icon: Icon } = media[i % media.length]!;
  const image = img(key);

  // Image settles from zoomed-in as the card slides up into place.
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imgScale = useTransform(enter, [0, 1], [1.35, 1]);
  // Once pinned, recede as later cards stack on top.
  const targetScale = 1 - (n - 1 - i) * 0.05;
  // Card i pins after i viewport-heights of scrolling, out of n - 1 in total.
  const seg = Math.max(1, n - 1);
  const last = i === n - 1;
  const scale = useTransform(progress, [last ? 0 : i / seg, 1], [1, targetScale]);
  // Dim only while the next card is actually sliding over this one.
  const dim = useTransform(progress, last ? [0, 1] : [(i + 0.45) / seg, (i + 1) / seg], [0, last ? 0 : 0.5]);

  return (
    <div ref={ref} className="sticky top-0 flex h-[100svh] items-center justify-center">
      <motion.article
        style={reduced ? { top: `${i * 18}px` } : { scale, top: `${i * 18}px` }}
        className="relative h-[min(78svh,760px)] w-full origin-top overflow-hidden rounded-[32px] bg-hb-night text-white shadow-[0_-30px_80px_-30px_rgba(6,19,31,0.6)]"
      >
        <motion.div style={reduced ? undefined : { scale: imgScale }} className="absolute inset-0">
          <Image
            src={image.src}
            alt={image.alt[locale]}
            fill
            sizes="(min-width:1440px) 1344px, 100vw"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            className="object-cover"
            style={{ objectPosition: image.position }}
          />
        </motion.div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-hb-night/90 via-hb-night/45 to-transparent"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-hb-night/70 via-transparent" />
        <div className="relative flex h-full flex-col justify-between p-7 sm:p-12 lg:p-16">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">
                <Icon className="size-5 text-hb-sunset" aria-hidden />
              </span>
              <span className="eyebrow text-white/80">{o.tag}</span>
            </span>
            <span className="tabular font-display text-lg text-white/90 [text-shadow:0_1px_12px_rgba(6,19,31,0.6)]">
              {String(i + 1).padStart(2, "0")}{" "}
              <span className="text-white/55">/ {String(n).padStart(2, "0")}</span>
            </span>
          </div>
          <div className="max-w-xl">
            <h3 className="text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-medium tracking-[-0.03em]">
              {o.title}
            </h3>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">{o.body}</p>
            {href && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("cta_whatsapp", { from: "occasion", occasion: o.title })}
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white py-2 pr-5 pl-2 text-sm font-semibold text-hb-night transition-colors hover:bg-hb-sunset"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
                    <path d={siWhatsapp.path} />
                  </svg>
                </span>
                {cta}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>
        <motion.div
          aria-hidden
          style={reduced ? undefined : { opacity: dim }}
          className="pointer-events-none absolute inset-0 bg-hb-night opacity-0"
        />
      </motion.article>
    </div>
  );
}
