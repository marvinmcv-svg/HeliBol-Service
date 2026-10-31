"use client";
import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useState } from "react";
import { img, type ImageKey } from "@/content/media";
import { cn } from "@/lib/utils";

type Value = { title: string; body: string };

const photos: ImageKey[] = ["rescue-crew", "h125-longline", "team-hangar", "ramp-dusk"];
const ease = [0.16, 1, 0.3, 1] as const;

/* ───────── One animated cockpit instrument per value (SVG + CSS, sunset strokes) ───────── */

const spin = (s: number, reverse = false) =>
  ({
    animation: `hb-spin ${s}s linear infinite${reverse ? " reverse" : ""}`,
    transformOrigin: "60px 60px",
    transformBox: "view-box",
  }) as const;

/** Safety — radar sweep over a shield. */
function Radar({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
      <defs>
        <radialGradient id="v-sweep" cx="60" cy="60" r="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F2A23A" stopOpacity="0" />
          <stop offset="1" stopColor="#F2A23A" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      {[52, 36, 20].map((r) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#F2A23A" strokeOpacity="0.3" />
      ))}
      <path d="M60 8V112M8 60H112" stroke="#F2A23A" strokeOpacity="0.2" />
      <g style={on ? spin(2.4) : undefined}>
        <path d="M60 60 L60 8 A52 52 0 0 1 105 34 Z" fill="url(#v-sweep)" />
        <line x1="60" y1="60" x2="60" y2="8" stroke="#F2A23A" strokeWidth="1.5" />
      </g>
      <path
        d="M60 42 l13 5 v10 c0 9 -6 15 -13 18 c-7 -3 -13 -9 -13 -18 v-10 z"
        fill="#06131F"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M54 58 l4 4 l8 -8" fill="none" stroke="#F2A23A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Precision — a reticle whose brackets close in and lock. */
function Reticle({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
      <g style={on ? spin(14) : undefined}>
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#F2A23A"
          strokeOpacity="0.35"
          strokeDasharray="2 6"
        />
      </g>
      <circle cx="60" cy="60" r="30" fill="none" stroke="#F2A23A" strokeOpacity="0.5" />
      {[0, 90, 180, 270].map((a) => (
        <g key={a} transform={`rotate(${a} 60 60)`}>
          <line x1="60" y1="4" x2="60" y2="22" stroke="#F2A23A" strokeOpacity="0.7" />
          <motion.path
            d="M48 36 L48 30 L54 30"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={on ? { x: 6, y: 6 } : { x: -6, y: -6 }}
            transition={{ duration: 0.9, ease, delay: on ? 0.25 : 0 }}
          />
        </g>
      ))}
      <motion.circle
        cx="60"
        cy="60"
        r="4"
        fill="#F2A23A"
        initial={false}
        animate={on ? { scale: [1, 1.8, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, delay: on ? 1 : 0 }}
        style={{ transformOrigin: "60px 60px" }}
      />
    </svg>
  );
}

/** Family — a crew circling the rotor hub. */
function Orbit({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
      <circle cx="60" cy="60" r="44" fill="none" stroke="#F2A23A" strokeOpacity="0.3" />
      <circle cx="60" cy="60" r="26" fill="none" stroke="#F2A23A" strokeOpacity="0.2" />
      <g style={on ? spin(9) : undefined}>
        {[0, 120, 240].map((a) => (
          <circle
            key={a}
            cx={60 + 44 * Math.cos((a * Math.PI) / 180)}
            cy={60 + 44 * Math.sin((a * Math.PI) / 180)}
            r="6"
            fill="#F2A23A"
          />
        ))}
      </g>
      <g style={on ? spin(6, true) : undefined}>
        {[60, 240].map((a) => (
          <circle
            key={a}
            cx={60 + 26 * Math.cos((a * Math.PI) / 180)}
            cy={60 + 26 * Math.sin((a * Math.PI) / 180)}
            r="4.5"
            fill="#fff"
          />
        ))}
      </g>
      <circle cx="60" cy="60" r="9" fill="#06131F" stroke="#fff" strokeWidth="1.6" />
      <circle cx="60" cy="60" r="3" fill="#F2A23A" />
    </svg>
  );
}

/** Service — a 24-hour dial with a sweeping hand. */
function Dial({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="size-full" aria-hidden>
      <circle cx="60" cy="60" r="52" fill="none" stroke="#F2A23A" strokeOpacity="0.35" />
      {Array.from({ length: 24 }, (_, i) => (
        <line
          key={i}
          x1="60"
          y1="10"
          x2="60"
          y2={i % 6 === 0 ? 20 : 15}
          stroke={i % 6 === 0 ? "#fff" : "#F2A23A"}
          strokeOpacity={i % 6 === 0 ? 0.9 : 0.5}
          strokeWidth={i % 6 === 0 ? 2 : 1}
          transform={`rotate(${i * 15} 60 60)`}
        />
      ))}
      <g style={on ? spin(4) : undefined}>
        <line x1="60" y1="60" x2="60" y2="18" stroke="#F2A23A" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="60" cy="60" r="3.5" fill="#fff" />
      <text
        x="60"
        y="84"
        textAnchor="middle"
        fill="#fff"
        fontSize="13"
        fontWeight="600"
        letterSpacing="1"
        className="font-display"
      >
        24/7
      </text>
    </svg>
  );
}

const instruments = [Radar, Reticle, Orbit, Dial];

/**
 * Nosotros "Nuestros valores": an expanding instrument-panel deck. On desktop the four values sit
 * side by side; the active one opens wide with its photo, a giant outlined index, a live cockpit
 * instrument and a cursor-following spotlight, while the rest fold into vertical labels.
 * Hover, focus or tap to switch. Below 1024px they stack as full cards. Reduced motion: no spin.
 */
export function ValuesDeck({ values }: { values: Value[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(242,162,58,0.22), transparent 60%)`;

  return (
    <ul className="flex flex-col gap-4 lg:h-[min(560px,70svh)] lg:flex-row lg:gap-3">
      {values.map((v, i) => {
        const on = i === active;
        const Instrument = instruments[i] ?? Radar;
        const photo = img(photos[i] ?? "ramp-dusk");
        const n = String(i + 1).padStart(2, "0");
        return (
          <li
            key={v.title}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            onPointerMove={(e) => {
              if (!on) return;
              const r = e.currentTarget.getBoundingClientRect();
              mx.set(((e.clientX - r.left) / r.width) * 100);
              my.set(((e.clientY - r.top) / r.height) * 100);
            }}
            tabIndex={0}
            className={cn(
              "group relative isolate min-h-[340px] cursor-pointer overflow-hidden rounded-[28px] border outline-none focus-visible:ring-2 focus-visible:ring-hb-sunset lg:min-h-0",
              "transition-[flex-grow,border-color] duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              on ? "border-hb-sunset/50 lg:flex-[3.2]" : "border-white/10 lg:flex-1",
            )}
          >
            {/* Photo, duotoned toward the brand night blue */}
            <div
              className={cn(
                "absolute inset-0 -z-10 transition-[opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                on ? "scale-100 opacity-100" : "scale-110 opacity-60 lg:opacity-25",
              )}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="(min-width:1024px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="object-cover grayscale-[0.35]"
                style={{ objectPosition: photo.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/75 to-hb-night/30" />
              <div className="absolute inset-0 bg-hb-blue-deep/30 mix-blend-multiply" />
            </div>
            {on && !reduced && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: spot }}
              />
            )}
            <div aria-hidden className="hairline-grid absolute inset-0 -z-10 opacity-30" />

            {/* Giant outlined index */}
            <span
              aria-hidden
              className={cn(
                "text-outline pointer-events-none absolute -right-2 -bottom-6 font-display text-[9rem] leading-none font-semibold transition-[opacity,transform] duration-700 select-none [--stroke:rgb(242_162_58/0.45)] lg:text-[min(13rem,24svh)]",
                on ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
            >
              {n}
            </span>

            {/* Folded state (desktop): vertical label */}
            <div
              className={cn(
                "absolute inset-0 hidden flex-col items-center justify-between py-8 transition-opacity duration-500 lg:flex",
                on ? "pointer-events-none opacity-0" : "opacity-100 delay-200",
              )}
            >
              <span className="eyebrow tabular text-hb-sunset">{n}</span>
              <span className="rotate-180 font-display text-3xl font-medium whitespace-nowrap text-white [writing-mode:vertical-rl]">
                {v.title}
              </span>
              <span className="size-12 opacity-70">
                <Instrument on={false} />
              </span>
            </div>

            {/* Live instrument, top-right of the open card */}
            <span
              className={cn(
                "absolute top-6 right-6 size-24 sm:top-8 sm:right-8 sm:size-28 lg:size-[min(8rem,17svh)] lg:transition-opacity lg:duration-500",
                on ? "lg:opacity-100 lg:delay-300" : "lg:pointer-events-none lg:opacity-0",
              )}
            >
              <Instrument on={on && !reduced} />
            </span>

            {/* Open state */}
            <div
              className={cn(
                "relative flex h-full flex-col justify-between p-7 sm:p-9 lg:w-[min(560px,40vw)] lg:transition-opacity lg:duration-500",
                on ? "lg:opacity-100 lg:delay-300" : "lg:pointer-events-none lg:opacity-0",
              )}
            >
              <span className="eyebrow tabular text-hb-sunset">
                {n} / {String(values.length).padStart(2, "0")}
              </span>
              <div className="mt-10 lg:mt-0">
                <h3 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] font-medium tracking-tight text-white">
                  {v.title}
                </h3>
                <span
                  aria-hidden
                  className={cn(
                    "mt-5 block h-px origin-left bg-gradient-to-r from-hb-sunset to-transparent transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    on ? "scale-x-100 delay-300" : "scale-x-0",
                  )}
                />
                <p className="mt-5 max-w-sm text-lg leading-relaxed text-white/80">{v.body}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
