import { Eyebrow } from "@/components/motion/Eyebrow";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  lead,
  dark = false,
  className,
  as = "h2",
  align = "left",
  compact = false,
  leadClassName,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  dark?: boolean;
  className?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
  /** Smaller title that also scales with viewport height (for pinned, full-screen stages). */
  compact?: boolean;
  leadClassName?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className={dark ? "text-hb-sunset" : "text-hb-blue-ink"}>{eyebrow}</Eyebrow>}
      <SplitHeading
        as={as}
        className={cn(
          compact
            ? "mt-4 text-[clamp(2rem,min(4.4vw,7.5svh),3.75rem)]"
            : "mt-5 text-[clamp(2.25rem,5vw,4.25rem)]",
          // After the size: tailwind-merge drops a leading-* that precedes a text-* size.
          "leading-[0.98] font-medium tracking-[-0.02em]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </SplitHeading>
      {lead && (
        <Reveal delay={0.15}>
          <p
            className={cn(
              "leading-relaxed",
              compact ? "mt-4 text-base xl:text-lg" : "mt-6 text-lg",
              dark ? "text-white/70" : "text-ink-soft",
              leadClassName,
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
