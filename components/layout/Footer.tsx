import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { WingBadge } from "@/components/ui/WingBadge";
import { BigWordmark } from "./BigWordmark";
import { SocialIcons } from "./SocialIcons";
import { LocaleSwitch } from "./LocaleSwitch";
import { services } from "@/content/services";
import { site, yearsFlying } from "@/content/site";

export async function Footer() {
  const t = await getTranslations();
  const locale = (await getLocale()) as "es" | "en";
  const company = [
    { href: "/flota", label: t("nav.fleet") },
    { href: "/operaciones", label: t("nav.operations") },
    { href: "/nosotros", label: t("nav.about") },
    { href: "/vuelos-panoramicos", label: t("nav.scenic") },
    { href: "/contacto", label: t("nav.contact") },
  ];
  const linkCls = "text-white/70 transition-colors hover:text-white";

  return (
    <footer className="grain relative overflow-hidden bg-hb-blue-deep text-white">
      <div aria-hidden className="hairline-grid absolute inset-0 opacity-60" />
      <div className="container-hb relative z-10 grid gap-12 pt-20 pb-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo className="h-14 w-auto" />
          <p className="eyebrow mt-6 text-hb-sunset">{site.brandLine}</p>
          <p className="mt-4 max-w-xs leading-relaxed text-white/70">{t("footer.mission")}</p>
          <WingBadge
            years={yearsFlying}
            label={t("footer.badge").replace(/^\d+\s*/, "")}
            className="mt-8 h-16 w-auto text-hb-sunset"
          />
        </div>
        <nav aria-label={t("footer.services")}>
          <h2 className="eyebrow font-sans text-white/50">{t("footer.services")}</h2>
          <ul className="mt-5 space-y-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/servicios/${s.slug}`} className={linkCls}>
                  {s.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t("footer.company")}>
          <h2 className="eyebrow font-sans text-white/50">{t("footer.company")}</h2>
          <ul className="mt-5 space-y-3">
            {company.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className={linkCls}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow font-sans text-white/50">{t("footer.contact")}</h2>
          <address className="mt-5 space-y-3 not-italic">
            <p className="text-white/70">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.country}
            </p>
            <p>
              <a href={site.phoneHref} className="tabular text-lg font-medium hover:text-hb-sunset">
                {site.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className={linkCls}>
                {site.email}
              </a>
            </p>
            <p>
              <a
                href={site.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-hb-sunset underline-offset-4 hover:underline"
              >
                {t("footer.map")} ↗
              </a>
            </p>
          </address>
          <div className="mt-8">
            <SocialIcons />
          </div>
        </div>
      </div>
      <div className="container-hb relative z-10 flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.legalName} {t("footer.rights")}
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacidad" className="hover:text-white">
            {t("meta.privacy")}
          </Link>
          <Link href="/terminos" className="hover:text-white">
            {t("meta.terms")}
          </Link>
          <LocaleSwitch className="text-white" />
        </div>
      </div>
      <div className="relative z-10">
        <BigWordmark />
      </div>
    </footer>
  );
}
