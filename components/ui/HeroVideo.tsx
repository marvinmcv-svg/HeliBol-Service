"use client";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Src = { mp4: string; webm?: string };

/**
 * Full-bleed background video for inner-page heroes. Attaches after first paint (the poster image
 * underneath stays the LCP), fades in once playable, slow-zooms, and has a pause control (WCAG 2.2.2).
 * Never loads for reduced-motion users.
 */
export function HeroVideo({
  desktop,
  mobile,
  label,
}: {
  desktop: Src;
  mobile?: Src;
  label: { pause: string; play: string };
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setTimeout(() => setLoad(true), 400));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  if (reduced || !load) return null;

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <>
      <video
        ref={ref}
        className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition-[opacity,transform] duration-[2s] ease-out data-[ready]:scale-100 data-[ready]:opacity-75"
        data-ready={ready ? "" : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onCanPlay={() => setReady(true)}
        aria-hidden
      >
        {mobile?.webm && <source media="(max-width: 767px)" src={mobile.webm} type="video/webm" />}
        {mobile && <source media="(max-width: 767px)" src={mobile.mp4} type="video/mp4" />}
        {desktop.webm && <source src={desktop.webm} type="video/webm" />}
        <source src={desktop.mp4} type="video/mp4" />
      </video>
      {ready && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-5 bottom-5 z-20 flex size-11 items-center justify-center rounded-full border border-white/25 bg-hb-night/60 text-white/80 transition-colors hover:bg-white hover:text-hb-night sm:right-8 sm:bottom-8"
          aria-label={paused ? label.play : label.pause}
        >
          {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
        </button>
      )}
    </>
  );
}
