"use client";
import { useTranslations } from "next-intl";
import { siWhatsapp } from "simple-icons";
import { Magnetic } from "@/components/motion/Magnetic";
import { useLenis } from "@/components/motion/SmoothScroll";
import { Link } from "@/i18n/navigation";
import { whatsappHref } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const PLANNER_ID = "whatsapp";

/**
 * The site's primary call to action. Scrolls to the WhatsApp planner when the page has one
 * (every marketing page ends with it), otherwise goes to the contact page's planner.
 */
export function WhatsAppCta({
  className,
  wrapClassName,
  short = false,
  label,
  icon = false,
  from = "cta",
  onNavigate,
}: {
  className?: string;
  /** Classes for the outer (magnetic) wrapper, e.g. responsive visibility. */
  wrapClassName?: string;
  short?: boolean;
  /** Overrides the default "Escríbanos por WhatsApp" text. */
  label?: string;
  /** Round icon-only button (mobile header). */
  icon?: boolean;
  from?: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("planner");
  const lenis = useLenis();
  if (!whatsappHref()) return null;

  return (
    <Magnetic className={cn("inline-flex", wrapClassName)}>
      <Link
        href={{ pathname: "/contacto", hash: PLANNER_ID }}
        onClick={(e) => {
          track("cta_whatsapp", { from });
          onNavigate?.();
          const target = document.getElementById(PLANNER_ID);
          if (!target) return;
          e.preventDefault();
          if (lenis) lenis.scrollTo(target, { offset: -80 });
          else target.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        aria-label={icon ? (label ?? t("cta")) : undefined}
        className={cn(
          "group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold tracking-wide whitespace-nowrap text-[#06351b] shadow-[0_12px_30px_-12px_rgba(37,211,102,0.8)] transition-colors duration-300 hover:text-white",
          icon && "size-11 px-0 py-0",
          className,
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 translate-y-full rounded-full bg-[#128C7E] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-y-0"
        />
        <svg viewBox="0 0 24 24" className={icon ? "size-5" : "size-4"} fill="currentColor" aria-hidden>
          <path d={siWhatsapp.path} />
        </svg>
        {!icon && (label ?? (short ? t("ctaShort") : t("cta")))}
      </Link>
    </Magnetic>
  );
}
