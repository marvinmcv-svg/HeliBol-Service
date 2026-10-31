"use client";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { Emblem } from "@/components/ui/Emblem";

let firstLoad = true;

/** Blue panel sweeps across with the emblem on route change (plan M13). Used by template.tsx. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [animate] = useState(() => !firstLoad);
  useEffect(() => {
    firstLoad = false;
  }, []);

  return (
    <>
      {animate && !reduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-hb-blue"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 100%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
        >
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.4 }}
          >
            <Emblem className="size-16 text-white" />
          </motion.div>
        </motion.div>
      )}
      {children}
    </>
  );
}
