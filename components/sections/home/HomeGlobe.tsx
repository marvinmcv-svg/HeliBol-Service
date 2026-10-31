"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Move3d } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BoliviaMap } from "@/components/sections/BoliviaMap";
import { base, operations } from "@/content/operations";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const OperationsGlobe = dynamic(() => import("@/components/three/OperationsGlobe"), {
  ssr: false,
  loading: () => <Loading />,
});

function Loading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="size-[62%] animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(28,117,188,0.35),rgba(6,19,31,0.2)_60%,transparent_70%)]" />
    </div>
  );
}

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const TOUR_MS = 3800;

/**
 * Home "Ya hemos estado ahí": the same R3F globe as /operaciones, on a self-running tour.
 * The camera flies base → each project in turn; hovering or clicking a project in the year list
 * (or a marker) takes over the tour. Reduced motion / no WebGL → the SVG map.
 */
export function HomeGlobe() {
  const t = useTranslations("operationsPage");
  const reduced = useReducedMotion();
  const items = [...operations].sort((a, b) => b.year - a.year);
  const years = [...new Set(items.map((o) => o.year))];
  const [mode, setMode] = useState<"pending" | "globe" | "svg">("pending");
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const paused = useRef(false);
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => setMode(reduced || !canWebGL() ? "svg" : "globe"), [reduced]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(!!e?.isIntersecting), { threshold: 0.35 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  // Self-running tour: overview → project 1 → … → overview, only while on screen.
  useEffect(() => {
    if (mode !== "globe" || !inView) return;
    const order = [null, ...items.map((o) => o.id)];
    const id = window.setInterval(() => {
      if (paused.current) return;
      setActive((cur) => order[(order.indexOf(cur) + 1) % order.length] ?? null);
    }, TOUR_MS);
    return () => window.clearInterval(id);
    // items is derived from static content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, inView]);

  const current = items.find((o) => o.id === active);
  const hovered = hover ? items.find((o) => o.id === hover.id) : undefined;
  const pick = (id: string | null) => {
    paused.current = true;
    setActive(id);
  };

  return (
    <div ref={wrap} className="grid items-center gap-12 lg:grid-cols-[1fr_1.25fr]">
      {/* Year list doubles as the globe's controller. */}
      <ol
        className="order-2 space-y-5 border-l border-white/15 pl-6 lg:order-1"
        onMouseLeave={() => (paused.current = false)}
      >
        {years.map((y) => (
          <li key={y}>
            <p className="eyebrow tabular text-hb-sunset">{y}</p>
            <p className="mt-1 flex flex-wrap gap-x-2 text-white/85">
              {items
                .filter((o) => o.year === y)
                .map((o, i) => (
                  <span key={o.id} className="inline-flex gap-2">
                    {i > 0 && <span className="text-white/30">·</span>}
                    <button
                      type="button"
                      onMouseEnter={() => mode === "globe" && pick(o.id)}
                      onFocus={() => mode === "globe" && pick(o.id)}
                      onClick={() => pick(o.id)}
                      className={cn(
                        "underline-offset-4 transition-colors hover:text-white hover:underline",
                        active === o.id && "text-white underline decoration-hb-sunset",
                      )}
                    >
                      {o.name}
                    </button>
                  </span>
                ))}
            </p>
          </li>
        ))}
      </ol>

      <div
        onPointerDown={() => (paused.current = true)}
        className="relative order-1 aspect-square w-full overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_40%,#0B3A63_0%,#06131F_72%)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] sm:aspect-[5/4] lg:order-2"
      >
        <div aria-hidden className="hairline-grid absolute inset-0 opacity-40" />
        {mode === "globe" && (
          <OperationsGlobe
            base={base}
            markers={items.map(({ id, lat, lng }) => ({ id, lat, lng }))}
            activeId={active}
            onSelect={(id) => pick(id)}
            onHover={setHover}
            zoom={false}
            distances={{ overview: 2.85, focus: 2.05 }}
          />
        )}
        {mode === "pending" && <Loading />}
        {mode === "svg" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <BoliviaMap baseLabel="BASE" tilt={false} className="h-full w-auto max-w-full [&_svg]:h-full" />
          </div>
        )}

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
          <div>
            <p className="eyebrow text-hb-sunset">{t("globeTitle")}</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={current?.id ?? "base"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-2 font-display text-xl font-medium text-white sm:text-2xl"
              >
                {current ? current.name : `El Trompillo · ${site.icao}`}
              </motion.p>
            </AnimatePresence>
            {current && (
              <p className="tabular mt-1 text-sm text-white/60">
                {current.year} · {current.region}
              </p>
            )}
          </div>
          <p className="eyebrow tabular hidden text-right text-white/40 sm:block">
            {current ? `${current.lat.toFixed(2)}°, ${current.lng.toFixed(2)}°` : site.hudCoords}
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-xs text-white/60 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full border-2 border-white bg-hb-blue" /> {t("base")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-hb-sunset" /> {t("count", { count: items.length })}
            </span>
          </div>
          {mode === "globe" && (
            <span className="hidden items-center gap-1.5 [@media(pointer:fine)]:inline-flex">
              <Move3d className="size-3.5" aria-hidden /> {t("drag")}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {hovered && hover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none fixed z-[80] rounded-2xl border border-white/15 bg-hb-night/90 px-4 py-3 text-white shadow-xl"
            style={{ left: hover.x + 16, top: hover.y + 16 }}
          >
            <p className="font-semibold">{hovered.name}</p>
            <p className="tabular text-xs text-hb-sunset">
              {hovered.year} · {hovered.region}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
