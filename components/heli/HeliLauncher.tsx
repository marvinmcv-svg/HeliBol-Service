"use client";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { HeliAvatar } from "./HeliAvatar";
import { useHeli } from "@/lib/heli-store";
import { useLenis } from "@/components/motion/SmoothScroll";
import { track } from "@/lib/analytics";

// The panel (and its streaming client) loads only when first opened.
const HeliPanel = dynamic(() => import("./HeliPanel").then((m) => m.HeliPanel), { ssr: false });

/** Floating "Pregúntale a Heli" pill, bottom-right (plan §8). */
export function HeliLauncher() {
  const t = useTranslations("heli");
  const { open, topic, openHeli, closeHeli } = useHeli();
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
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.4 }}
            className="fixed right-4 bottom-4 z-[70] flex items-center gap-3 rounded-full border border-white/15 bg-hb-night/85 py-2 pr-5 pl-2 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(6,19,31,0.6)] backdrop-blur-xl transition-colors hover:bg-hb-blue sm:right-6 sm:bottom-6"
            aria-haspopup="dialog"
          >
            <HeliAvatar />
            <span>{t("launcher")}</span>
            <span aria-hidden className="relative flex size-2">
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
