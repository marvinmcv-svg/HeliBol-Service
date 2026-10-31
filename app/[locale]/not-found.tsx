import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section className="grain hairline-grid relative flex min-h-[80svh] items-center bg-hb-night text-white">
      <div className="container-hb relative z-10 pt-24">
        <p className="eyebrow text-hb-sunset">ERR 404 · SLET</p>
        <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-medium">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg text-white/70">{t("body")}</p>
        <div className="mt-10">
          <Button href="/">{t("home")}</Button>
        </div>
      </div>
    </section>
  );
}
