import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TiltCard } from "@/components/motion/TiltCard";
import { formatSpec, type Aircraft } from "@/content/fleet";
import { img } from "@/content/media";

export function AircraftCard({
  aircraft,
  locale,
  cta,
}: {
  aircraft: Aircraft;
  locale: "es" | "en";
  cta: string;
}) {
  const image = img(aircraft.card);
  const quick = aircraft.specs.filter((s) => s.key === "pax" || s.key === "cruise" || s.key === "hook");
  return (
    <TiltCard className="h-full">
      <Link
        href={`/flota/${aircraft.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-line bg-white"
        data-cursor="view"
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <Image
            src={image.src}
            alt={image.alt[locale]}
            fill
            sizes="(min-width:1024px) 33vw, 100vw"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ objectPosition: image.position }}
          />
        </div>
        <div className="flex flex-1 flex-col p-7" style={{ transform: "translateZ(30px)" }}>
          <p className="eyebrow text-hb-blue-ink">{aircraft.variants}</p>
          <h3 className="mt-2 text-3xl font-medium tracking-tight text-ink">{aircraft.model}</h3>
          <p className="font-display text-ink-soft">“{aircraft.nickname[locale]}”</p>
          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
            {quick.map((s) => (
              <div key={s.key}>
                <dt className="text-[11px] tracking-wide text-ink-mute uppercase">{s.label[locale]}</dt>
                <dd className="tabular mt-1 text-sm font-semibold text-ink">
                  {formatSpec(s, "metric", locale)}
                </dd>
              </div>
            ))}
          </dl>
          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-hb-blue">
            {cta} <ArrowUpRight className="size-4" />
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
