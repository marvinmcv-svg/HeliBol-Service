"use client";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Counts up from 0 the first time it scrolls into view, then tweens between values when `value`
 * changes (e.g. a unit toggle). Writes straight to the DOM — no re-render per frame.
 */
export function AnimatedNumber({
  value,
  locale,
  duration = 1.6,
  delay = 0,
}: {
  value: number;
  locale: "es" | "en";
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const shown = useRef(0);
  const started = useRef(false);
  const nf = new Intl.NumberFormat(locale === "es" ? "es-BO" : "en-US");

  // Park at 0 until it scrolls into view (the server render shows the real figure for no-JS/SEO).
  useEffect(() => {
    if (!reduced && !started.current && ref.current) ref.current.textContent = nf.format(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = nf.format(value);
      shown.current = value;
      return;
    }
    const first = !started.current;
    started.current = true;
    const controls = animate(shown.current, value, {
      duration: first ? duration : 0.7,
      delay: first ? delay : 0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        shown.current = v;
        el.textContent = nf.format(Math.round(v));
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inView, reduced]);

  return (
    <span ref={ref} className="tabular">
      {nf.format(value)}
    </span>
  );
}
