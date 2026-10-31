"use client";
import { motion } from "motion/react";

export function HeliQuickReplies({
  chips,
  onPick,
  disabled,
}: {
  chips: string[];
  onPick: (chip: string, index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <motion.button
          key={c}
          type="button"
          disabled={disabled}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          onClick={() => onPick(c, i)}
          className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm text-white/85 transition-colors hover:border-hb-sunset hover:text-white disabled:opacity-50"
        >
          {c}
        </motion.button>
      ))}
    </div>
  );
}
