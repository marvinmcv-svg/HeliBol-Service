import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { HomeGlobe } from "@/components/sections/home/HomeGlobe";

/** "Ya hemos estado ahí" (plan §6.7): the 3D operations globe on a self-running tour. */
export async function OperationsMap() {
  const t = await getTranslations("home.map");
  return (
    <section className="grain relative overflow-hidden bg-hb-blue-deep py-24 text-white lg:py-32">
      <div aria-hidden className="hairline-grid absolute inset-0" />
      <div className="container-hb relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} dark />
          <Button href="/operaciones" variant="ghost" className="shrink-0 self-start lg:self-end">
            {t("cta")}
          </Button>
        </div>
        <div className="mt-14">
          <HomeGlobe />
        </div>
      </div>
    </section>
  );
}
