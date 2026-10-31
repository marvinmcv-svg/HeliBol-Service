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
