"use client";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Muted inline loop; sources attach after the poster has painted and the element is near view. */
export function VideoLoop({
  mp4,
  webm,
  poster,
  className,
}: {
  mp4: string;
  webm?: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setLoad(true);
          el.play().catch(() => {});
        } else el.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (load) ref.current?.play().catch(() => {});
  }, [load]);

  return (
    <video
      ref={ref}
      className={cn("object-cover", className)}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
    >
      {load && webm && <source src={webm} type="video/webm" />}
      {load && <source src={mp4} type="video/mp4" />}
    </video>
  );
}
