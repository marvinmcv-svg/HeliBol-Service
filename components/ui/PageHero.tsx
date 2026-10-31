import { RevealImage } from "@/components/motion/RevealImage";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import type { Img } from "@/content/media";
import { site } from "@/content/site";
import type { ReactNode } from "react";

/** Dark full-bleed inner-page hero with HUD details. */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  children,
  accent = "sunset",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  image: Img;
  children?: ReactNode;
  accent?: "sunset" | "rescue";
}) {
  return (
    <section className="grain relative isolate flex min-h-[78svh] items-end overflow-hidden bg-hb-night text-white">
      <RevealImage
        image={image}
        sizes="100vw"
        priority
        reveal={false}
        parallax={8}
        cursor={false}
        imgClassName="opacity-70"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/60 to-hb-night/20"
      />
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-50" />
      <div className="container-hb relative z-10 pt-40 pb-16 lg:pb-24">
        <Eyebrow className={accent === "rescue" ? "text-hb-rescue" : "text-hb-sunset"}>{eyebrow}</Eyebrow>
        <SplitHeading
          as="h1"
          immediate
          className="mt-6 max-w-5xl text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.025em]"
        >
          {title}
        </SplitHeading>
        {lead && (
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{lead}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.45}>
            <div className="mt-10 flex flex-wrap gap-3">{children}</div>
          </Reveal>
        )}
        <p aria-hidden className="eyebrow mt-14 hidden text-white/40 md:block">
          {site.hudCoords} · {site.icao} · HELIBOL
        </p>
      </div>
    </section>
  );
}
