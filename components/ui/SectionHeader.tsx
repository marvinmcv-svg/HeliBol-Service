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
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  dark?: boolean;
  className?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow className={dark ? "text-hb-sunset" : "text-hb-blue-ink"}>{eyebrow}</Eyebrow>}
      <SplitHeading
        as={as}
        className={cn(
          "mt-5 text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.98] font-medium tracking-[-0.02em]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </SplitHeading>
      {lead && (
        <Reveal delay={0.15}>
          <p className={cn("mt-6 text-lg leading-relaxed", dark ? "text-white/70" : "text-ink-soft")}>
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
