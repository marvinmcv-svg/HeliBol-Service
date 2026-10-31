"use client";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { HeliAvatar } from "./HeliAvatar";
import { useHeli } from "@/lib/heli-store";
import { useScrollAway } from "@/lib/hooks";
import { useLenis } from "@/components/motion/SmoothScroll";
import { track } from "@/lib/analytics";

// The panel (and its streaming client) loads only when first opened.
const HeliPanel = dynamic(() => import("./HeliPanel").then((m) => m.HeliPanel), { ssr: false });

/** Floating "Pregúntale a Heli" pill, bottom-right (plan §8). */
export function HeliLauncher() {
  const t = useTranslations("heli");
  const { open, topic, openHeli, closeHeli } = useHeli();
  const away = useScrollAway();
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) track("heli_open", topic ? { topic } : undefined);
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open, topic]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={launcherRef}
            type="button"
            onClick={() => openHeli()}
            initial={{ opacity: 0, y: 20 }}
            animate={away ? { opacity: 0, y: 24 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: away ? 0 : 0.15 }}
            style={{ pointerEvents: away ? "none" : undefined }}
            className="fixed right-4 bottom-4 z-[70] flex items-center gap-3 rounded-full border border-white/15 bg-hb-night/95 p-1.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(6,19,31,0.6)] transition-colors hover:bg-hb-blue sm:right-6 sm:bottom-6 sm:py-2 sm:pr-5 sm:pl-2"
            aria-haspopup="dialog"
          >
            <HeliAvatar />
            {/* Icon-only bubble on phones so it doesn't cover content; label from sm up. */}
            <span className="sr-only sm:not-sr-only">{t("launcher")}</span>
            <span aria-hidden className="relative hidden size-2 sm:flex">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-hb-sunset opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-hb-sunset" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <LockScroll>
            <HeliPanel onClose={closeHeli} topic={topic} />
          </LockScroll>
        )}
      </AnimatePresence>
    </>
  );
}

/** Stop Lenis while the panel is open on small screens (it's a full-screen sheet there). */
function LockScroll({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();
  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) {
      lenis?.stop();
      return () => lenis?.start();
    }
  }, [lenis]);
  return <>{children}</>;
}
