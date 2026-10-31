"use client";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFinePointerDesktop, usePrefersReducedMotion } from "@/lib/hooks";

/** Custom cursor ring that grows into "VER"/"ARRASTRA" over media and rails (plan M14). Desktop only. */
export function Cursor() {
  const enabled = useFinePointerDesktop();
  const reduced = usePrefersReducedMotion();
  const t = useTranslations("common");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [mode, setMode] = useState<"" | "view" | "drag" | "link">("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || reduced) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button");
      const m = target?.dataset.cursor as "view" | "drag" | undefined;
      setMode(m ?? (target ? "link" : ""));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, reduced, x, y]);

  if (!enabled || reduced) return null;
  const big = mode === "view" || mode === "drag";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white text-[10px] font-semibold tracking-[0.2em] text-white uppercase"
        animate={{
          width: big ? 88 : mode === "link" ? 44 : 22,
          height: big ? 88 : mode === "link" ? 44 : 22,
          backgroundColor: big ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
        }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      >
        <AnimatePresence>
          {big && (
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-black"
            >
              {mode === "view" ? t("view") : t("drag")}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
