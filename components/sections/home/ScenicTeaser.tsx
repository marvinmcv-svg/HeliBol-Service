import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RevealImage } from "@/components/motion/RevealImage";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { TiltCard } from "@/components/motion/TiltCard";
import { img } from "@/content/media";

/** Scenic & family flights — the warmth moment (plan §6.9). */
export async function ScenicTeaser() {
  const t = await getTranslations("home.scenic");
  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-36">
      <div className="container-hb grid items-center gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-24">
        <TiltCard max={6} className="mx-auto w-full max-w-md">
          <div className="relative aspect-[844/1500] overflow-hidden rounded-[32px] shadow-[0_40px_80px_-30px_rgba(11,58,99,0.45)]">
            <RevealImage image={img("scenic-waterfall")} sizes="(min-width:1024px) 30vw, 90vw" parallax={6} />
          </div>
        </TiltCard>
        <div>
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">{t("body")}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/vuelos-panoramicos">{t("cta")}</Button>
              <HeliButton topic="scenic" variant="ghost-dark" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
