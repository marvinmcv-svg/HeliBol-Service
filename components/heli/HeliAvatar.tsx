"use client";
import { motion } from "motion/react";
import { Emblem } from "@/components/ui/Emblem";

/** Emblem whose globe rotates gently while Heli is thinking, plus an orange status dot (plan §8). */
export function HeliAvatar({ thinking = false, size = "size-9" }: { thinking?: boolean; size?: string }) {
  return (
    <span
      className={`relative inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-hb-blue text-white`}
    >
      <motion.span
        className="inline-flex"
        animate={thinking ? { rotateY: [0, 180, 360] } : { rotateY: 0 }}
        transition={thinking ? { repeat: Infinity, duration: 2.4, ease: "easeInOut" } : { duration: 0.3 }}
      >
        <Emblem className="size-[60%] min-w-5" />
      </motion.span>
      <span
        aria-hidden
        className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-hb-night bg-hb-sunset"
      />
    </span>
  );
}
