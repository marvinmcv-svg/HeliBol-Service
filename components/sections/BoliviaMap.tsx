"use client";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { boliviaPath, MAP, project } from "@/content/bolivia";
import { base, operations, type Operation } from "@/content/operations";
import { cn } from "@/lib/utils";

/**
 * Bolivia flight-path map (plan M9) — SVG + DrawSVG version. Flight lines draw from El Trompillo
 * to each operation site and pins pop in with labels and years. Tilted in 3D on large screens.
 */
export function BoliviaMap({
  items = operations,
  baseLabel,
  className,
  tilt = true,
}: {
  items?: Operation[];
  baseLabel: string;
  className?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const b = project(base.lat, base.lng);

  useGSAP(
    () => {
      const root = ref.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 70%", once: true } });
      tl.from(root.querySelector("[data-outline]"), { drawSVG: "0%", duration: 1.6, ease: "power2.inOut" })
        .from(
          root.querySelectorAll("[data-route]"),
          { drawSVG: "0%", duration: 1.1, stagger: 0.12, ease: "power2.inOut" },
          "-=0.8",
        )
        .from(
          root.querySelectorAll("[data-pin]"),
          { scale: 0, transformOrigin: "50% 50%", duration: 0.6, stagger: 0.12, ease: "back.out(2.5)" },
          "<0.3",
        )
        .from(
          root.querySelectorAll("[data-label]"),
          { autoAlpha: 0, y: 6, duration: 0.5, stagger: 0.12 },
          "<0.2",
        );
    },
    { scope: ref, dependencies: [items.map((i) => i.id).join()] },
  );

  // Arc control point: perpendicular offset so routes curve like flight paths.
  const arc = (x: number, y: number) => {
    const mx = (b.x + x) / 2,
      my = (b.y + y) / 2;
    const dx = x - b.x,
      dy = y - b.y;
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(90, len * 0.25);
    return `M${b.x},${b.y} Q${mx - (dy / len) * k},${my + (dx / len) * k} ${x},${y}`;
  };

  return (
    <div ref={ref} className={cn("[perspective:1600px]", className)}>
      <svg
        viewBox={`-40 -40 ${MAP.width + 80} ${MAP.height + 80}`}
        className={cn(
          "h-auto w-full overflow-visible transition-transform duration-1000",
          tilt && "lg:[transform:rotateX(18deg)_rotateZ(-4deg)]",
        )}
        role="img"
        aria-label={
          locale === "es"
            ? "Mapa de operaciones de Helibol en Bolivia"
            : "Map of Helibol operations in Bolivia"
        }
      >
        <defs>
          <pattern id="topo" width="18" height="18" patternUnits="userSpaceOnUse">
            <path
              d="M0 9 Q4.5 4 9 9 T18 9"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.09"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="glow">
            <stop offset="0%" stopColor="#F2A23A" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F2A23A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={boliviaPath} fill="url(#topo)" className="text-white" />
        <path
          data-outline
          d={boliviaPath}
          fill="rgba(28,117,188,0.10)"
          stroke="#1C75BC"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {items.map((o) => {
          const p = project(o.lat, o.lng);
          return (
            <path
              key={`r-${o.id}`}
              data-route
              d={arc(p.x, p.y)}
              fill="none"
              stroke="#F2A23A"
              strokeWidth="1.6"
              strokeDasharray="0"
              strokeOpacity="0.85"
            />
          );
        })}
        {items.map((o) => {
          const p = project(o.lat, o.lng);
          const right = o.label ? o.label === "right" : p.x < MAP.width * 0.62;
          return (
            <g key={o.id}>
              <g data-pin>
                <circle cx={p.x} cy={p.y} r="16" fill="url(#glow)" />
                <circle cx={p.x} cy={p.y} r="6" fill="#06131F" stroke="#F2A23A" strokeWidth="2.5" />
              </g>
              <g data-label className="font-sans" fill="white">
                <text
                  x={p.x + (right ? 14 : -14)}
                  y={p.y - 4}
                  textAnchor={right ? "start" : "end"}
                  fontSize="22"
                  fontWeight="600"
                >
                  {o.name}
                </text>
                <text
                  x={p.x + (right ? 14 : -14)}
                  y={p.y + 20}
                  textAnchor={right ? "start" : "end"}
                  fontSize="16"
                  fill="#F2A23A"
                  letterSpacing="3"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {o.year}
                </text>
              </g>
            </g>
          );
        })}
        <g data-pin>
          <circle cx={b.x} cy={b.y} r="26" fill="#1C75BC" fillOpacity="0.25" />
          <circle cx={b.x} cy={b.y} r="9" fill="#1C75BC" stroke="white" strokeWidth="3" />
        </g>
        <text
          data-label
          x={b.x + 18}
          y={b.y + 34}
          fontSize="18"
          fill="white"
          fillOpacity="0.85"
          letterSpacing="3"
          className="font-sans"
        >
          SLET · {baseLabel}
        </text>
      </svg>
    </div>
  );
}
