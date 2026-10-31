"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MapPin, Move3d, Navigation } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { BoliviaMap } from "./BoliviaMap";
import { useLenis } from "@/components/motion/SmoothScroll";
import { base, operations, type Operation } from "@/content/operations";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const OperationsGlobe = dynamic(() => import("@/components/three/OperationsGlobe"), {
  ssr: false,
  loading: () => <GlobeLoading />,
});

function GlobeLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="size-[62%] animate-pulse rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(28,117,188,0.35),rgba(6,19,31,0.2)_60%,transparent_70%)]" />
    </div>
  );
}

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad,
    dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}

function canWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const BASE_ID = "__base";

/**
 * Operations "mission log": a sticky 3D globe (R3F) beside a scrolling stack of project cards.
 * The card crossing the middle of the viewport becomes active and the camera flies to it;
 * clicking a marker scrolls its card into place. Reduced motion / no WebGL → SVG map.
 */
export function OperationsLog() {
  const t = useTranslations("operationsPage");
  const locale = useLocale() as "es" | "en";
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const items = [...operations].sort((a, b) => b.year - a.year);
  const [active, setActive] = useState<string>(BASE_ID);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [mode, setMode] = useState<"pending" | "globe" | "svg">("pending");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    setMode(reduced || !canWebGL() ? "svg" : "globe");
  }, [reduced]);

  // The card in the middle band of the viewport drives the globe.
  useEffect(() => {
    const cards = listRef.current?.querySelectorAll<HTMLElement>("[data-op]");
    if (!cards?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.getAttribute("data-op")!);
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const scrollToCard = (id: string) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-op="${id}"]`);
    if (!el) return;
    setActive(id);
    const offset = -(window.innerHeight / 2 - el.offsetHeight / 2);
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  };

  const current = items.find((o) => o.id === active);
  const hovered = hover ? items.find((o) => o.id === hover.id) : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
      {/* ── Sticky globe ── */}
      <div className="sticky top-3 z-10 h-[44svh] lg:top-24 lg:h-[calc(100svh-8rem)]">
        <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(ellipse_at_50%_40%,#0B3A63_0%,#06131F_70%)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
          <div aria-hidden className="hairline-grid absolute inset-0 opacity-40" />
          {mode === "globe" && (
            <OperationsGlobe
              base={base}
              markers={items.map(({ id, lat, lng }) => ({ id, lat, lng }))}
              activeId={current ? current.id : null}
              onSelect={scrollToCard}
              onHover={setHover}
            />
          )}
          {mode === "pending" && <GlobeLoading />}
          {mode === "svg" && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <BoliviaMap
                items={items}
                baseLabel="BASE"
                tilt={false}
                className="h-full w-auto max-w-full [&_svg]:h-full"
              />
            </div>
          )}

          {/* HUD overlays */}
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
              <span className="hidden items-center gap-2 sm:inline-flex">
                <span className="h-px w-5 border-t border-dashed border-hb-sunset" /> {t("countriesNote")}
              </span>
            </div>
            {mode === "globe" && (
              <span className="hidden items-center gap-1.5 [@media(pointer:fine)]:inline-flex">
                <Move3d className="size-3.5" aria-hidden /> {t("drag")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hover tooltip (follows the pointer over a marker) */}
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

      {/* ── Scrolling mission cards ── */}
      <div>
        <p className="max-w-md text-white/70">{t("globeLead")}</p>
        <ol ref={listRef} className="mt-10 space-y-5">
          <MissionCard
            id={BASE_ID}
            active={active === BASE_ID}
            onClick={() => scrollToCard(BASE_ID)}
            index="00"
            title={`El Trompillo · ${site.icao}`}
            kicker={t("base")}
            body={`${site.address.street}, ${site.address.city}. ${t("countriesNote")}.`}
            meta={site.hudCoords}
            reduced={!!reduced}
          />
          {items.map((o, i) => (
            <MissionCard
              key={o.id}
              id={o.id}
              active={active === o.id}
              onClick={() => scrollToCard(o.id)}
              index={String(i + 1).padStart(2, "0")}
              title={o.name}
              year={o.year}
              kicker={`${o.region}, Bolivia`}
              body={o.description[locale]}
              meta={t("distance", { km: new Intl.NumberFormat(locale).format(km(base, o)) })}
              chip={t("energy")}
              reduced={!!reduced}
              cta={mode === "globe" ? t("viewOnGlobe") : undefined}
            />
          ))}
        </ol>
        <p className="mt-8 text-sm text-white/50">{t("selection")}</p>
        {/* Room for the last card to reach the middle of the viewport. */}
        <div aria-hidden className="h-[28svh] lg:h-[38svh]" />
      </div>
    </div>
  );
}

function MissionCard({
  id,
  active,
  onClick,
  index,
  title,
  year,
  kicker,
  body,
  meta,
  chip,
  cta,
  reduced,
}: {
  id: Operation["id"];
  active: boolean;
  onClick: () => void;
  index: string;
  title: string;
  year?: number;
  kicker: string;
  body: string;
  meta: string;
  chip?: string;
  cta?: string;
  reduced: boolean;
}) {
  return (
    <motion.li
      data-op={id}
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        className={cn(
          "group relative w-full overflow-hidden rounded-[24px] border p-6 text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:p-8",
          active
            ? "border-hb-sunset/60 bg-white/[0.07] opacity-100"
            : "border-white/10 bg-white/[0.02] opacity-55 hover:opacity-90",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0 left-0 h-full w-1 origin-top bg-hb-sunset transition-transform duration-700",
            active ? "scale-y-100" : "scale-y-0",
          )}
        />
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow tabular text-white/40">
              {index} · {kicker}
            </p>
            <h3 className="mt-3 text-2xl font-medium text-white sm:text-3xl">{title}</h3>
          </div>
          {year && <p className="tabular font-display text-3xl text-hb-sunset sm:text-4xl">{year}</p>}
        </div>
        <p className="mt-3 max-w-md text-white/70">{body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
          {chip && (
            <span className="rounded-full border border-white/15 px-3 py-1 text-white/70">{chip}</span>
          )}
          <span className="inline-flex items-center gap-1.5 text-white/50">
            {year ? (
              <Navigation className="size-3.5" aria-hidden />
            ) : (
              <MapPin className="size-3.5" aria-hidden />
            )}
            <span className="tabular">{meta}</span>
          </span>
          {cta && (
            <span
              className={cn(
                "ml-auto font-semibold text-hb-sunset transition-opacity",
                active ? "opacity-0" : "opacity-0 group-hover:opacity-100",
              )}
            >
              {cta} →
            </span>
          )}
        </div>
      </button>
    </motion.li>
  );
}
