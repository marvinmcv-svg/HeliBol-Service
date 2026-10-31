"use client";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  return (
    <div role="group" aria-label={t("language")} className={cn("eyebrow flex items-center gap-1", className)}>
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && (
            <span aria-hidden className="opacity-40">
              |
            </span>
          )}
          <button
            type="button"
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={cn(
              "px-1 py-1 transition-opacity",
              l === locale ? "opacity-100" : "opacity-50 hover:opacity-100",
            )}
            onClick={() =>
              // @ts-expect-error — params match the current route's dynamic segments
              router.replace({ pathname, params }, { locale: l, scroll: false })
            }
          >
            {l.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
