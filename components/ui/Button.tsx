"use client";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "@/components/motion/Magnetic";
import { track, type HbEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Variant = "primary" | "light" | "ghost" | "ghost-dark" | "rescue";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 isolate whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-hb-blue text-white hover:text-white",
  light: "bg-white text-hb-night hover:text-white",
  ghost: "border border-white/35 text-white hover:text-hb-night",
  "ghost-dark": "border border-ink/20 text-ink hover:text-white",
  rescue: "bg-hb-rescue text-white hover:text-white",
};
const sweep: Record<Variant, string> = {
  primary: "bg-hb-blue-deep",
  light: "bg-hb-blue",
  ghost: "bg-white",
  "ghost-dark": "bg-ink",
  rescue: "bg-[#d9430f]",
};

type Common = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  event?: HbEvent;
  magnetic?: boolean;
};
type AsLink = Common & { href: ComponentProps<typeof Link>["href"]; external?: false; onClick?: never };
type AsExternal = Common & { href: string; external: true; onClick?: never };
type AsButton = Common & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

/** Primary CTA: magnetic follow + fill sweep on hover (plan M4). */
export function Button(props: AsLink | AsExternal | AsButton) {
  const { children, variant = "primary", className, event, magnetic = true } = props;
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 translate-y-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0",
          sweep[variant],
        )}
      />
      {children}
    </>
  );
  const cls = cn(base, variants[variant], className);
  const fire = () => event && track(event);

  let el: ReactNode;
  if ("external" in props && props.external) {
    el = (
      <a
        href={props.href}
        className={cls}
        onClick={fire}
        target={props.href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  } else if (props.href !== undefined) {
    el = (
      <Link href={props.href} className={cls} onClick={fire}>
        {inner}
      </Link>
    );
  } else {
    const b = props as AsButton;
    el = (
      <button
        type={b.type ?? "button"}
        disabled={b.disabled}
        className={cn(cls, "disabled:opacity-60")}
        onClick={() => {
          fire();
          b.onClick?.();
        }}
      >
        {inner}
      </button>
    );
  }
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
