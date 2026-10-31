"use client";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useIsTouch, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const spring = { stiffness: 260, damping: 26 };

/**
 * 3D tilt card (plan M5): perspective 1000, ±10°, cursor-following specular glare.
 * Children with [data-depth] get translateZ(40px) for inner parallax. Static press state on touch.
 */
export function TiltCard({
  children,
  className,
  max = 10,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.28), transparent 55%)`;
  const active = !touch && !reduced;

  return (
    <div className={cn("[perspective:1000px]", className)}>
      <motion.div
        ref={ref}
        className="group/tilt relative h-full w-full transition-transform [transform-style:preserve-3d] active:scale-[0.985]"
        style={active ? { rotateX: rx, rotateY: ry } : undefined}
        onPointerMove={(e) => {
          if (!active || !ref.current) return;
          const r = ref.current.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
      >
        {children}
        {glare && active && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover/tilt:opacity-100"
            style={{ background: glareBg, borderRadius: "inherit" }}
          />
        )}
      </motion.div>
    </div>
  );
}
