import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { TiltCard } from "@/components/motion/TiltCard";
import { cn } from "@/lib/utils";

/** Accent per card: icon-badge gradient + glow colour. */
const accents = {
  blue: { badge: "from-[#5FB0F0] via-hb-blue to-[#0B3A63]", glow: "rgba(28,117,188,0.55)" },
  green: { badge: "from-[#6BF0A0] via-[#25D366] to-[#0E7A3C]", glow: "rgba(37,211,102,0.5)" },
  sunset: { badge: "from-[#FFD08A] via-hb-sunset to-[#B8661A]", glow: "rgba(242,162,58,0.5)" },
  sky: { badge: "from-[#E6F3FF] via-[#7FB8E6] to-[#2B6CA3]", glow: "rgba(127,184,230,0.5)" },
} as const;
export type Accent = keyof typeof accents;

/**
 * Glossy glass contact card: layered gradients, a lit top edge, a specular sheen that sweeps on
 * hover, a 3D "jewel" icon badge and depth layers that separate as the card tilts.
 */
export function ContactCard({
  href,
  icon,
  label,
  value,
  accent,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  accent: Accent;
}) {
  const a = accents[accent];
  const external = href.startsWith("http");
  return (
    <TiltCard className="h-full" max={12}>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={cn(
          "glossy-card group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-[28px] p-7 [transform-style:preserve-3d] sm:p-8",
        )}
        style={{ ["--glow" as string]: a.glow }}
      >
        {/* Accent glow bleeding up from the bottom corner */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: a.glow }}
        />
        {/* Hover sheen */}
        <span aria-hidden className="glossy-sheen" />

        <div className="relative flex items-start justify-between" style={{ transform: "translateZ(50px)" }}>
          <span
            className={cn(
              "relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white",
              "shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-6px_12px_rgba(0,0,0,0.25),0_14px_30px_-8px_var(--glow)]",
              a.badge,
            )}
          >
            {/* Specular highlight on the badge */}
            <span
              aria-hidden
              className="absolute inset-x-1.5 top-1 h-1/2 rounded-t-xl bg-gradient-to-b from-white/60 to-transparent"
            />
            <span className="relative drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">{icon}</span>
          </span>
          <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all duration-500 group-hover:rotate-45 group-hover:border-white/40 group-hover:bg-white group-hover:text-hb-night">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>

        <div className="relative mt-auto pt-10" style={{ transform: "translateZ(30px)" }}>
          <p className="eyebrow text-white/50">{label}</p>
          <p className="tabular mt-2 text-xl font-medium break-words text-white sm:text-2xl">{value}</p>
        </div>
      </a>
    </TiltCard>
  );
}
