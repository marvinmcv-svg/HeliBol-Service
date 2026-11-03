import { getTranslations } from "next-intl/server";
import { ShieldCheck, Users, Wrench, Compass, Leaf } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard } from "@/components/motion/TiltCard";
import { Reveal } from "@/components/motion/Reveal";
import { VideoLoop } from "@/components/ui/VideoLoop";
import { img, video } from "@/content/media";
import Image from "next/image";

const icons = [ShieldCheck, Users, Wrench, Compass];

/** Safety pillars over the B&W cockpit loop (plan §6.8). */
export async function Safety() {
  const t = await getTranslations("home.safety");
  const pillars = t.raw("pillars") as { title: string; body: string }[];
  const bw = img("bw-headon");
  return (
    <section className="grain relative isolate overflow-hidden bg-hb-night py-24 text-white lg:py-36">
      <Image src={bw.src} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-25" />
      <VideoLoop
        {...video.cockpit}
        className="absolute inset-0 -z-10 size-full opacity-20 mix-blend-luminosity"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-hb-night via-hb-night/80 to-hb-night"
      />
      <div className="container-hb relative">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} dark className="max-w-4xl" />
        <ul className="mt-10 grid gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {pillars.map((p, i) => {
            const Icon = icons[i] ?? ShieldCheck;
            return (
              <Reveal as="li" key={p.title} delay={i * 0.08}>
                <TiltCard className="h-full">
                  <div className="glass relative h-full rounded-[24px] p-5 sm:p-7">
                    <div data-depth style={{ transform: "translateZ(40px)" }}>
                      <div className="flex items-center justify-between">
                        <span className="flex size-10 items-center justify-center rounded-full border border-white/15 text-hb-sunset sm:size-12">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="eyebrow tabular text-white/40">0{i + 1}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-medium sm:mt-8 sm:text-xl">{p.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70 sm:mt-3">{p.body}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </ul>
        <Reveal delay={0.2}>
          <p className="mt-12 flex max-w-3xl items-start gap-3 text-white/70">
            <Leaf className="mt-1 size-5 shrink-0 text-emerald-400" aria-hidden />
            {t("eco")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
