"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppCta } from "@/components/ui/WhatsAppCta";
import { EmergencyPill } from "./EmergencyPill";
import { LocaleSwitch } from "./LocaleSwitch";
import { navItems } from "./nav-items";
import { site } from "@/content/site";
import { useLenis } from "@/components/motion/SmoothScroll";
import { cn } from "@/lib/utils";

/** Sticky glass nav (plan M16): hides on scroll down, shows on scroll up, solid after the hero. */
export function Nav() {
  const t = useTranslations();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > window.innerHeight * 0.6);
    if (open) return;
    setHidden(y > 160 && y > prev + 2);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "transition-[background-color,border-color] duration-500",
            solid || open
              ? "border-b border-white/10 bg-hb-night/95"
              : "border-b border-transparent bg-gradient-to-b from-hb-night/50 to-transparent",
          )}
        >
          <nav
            aria-label="Main"
            className="container-hb flex h-[var(--nav-h)] items-center justify-between gap-6 text-white"
          >
            <Link href="/" aria-label="Helibol — Inicio" className="shrink-0">
              <Logo className="h-11 w-auto" />
            </Link>

            <ul className="hidden items-center gap-1 xl:flex">
              {navItems.map((item) => (
                <li key={item.key} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active(item.href) ? "page" : undefined}
                    className={cn(
                      "relative block px-3 py-2 text-sm transition-colors",
                      active(item.href) ? "text-white" : "text-white/70 hover:text-white",
                    )}
                  >
                    {t(`nav.${item.key}`)}
                    {active(item.href) && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-px bg-hb-sunset"
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <EmergencyPill className="hidden lg:inline-flex" />
              <LocaleSwitch className="hidden text-white md:flex" />
              <WhatsAppCta short from="nav" className="px-5 py-2.5" wrapClassName="hidden sm:inline-flex" />
              <WhatsAppCta icon from="nav_icon" wrapClassName="sm:hidden" />
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 xl:hidden"
                aria-label={open ? t("common.close") : t("common.menu")}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>
        </div>
        {/* Slim emergency strip on small screens (plan §4) */}
        <div className="flex justify-center bg-hb-night/95 py-1.5 text-white lg:hidden">
          <EmergencyPill className="border-transparent bg-transparent py-0.5" />
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("common.menu")}
            className="fixed inset-0 z-40 flex flex-col bg-hb-night pt-32 text-white xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div aria-hidden className="hairline-grid absolute inset-0" />
            <ul className="container-hb relative flex flex-col gap-1 overflow-y-auto">
              {[{ key: "home", href: "/" } as const, ...navItems].map((item, i) => (
                <motion.li
                  key={item.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.8 }}
                >
                  <Link
                    href={item.href}
                    className="block py-2 font-display text-4xl font-medium tracking-tight sm:text-5xl"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container-hb relative mt-auto flex flex-wrap items-center gap-4 pb-10">
              <WhatsAppCta from="nav_mobile" onNavigate={() => setOpen(false)} />
              <LocaleSwitch className="text-white" />
              <a href={site.phoneHref} className="tabular text-sm text-white/70">
                {site.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
