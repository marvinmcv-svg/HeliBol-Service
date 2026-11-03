"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { siWhatsapp } from "simple-icons";
import { Link, usePathname } from "@/i18n/navigation";
import { site, whatsappHref } from "@/content/site";
import { useHeli } from "@/lib/heli-store";
import { useScrollAway } from "@/lib/hooks";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const WA_GREEN = "#25D366";

function WaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={siWhatsapp.path} />
    </svg>
  );
}

/**
 * Persistent WhatsApp customer-service widget (all pages). A round button sits above the Heli
 * launcher (tablet and up; phones get the green icon in the header instead); it opens a small chat card with topic shortcuts that hand off to wa.me with a
 * pre-written message. Hidden while Heli is open so the two never overlap.
 */
export function WhatsAppWidget() {
  const t = useTranslations("whatsapp");
  const { open: heliOpen } = useHeli();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const away = useScrollAway();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const options = t.raw("options") as { label: string; text: string }[];

  useEffect(() => setOpen(false), [pathname]);

  // Step aside while the page's WhatsApp planner (the main CTA) is on screen.
  const [plannerInView, setPlannerInView] = useState(false);
  useEffect(() => {
    setPlannerInView(false);
    const el = document.getElementById("whatsapp");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPlannerInView(!!e?.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // One gentle label peek a few seconds after landing, once per session.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("hb-wa-hint")) return;
      const show = setTimeout(() => {
        setHint(true);
        sessionStorage.setItem("hb-wa-hint", "1");
      }, 6000);
      const hide = setTimeout(() => setHint(false), 11000);
      return () => {
        clearTimeout(show);
        clearTimeout(hide);
      };
    } catch {
      /* storage blocked: skip the hint */
    }
  }, []);

  // The contact page is itself the WhatsApp funnel, so the floating button would only compete with it.
  if (!whatsappHref() || heliOpen || pathname === "/contacto") return null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed right-4 bottom-[76px] z-[70] hidden flex-col items-end transition-[transform,opacity] duration-300 ease-out sm:right-6 sm:bottom-[92px] sm:flex",
        (away || plannerInView) && !open && "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label={t("fab")}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 340, damping: 30 }}
            style={{ transformOrigin: "100% 100%" }}
            className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-black/5 bg-white text-ink shadow-[0_30px_80px_-20px_rgba(6,19,31,0.55)]"
            data-lenis-prevent
          >
            <div className="relative flex items-center gap-3 bg-[#075E54] px-5 py-4 text-white">
              <span className="relative flex size-10 items-center justify-center rounded-full bg-white/15">
                <WaGlyph className="size-5" />
                <span
                  aria-hidden
                  className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-[#075E54]"
                  style={{ background: WA_GREEN }}
                />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg leading-tight font-medium">{t("title")}</p>
                <p className="truncate text-xs text-white/70">{t("status")}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={t("close")}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="bg-[#EFEAE2] px-4 py-5">
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-[15px] leading-snug shadow-sm"
              >
                {t("greeting")}
              </motion.p>
              <ul className="mt-4 space-y-2">
                {options.map((o, i) => (
                  <motion.li
                    key={o.label}
                    initial={reduced ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                  >
                    <a
                      href={whatsappHref(o.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("cta_whatsapp", { from: "widget", topic: o.label })}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[#075E54]/15 bg-white/80 px-4 py-2.5 text-sm font-semibold text-[#075E54] transition-colors hover:border-[#075E54] hover:bg-white"
                    >
                      {o.label}
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1 border-t border-black/5 px-5 py-3 text-sm">
              <Link
                href={{ pathname: "/contacto", hash: "whatsapp" }}
                onClick={(e) => {
                  const target = document.getElementById("whatsapp");
                  if (!target) return;
                  e.preventDefault();
                  setOpen(false);
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="font-semibold text-hb-blue-ink hover:underline"
              >
                {t("detailed")} →
              </Link>
              <a
                href={site.phoneHref}
                onClick={() => track("cta_call", { from: "wa_widget" })}
                className="inline-flex items-center gap-2 whitespace-nowrap text-ink-soft hover:text-hb-rescue"
              >
                <Phone className="size-3.5" aria-hidden /> {t("emergency")} ·
                <span className="tabular font-semibold">{site.phone}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center">
        <AnimatePresence>
          {hint && !open && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-ink shadow-lg sm:block"
            >
              {t("fab")}
            </motion.span>
          )}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setHint(false);
          }}
          initial={reduced ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={reduced ? undefined : { scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: open ? 0 : 0.6 }}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={t("fab")}
          className={cn(
            "group relative flex size-14 items-center justify-center rounded-full text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.65)]",
          )}
          style={{ background: WA_GREEN }}
        >
          {!open && !reduced && (
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full opacity-30 [animation-duration:2.6s]"
              style={{ background: WA_GREEN }}
            />
          )}
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="size-6" />
              </motion.span>
            ) : (
              <motion.span
                key="wa"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <WaGlyph className="size-7" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
