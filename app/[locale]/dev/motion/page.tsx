import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/motion/Marquee";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { TiltCard } from "@/components/motion/TiltCard";
import { RevealImage } from "@/components/motion/RevealImage";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { WingBadge } from "@/components/ui/WingBadge";
import { img } from "@/content/media";

export const metadata: Metadata = { title: "Motion primitives", robots: { index: false, follow: false } };

/** Storybook-lite for the motion primitives (plan §11.4). noindex. */
export default async function MotionLab({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const block = "rounded-[24px] border border-white/10 p-8";
  return (
    <div className="bg-hb-night pt-32 pb-24 text-white">
      <div className="container-hb space-y-10">
        <h1 className="text-5xl font-medium">Motion lab</h1>
        <section className={block}>
          <p className="eyebrow mb-4 text-white/50">M15 · Eyebrow scramble</p>
          <Eyebrow className="text-hb-sunset">VERTICAL EFFICIENCY · EST. 1988</Eyebrow>
        </section>
        <section className={block}>
          <p className="eyebrow mb-4 text-white/50">M2 · SplitHeading</p>
          <SplitHeading className="text-6xl font-medium">
            Donde terminan los caminos, empezamos nosotros.
          </SplitHeading>
        </section>
        <section className={block}>
          <p className="eyebrow mb-4 text-white/50">M7 · CountUp odometer</p>
          <div className="flex gap-12 font-display text-7xl">
            <CountUp value="38" />
            <CountUp value="100+" />
            <CountUp value="24/7" />
          </div>
        </section>
        <section className={block}>
          <p className="eyebrow mb-4 text-white/50">M4 · Magnetic buttons</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/cotizar">Primary</Button>
            <Button href="/cotizar" variant="light">
              Light
            </Button>
            <Button href="/cotizar" variant="ghost">
              Ghost
            </Button>
            <Button href="/cotizar" variant="rescue">
              Rescue
            </Button>
            <HeliButton />
          </div>
        </section>
        <section className={block}>
          <p className="eyebrow mb-4 text-white/50">M5 · TiltCard · M12 · RevealImage · M14 cursor “VER”</p>
          <div className="grid gap-6 md:grid-cols-3">
            {(["bell212-jungle", "fire-drop", "h125-longline"] as const).map((k) => (
              <TiltCard key={k}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
                  <RevealImage image={img(k)} sizes="33vw" />
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
        <section className={`${block} px-0`}>
          <p className="eyebrow mb-4 px-8 text-white/50">M11 · Marquee (scroll to speed up)</p>
          <Marquee
            items={["BELL 212", "BELL 412", "H125", "SAR", "MEDEVAC", "BAMBI BUCKET", "LONG-LINE"]}
            className="eyebrow text-white/70"
          />
        </section>
        <section className={block}>
          <p className="eyebrow mb-4 text-white/50">Wing badge · Reveal</p>
          <Reveal>
            <WingBadge years={38} label="AÑOS" className="h-24 w-auto text-hb-sunset" />
          </Reveal>
        </section>
        <div className="h-[60vh]" />
      </div>
    </div>
  );
}
