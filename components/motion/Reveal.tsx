"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Fade-and-rise on first view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const reduced = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduced ? 0.2 : 1, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Comp>
  );
}
