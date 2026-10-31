"use client";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

/** Transparent aircraft cut-out with a gentle hover float (plan §7). */
export function FloatingCutout({ src, alt }: { src: string; alt: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, x: 80 }}
      animate={reduced ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, -14, 0] }}
      transition={{
        opacity: { duration: 1 },
        x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
        y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.2 },
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width:1024px) 55vw, 100vw"
        className="object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.5)]"
      />
    </motion.div>
  );
}
