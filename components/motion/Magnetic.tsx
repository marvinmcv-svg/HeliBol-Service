"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useIsTouch } from "@/lib/hooks";

const spring = { stiffness: 260, damping: 26 };

/** Element follows the cursor up to ±strength px (plan M4). */
export function Magnetic({
  children,
  strength = 8,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const touch = useIsTouch();
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);

  const onMove = (e: React.PointerEvent) => {
    if (touch || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 2 * strength);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 2 * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={className ?? "inline-flex"}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}
