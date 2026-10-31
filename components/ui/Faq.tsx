"use client";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export function Faq({ items, dark = false }: { items: { q: string; a: string }[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div
      className={cn(
        "divide-y border-y",
        dark ? "divide-white/10 border-white/10" : "divide-line border-line",
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3 className="font-sans">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
                <Plus
                  className={cn("size-5 shrink-0 transition-transform duration-300", isOpen && "rotate-45")}
                  aria-hidden
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p
                    className={cn("max-w-3xl pb-6 leading-relaxed", dark ? "text-white/70" : "text-ink-soft")}
                  >
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
