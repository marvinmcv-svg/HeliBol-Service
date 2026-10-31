"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointerDesktop, useIdle, usePrefersReducedMotion } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { img, video } from "@/content/media";
import { site, yearsFlying } from "@/content/site";

const RotorWashField = dynamic(() => import("@/components/three/RotorWashField"), { ssr: false });

/**
 * Home hero "lift-off" (plan §6.2, M2/M3): poster paints first (LCP), then the video loop
 * fades in; on scroll the frame scales 1→1.15, the headline rises line by line and the HUD ticks.
 */
export function Hero() {
  const t = useTranslations("home.hero");
  const tc = useTranslations("common");
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const desktop = useFinePointerDesktop();
  const idle = useIdle(2000);
  const [videoReady, setVideoReady] = useState(false);
  const [loadVideo, setLoadVideo] = useState(false);
  const poster = img("hero-mountain-edge");

  // Video only after the poster has painted (plan §10).
  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setTimeout(() => setLoadVideo(true), 300));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  // Scroll scrub only — the entry animation is CSS (see globals.css .hb-rise) so it doesn't wait for hydration.
  useGSAP(
    () => {
      const root = ref.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const alt = root.querySelector("[data-alt]")!;
      const counter = { v: 0 };
      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } })
        .to(root.querySelector("[data-media]"), { scale: 1.15, ease: "none" }, 0)
        .to(root.querySelector("[data-copy]"), { yPercent: -25, autoAlpha: 0, ease: "none" }, 0)
        .to(
          counter,
          {
            v: yearsFlying,
            ease: "none",
            onUpdate: () => (alt.textContent = String(Math.round(counter.v)).padStart(2, "0")),
          },
          0,
        );
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="grain relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-hb-night text-white"
      aria-label="Helibol"
    >
      <div data-media className="absolute inset-0 will-change-transform">
        <Image
          src={poster.src}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL={poster.blurDataURL}
          className="object-cover"
        />
        {loadVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover transition-opacity duration-[1.5s]"
            style={{ opacity: videoReady ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={video.heroDesktop.poster}
            onCanPlay={() => setVideoReady(true)}
            aria-hidden
          >
            <source media="(max-width: 767px)" src={video.heroMobile.webm} type="video/webm" />
            <source media="(max-width: 767px)" src={video.heroMobile.mp4} type="video/mp4" />
            <source src={video.heroDesktop.webm} type="video/webm" />
            <source src={video.heroDesktop.mp4} type="video/mp4" />
          </video>
        )}
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/45 to-hb-night/30"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-hb-night/70 via-transparent to-transparent"
      />
      {desktop && idle && !reduced && (
        <div aria-hidden className="absolute inset-0 mix-blend-screen">
          <RotorWashField />
        </div>
      )}
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-40" />

      <div data-copy className="container-hb relative z-10 flex h-full flex-col justify-end pb-28 md:pb-32">
        <p className="hb-fade-up eyebrow max-w-full text-hb-sunset">{t("eyebrow")}</p>
        <h1 className="mt-6 max-w-[15ch] text-[clamp(2.9rem,8.2vw,8.25rem)] leading-[0.92] font-medium tracking-[-0.03em]">
          {t("title")
            .split(" ")
            .map((word, i) => (
              <Fragment key={i}>
                <span className="split-line inline-block align-top">
                  <span
                    className="hb-rise inline-block"
                    style={{ "--d": `${0.15 + i * 0.07}s` } as React.CSSProperties}
                  >
                    {word}
                  </span>
                </span>{" "}
              </Fragment>
            ))}
        </h1>
        <p
          className="hb-slide mt-7 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl"
          style={{ "--d": "0.5s" } as React.CSSProperties}
        >
          {t("sub")}
        </p>
        <div
          className="hb-fade-up mt-10 flex flex-wrap gap-3"
          style={{ "--d": "0.6s" } as React.CSSProperties}
        >
          <Button href="/cotizar" event="cta_quote" variant="primary">
            {tc("quote")}
          </Button>
          <HeliButton variant="ghost" />
        </div>
      </div>

      {/* HUD */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="container-hb flex items-end justify-between pb-6 text-white/60">
          <p className="eyebrow hidden md:block">
            {site.hudCoords} · {t("hud")}
          </p>
          <div className="eyebrow tabular hidden items-center gap-3 lg:flex">
            <span>{t("altitude")}</span>
            <span className="flex flex-col gap-[3px]">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`block h-px bg-white/50 ${i % 2 ? "w-2" : "w-4"}`} />
              ))}
            </span>
            <span>
              FL <span data-alt>00</span> {tc("years").toUpperCase()}
            </span>
          </div>
          <p className="eyebrow flex items-center gap-2">
            {t("scroll")} <ArrowDown className="size-3.5 animate-bounce" />
          </p>
        </div>
      </div>
    </section>
  );
}
