"use client";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard } from "@/components/motion/TiltCard";
import { services } from "@/content/services";
import { img } from "@/content/media";

/**
 * "Lo que hacemos" (plan §6.4, M6/M5): the section pins and six service panels scroll sideways,
 * each image counter-parallaxes and a progress bar fills. Below 1024px it's a native swipe rail.
 */
export function ServicesRail() {
  const t = useTranslations("home.services");
  const tc = useTranslations("common");
  const locale = useLocale() as "es" | "en";
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const root = ref.current!;
        const track = root.querySelector<HTMLElement>("[data-track]")!;
        // Travel until the last card's right edge sits a gutter in from the viewport edge.
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.querySelector("[data-pin]"),
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(root.querySelector("[data-progress]"), { scaleX: self.progress }),
          },
        });
        root.querySelectorAll<HTMLElement>("[data-panel-img]").forEach((el) => {
          gsap.fromTo(
            el,
            { xPercent: -12 },
            {
              xPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
        ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="servicios" className="relative bg-hb-night text-white">
      <div
        data-pin
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 lg:h-[100svh] lg:justify-start lg:pt-[max(6.5rem,13svh)] lg:pb-[max(2rem,5svh)]"
      >
        <div aria-hidden className="hairline-grid absolute inset-0 opacity-50" />
        <div className="container-hb relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            lead={t("lead")}
            dark
            compact
            leadClassName="[@media(min-width:1024px)_and_(max-height:760px)]:hidden"
          />
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="eyebrow mb-3 flex justify-between text-white/50">
              <span>01</span>
              <span>06</span>
            </div>
            <div className="h-px w-full bg-white/15">
              <div data-progress className="h-px w-full origin-left scale-x-0 bg-hb-sunset" />
            </div>
          </div>
        </div>

        <div
          className="relative mt-12 overflow-x-auto overscroll-x-contain lg:mt-[max(1.5rem,4svh)] lg:min-h-0 lg:flex-1 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
          data-cursor="drag"
        >
          <ul
            data-track
            className="flex w-max snap-x snap-mandatory gap-5 px-5 sm:px-8 lg:h-full lg:gap-8 lg:px-12"
          >
            {services.map((s) => {
              const image = img(s.card);
              return (
                // Desktop: the card takes the full height left under the header and its width follows
                // from 4:5, so the whole image (and its copy) is always on screen while pinned.
                <li
                  key={s.slug}
                  className="w-[82vw] shrink-0 snap-start sm:w-[60vw] lg:aspect-[4/5] lg:h-full lg:w-auto lg:max-w-[42vw]"
                >
                  <TiltCard className="h-full">
                    <Link
                      href={`/servicios/${s.slug}`}
                      className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-hb-blue-deep lg:aspect-auto lg:h-full"
                      data-cursor="view"
                    >
                      <div data-panel-img className="absolute -inset-x-[14%] inset-y-0">
                        <Image
                          src={image.src}
                          alt={image.alt[locale]}
                          fill
                          sizes="(min-width:1024px) 40vw, 82vw"
                          placeholder="blur"
                          blurDataURL={image.blurDataURL}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/30 to-transparent"
                      />
                      <div
                        className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8"
                        data-depth
                        style={{ transform: "translateZ(40px)" }}
                      >
                        <span className="eyebrow tabular text-hb-sunset">{s.index} / 06</span>
                        <div>
                          <h3 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-[clamp(1.75rem,4svh,2.5rem)]">
                            {s.title[locale]}
                          </h3>
                          <p className="mt-3 max-w-sm text-white/75">{s.line[locale]}</p>
                          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                            {tc("viewService")}
                            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
