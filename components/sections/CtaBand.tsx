import { getTranslations } from "next-intl/server";
import { RevealImage } from "@/components/motion/RevealImage";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HeliButton } from "@/components/ui/HeliButton";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { img } from "@/content/media";

/** Final CTA band on the golden-hour photo (plan §6.11). Reused on inner pages. */
export async function CtaBand({ quoteQuery }: { quoteQuery?: Record<string, string> }) {
  const t = await getTranslations("home.cta");
  const tc = await getTranslations("common");
  return (
    <section className="grain relative isolate overflow-hidden bg-hb-night py-28 text-white lg:py-40">
      <RevealImage
        image={img("bell412-golden-hour")}
        sizes="100vw"
        parallax={10}
        reveal={false}
        cursor={false}
        imgClassName="opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-hb-night via-hb-night/50 to-hb-night/30"
      />
      <div className="container-hb relative z-10 text-center">
        <SplitHeading className="mx-auto max-w-4xl text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-medium tracking-[-0.025em]">
          {t("title")}
        </SplitHeading>
        <Reveal delay={0.2}>
          <p className="mt-6 text-lg text-white/80">{t("sub")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href={{ pathname: "/cotizar", query: quoteQuery }} variant="light" event="cta_quote">
              {tc("quote")}
            </Button>
            <WhatsAppButton />
            <HeliButton />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
