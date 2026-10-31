import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TiltCard } from "@/components/motion/TiltCard";
import type { Service } from "@/content/services";
import { img } from "@/content/media";

export function ServiceCard({
  service,
  locale,
  cta,
}: {
  service: Service;
  locale: "es" | "en";
  cta: string;
}) {
  const image = img(service.card);
  return (
    <TiltCard className="h-full">
      <Link
        href={`/servicios/${service.slug}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-hb-blue-deep text-white"
        data-cursor="view"
      >
        <Image
          src={image.src}
          alt={image.alt[locale]}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/30 to-transparent"
        />
        <div
          className="absolute inset-0 flex flex-col justify-between p-7"
          style={{ transform: "translateZ(40px)" }}
        >
          <span className={`eyebrow tabular ${service.emergency ? "text-hb-rescue" : "text-hb-sunset"}`}>
            {service.index} / 06
          </span>
          <div>
            <h3 className="text-3xl font-medium tracking-tight">{service.title[locale]}</h3>
            <p className="mt-3 text-white/75">{service.line[locale]}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              {cta}{" "}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </TiltCard>
  );
}
