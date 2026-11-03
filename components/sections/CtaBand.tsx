import { getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { RevealImage } from "@/components/motion/RevealImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { HeliButton } from "@/components/ui/HeliButton";
import { WhatsAppPlanner } from "@/components/forms/WhatsAppPlanner";
import { Link } from "@/i18n/navigation";
import type { AircraftSlug } from "@/content/fleet";
import { img } from "@/content/media";
import { getPlannerTopic, type PlannerTopicKey } from "@/content/planner";
import { site, whatsappHref } from "@/content/site";

export const PLANNER_ID = "whatsapp";

/**
 * Closing section on every marketing page: the WhatsApp planner, the site's main CTA.
 * `quoteQuery.type` preselects the matching service; `quoteQuery.aircraft` the aircraft.
 */
export async function CtaBand({ quoteQuery }: { quoteQuery?: Record<string, string> }) {
  const t = await getTranslations("planner");
  const topic = getPlannerTopic(quoteQuery?.type)?.key as PlannerTopicKey | undefined;
  const aircraft = quoteQuery?.aircraft as AircraftSlug | undefined;
  return (
    <section
      id={PLANNER_ID}
      className="grain relative isolate scroll-mt-20 overflow-hidden bg-hb-night py-24 text-white lg:py-32"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px]">
        <RevealImage
          image={img("bell412-golden-hour")}
          sizes="100vw"
          parallax={8}
          reveal={false}
          cursor={false}
          imgClassName="opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hb-night/40 via-hb-night/80 to-hb-night" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 -z-10 size-[36rem] rounded-full bg-hb-sunset/10 blur-[140px]"
      />
      <div className="container-hb">
        <SectionHeader dark eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
        <div className="mt-14 lg:mt-20">
          {whatsappHref() ? <WhatsAppPlanner initialTopic={topic} initialAircraft={aircraft} /> : null}
        </div>
        <div className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-8 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>
            {t("alt")}{" "}
            <Link
              href={{ pathname: "/cotizar", query: quoteQuery }}
              className="font-semibold text-white underline-offset-4 hover:underline"
            >
              {t("altLink")} →
            </Link>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href={site.phoneHref} className="tabular inline-flex items-center gap-2 hover:text-white">
              <Phone className="size-4" aria-hidden /> {site.phone}
            </a>
            <HeliButton variant="ghost" />
          </div>
        </div>
      </div>
    </section>
  );
}
