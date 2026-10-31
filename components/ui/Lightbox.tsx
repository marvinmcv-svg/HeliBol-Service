"use client";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/motion/SmoothScroll";
import type { Img } from "@/content/media";
import { cn } from "@/lib/utils";

type Labels = {
  close: string;
  prev: string;
  next: string;
  counter: (current: number, total: number) => string;
};

/**
 * Full-screen, high-resolution image viewer. Keyboard (←/→/Esc), swipe, thumbnails, focus trap.
 * Images are shown uncropped (object-contain) at full source resolution.
 */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  locale,
  labels,
}: {
  images: Img[];
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  locale: "es" | "en";
  labels: Labels;
}) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(0);
  const [mounted, setMounted] = useState(false);
  const open = index !== null;
  const total = images.length;

  useEffect(() => setMounted(true), []);

  const step = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      onIndex((index + d + total) % total);
    },
    [index, onIndex, total],
  );

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("[data-close]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        const els = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!els?.length) return;
        const first = els[0]!,
          last = els[els.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      document.documentElement.style.overflow = "";
      prevFocus?.focus?.();
    };
  }, [open, lenis, onClose, step]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -400) step(1);
    else if (info.offset.x > 80 || info.velocity.x > 400) step(-1);
  };

  if (!mounted) return null;
  const current = index !== null ? images[index] : undefined;

  return createPortal(
    <AnimatePresence>
      {open && current && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt[locale]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col bg-hb-night/95 text-white backdrop-blur-xl"
          data-lenis-prevent
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="eyebrow tabular text-white/60" aria-live="polite">
              {labels.counter(index! + 1, total)}
            </p>
            <button
              type="button"
              data-close
              onClick={onClose}
              className="rounded-full border border-white/20 p-2.5 transition-colors hover:bg-white hover:text-hb-night"
              aria-label={labels.close}
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={current.src}
                custom={dir}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 120, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -120, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                drag={total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                className="absolute inset-0 cursor-grab px-4 active:cursor-grabbing sm:px-20"
              >
                <Image
                  src={current.src}
                  alt={current.alt[locale]}
                  fill
                  sizes="100vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL={current.blurDataURL}
                  className="pointer-events-none object-contain select-none"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full border border-white/20 bg-hb-night/50 p-3 transition-colors hover:bg-white hover:text-hb-night sm:block"
                  aria-label={labels.prev}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full border border-white/20 bg-hb-night/50 p-3 transition-colors hover:bg-white hover:text-hb-night sm:block"
                  aria-label={labels.next}
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          <div className="px-5 pt-4 pb-6 sm:px-8">
            <p className="mx-auto max-w-3xl text-center text-sm text-white/75">{current.alt[locale]}</p>
            {total > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-1">
                {images.map((im, i) => (
                  <button
                    key={im.src}
                    type="button"
                    onClick={() => {
                      setDir(i > index! ? 1 : -1);
                      onIndex(i);
                    }}
                    aria-label={labels.counter(i + 1, total)}
                    aria-current={i === index ? "true" : undefined}
                    className={cn(
                      "relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition-all duration-300",
                      i === index ? "opacity-100 ring-2 ring-hb-sunset" : "opacity-45 hover:opacity-80",
                    )}
                  >
                    <Image
                      src={im.src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      style={{ objectPosition: im.position }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
