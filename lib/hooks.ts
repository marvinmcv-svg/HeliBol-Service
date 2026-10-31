"use client";
import { useEffect, useState, useSyncExternalStore } from "react";

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
/** Desktop with a precise pointer — gate for WebGL, tilt, custom cursor (plan §10). */
export const useFinePointerDesktop = () => useMediaQuery("(min-width: 1024px) and (pointer: fine)");
export const useIsTouch = () => useMediaQuery("(hover: none), (pointer: coarse)");

/** True once the browser is idle after first paint. */
export function useIdle(timeout = 1500) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setIdle(true), { timeout });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setIdle(true), timeout);
    return () => clearTimeout(t);
  }, [timeout]);
  return idle;
}

/**
 * Floating buttons get out of the way while reading: hidden while scrolling down (past `offset`),
 * back on scroll-up or once scrolling stops.
 */
export function useScrollAway(offset = 240, idleMs = 800) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > offset && y > last + 4) setHidden(true);
      else if (y < last - 4) setHidden(false);
      last = y;
      clearTimeout(timer);
      timer = setTimeout(() => setHidden(false), idleMs);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [offset, idleMs]);
  return hidden;
}
