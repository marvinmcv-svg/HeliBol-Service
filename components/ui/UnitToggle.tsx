"use client";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { cn } from "@/lib/utils";

export type UnitSystem = "metric" | "imperial";

/** Metric / imperial segmented control with a sliding pill. */
export function UnitToggle({
  value,
  onChange,
  label,
  className,
}: {
  value: UnitSystem;
  onChange: (v: UnitSystem) => void;
  label: string;
  className?: string;
}) {
  const t = useTranslations("fleetPage");
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("relative flex rounded-full border border-line p-1 text-sm", className)}
    >
      {(["metric", "imperial"] as const).map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={value === s}
          onClick={() => onChange(s)}
          className={cn(
            "relative z-10 min-h-10 rounded-full px-4 py-2 font-semibold transition-colors",
            value === s ? "text-white" : "text-ink-soft hover:text-ink",
          )}
        >
          {value === s && (
            <motion.span
              layoutId={`unit-pill-${id}`}
              className="absolute inset-0 -z-10 rounded-full bg-hb-blue"
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            />
          )}
          {t(s)}
        </button>
      ))}
    </div>
  );
}
