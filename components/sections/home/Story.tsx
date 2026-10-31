import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RevealImage } from "@/components/motion/RevealImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { VideoLoop } from "@/components/ui/VideoLoop";
import { img, video } from "@/content/media";

/** "Una familia que vuela" (plan §6.5): golden-hour Bell 412 + tilted crew card. */
export async function Story() {
  const t = await getTranslations("home.story");
  return (
    <section className="relative overflow-hidden bg-hb-sky py-24 lg:py-36">
      <div aria-hidden className="hairline-grid-light absolute inset-0" />
      <div className="container-hb relative grid items-center gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
        <div className="relative">
          <div className="relative aspect-[16/11] overflow-hidden rounded-[28px]">
            <RevealImage
              image={img("bell412-golden-hour")}
              sizes="(min-width:1024px) 55vw, 100vw"
              parallax={6}
            />
          </div>
          <div className="absolute -right-4 -bottom-16 w-[46%] sm:-right-10 lg:-bottom-20">
            <TiltCard>
              <div className="relative aspect-[4/5] -rotate-3 overflow-hidden rounded-[22px] border-4 border-white shadow-2xl">
                <RevealImage image={img("team-hangar")} sizes="25vw" />
                <VideoLoop
                  {...video.crew}
                  className="absolute inset-0 size-full opacity-0 transition-opacity duration-700 hover:opacity-100"
                />
              </div>
            </TiltCard>
          </div>
        </div>
        <div className="pt-12 lg:pt-0">
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
          <Reveal delay={0.1}>
            <p className="mt-8 text-lg leading-relaxed text-ink-soft">{t("body")}</p>
            <Link
              href="/nosotros"
              className="group mt-10 inline-flex items-center gap-3 font-semibold text-hb-blue"
            >
              {t("link")}
              <span className="flex size-10 items-center justify-center rounded-full border border-hb-blue/30 transition-colors group-hover:bg-hb-blue group-hover:text-white">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
