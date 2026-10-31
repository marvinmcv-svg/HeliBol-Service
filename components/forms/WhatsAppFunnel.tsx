"use client";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CheckCheck, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { siWhatsapp } from "simple-icons";
import { Input, Textarea } from "./fields";
import { Emblem } from "@/components/ui/Emblem";
import { fleet } from "@/content/fleet";
import { site, whatsappHref } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Values = {
  name: string;
  company: string;
  occasion: string;
  fleet: string;
  date: string;
  pax: number;
  origin: string;
  message: string;
};
type LabelKey = "name" | "company" | "occasion" | "date" | "pax" | "fleet" | "origin" | "message";

const EMPTY: Values = {
  name: "",
  company: "",
  occasion: "",
  fleet: "",
  date: "",
  pax: 2,
  origin: "",
  message: "",
};
const MAX_PAX = 14;

/**
 * Build the WhatsApp payload: an intro line, then one "*Key:* value" line per answered field.
 * WhatsApp renders *…* as bold, and encodeURIComponent keeps the line breaks (%0A).
 */
export function buildWhatsAppMessage(
  v: Values,
  labels: Record<LabelKey, string>,
  intro: string,
  outro: string,
  locale: "es" | "en",
) {
  const date = v.date
    ? new Intl.DateTimeFormat(locale === "es" ? "es-BO" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${v.date}T00:00:00Z`))
    : "";
  const rows: [LabelKey, string][] = [
    ["name", v.name.trim()],
    ["company", v.company.trim()],
    ["occasion", v.occasion],
    ["date", date],
    ["pax", v.occasion ? String(v.pax) : ""],
    ["fleet", v.fleet],
    ["origin", v.origin.trim()],
    ["message", v.message.trim()],
  ];
  const lines = rows.filter(([, val]) => val).map(([k, val]) => `*${labels[k]}:* ${val}`);
  return [intro, "", ...lines, "", outro].join("\n");
}

/** Renders WhatsApp-style *bold* inside a preview bubble. */
function Formatted({ line }: { line: string }) {
  const m = /^\*(.+?):\*\s?(.*)$/.exec(line);
  if (!m) return <>{line}</>;
  return (
    <>
      <strong className="font-semibold">{m[1]}:</strong> {m[2]}
    </>
  );
}

function WaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={siWhatsapp.path} />
    </svg>
  );
}

export function WhatsAppFunnel() {
  const t = useTranslations("contactPage");
  const locale = useLocale() as "es" | "en";
  const reduced = useReducedMotion();
  const steps = t.raw("steps") as string[];
  const occasions = t.raw("occasions") as string[];
  const labels = t.raw("labels") as Record<LabelKey, string>;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<"name" | "occasion", boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [today, setToday] = useState<string>();
  useEffect(() => setToday(new Date().toISOString().slice(0, 10)), []);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((p) => ({ ...p, [k]: val }));
    if (k === "name" || k === "occasion") setErrors((e) => ({ ...e, [k]: false }));
  };

  const message = buildWhatsAppMessage(v, labels, t("payloadIntro"), t("payloadOutro"), locale);
  const ready = v.name.trim().length > 1 && !!v.occasion;
  const href = whatsappHref(message);

  const validate = (s: number) => {
    if (s === 0 && v.name.trim().length < 2) {
      setErrors((e) => ({ ...e, name: true }));
      formRef.current?.querySelector<HTMLInputElement>("#wa-name")?.focus();
      return false;
    }
    if (s === 1 && !v.occasion) {
      setErrors((e) => ({ ...e, occasion: true }));
      return false;
    }
    return true;
  };
  const go = (to: number) => {
    for (let s = step; s < to; s++) if (!validate(s)) return;
    setDir(to > step ? 1 : -1);
    setStep(to);
  };
  const send = () => {
    if (!ready) {
      go(v.name.trim().length < 2 ? 0 : 1);
      validate(v.name.trim().length < 2 ? 0 : 1);
      return;
    }
    track("cta_whatsapp", { from: "contact_funnel", occasion: v.occasion });
    window.open(href, "_blank", "noopener,noreferrer");
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < steps.length - 1) go(step + 1);
    else send();
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
      active
        ? "border-hb-blue bg-hb-blue text-white shadow-[0_8px_20px_-8px_rgba(28,117,188,0.8)]"
        : "border-line bg-white text-ink-soft hover:border-hb-blue/50 hover:text-ink",
    );

  const slide = {
    initial: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * -40 }),
  };

  const fleetChoices = [t("fFleetAny"), ...fleet.map((a) => a.model)];
  const previewLines = message.split("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      {/* ── Left: step-by-step form ── */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="rounded-[28px] border border-line bg-white p-6 shadow-[0_30px_80px_-40px_rgba(6,19,31,0.25)] sm:p-9"
      >
        <ol className="grid grid-cols-3 gap-3" aria-label={t("stepOf", { current: step + 1, total: 3 })}>
          {steps.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => go(i)}
                className="group w-full text-left"
                aria-current={i === step ? "step" : undefined}
              >
                <span className="block h-1 overflow-hidden rounded-full bg-line">
                  <motion.span
                    className="block h-full rounded-full bg-hb-blue"
                    initial={false}
                    animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span
                  className={cn(
                    "mt-3 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase transition-colors",
                    i <= step ? "text-ink" : "text-ink-mute",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-[10px] transition-colors",
                      i < step ? "bg-hb-blue text-white" : i === step ? "bg-ink text-white" : "bg-line",
                    )}
                  >
                    {i < step ? <Check className="size-3" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <p className="eyebrow mt-8 text-hb-blue-ink" aria-live="polite">
          {t("stepOf", { current: step + 1, total: 3 })} · {steps[step]}
        </p>

        <div className="relative mt-5 min-h-[330px]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.fieldset
              key={step}
              custom={dir}
              variants={slide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              <legend className="sr-only">{steps[step]}</legend>
              {step === 0 && (
                <>
                  <Input
                    id="wa-name"
                    label={t("fName")}
                    autoComplete="name"
                    value={v.name}
                    onChange={(e) => set("name", e.target.value)}
                    error={errors.name ? t("needMore") : undefined}
                    autoFocus={false}
                  />
                  <Input
                    id="wa-company"
                    label={t("fCompany")}
                    autoComplete="organization"
                    value={v.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <div role="radiogroup" aria-label={t("fOccasion")} aria-invalid={errors.occasion}>
                    <p className="font-display text-xl font-medium">{t("fOccasion")}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {occasions.map((o) => (
                        <button
                          key={o}
                          type="button"
                          role="radio"
                          aria-checked={v.occasion === o}
                          onClick={() => set("occasion", o)}
                          className={chip(v.occasion === o)}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                    {errors.occasion && <p className="mt-2 text-sm text-hb-rescue">{t("needMore")}</p>}
                  </div>
                  <div role="radiogroup" aria-label={t("fFleet")} className="pt-2">
                    <p className="font-display text-xl font-medium">{t("fFleet")}</p>
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {fleetChoices.map((f, i) => {
                        const active = v.fleet === f;
                        const a = i > 0 ? fleet[i - 1] : undefined;
                        return (
                          <button
                            key={f}
                            type="button"
                            role="radio"
                            aria-checked={v.fleet === f}
                            onClick={() => set("fleet", v.fleet === f ? "" : f)}
                            className={cn(
                              "rounded-2xl border p-3 text-left transition-all duration-300",
                              active
                                ? "border-hb-blue bg-hb-sky ring-1 ring-hb-blue"
                                : "border-line hover:border-hb-blue/50",
                            )}
                          >
                            <span className="block text-sm font-semibold text-ink">{f}</span>
                            <span className="mt-0.5 block text-xs text-ink-mute">
                              {a ? a.nickname[locale] : "—"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="wa-date"
                      type="date"
                      min={today}
                      label={t("fDate")}
                      value={v.date}
                      onChange={(e) => set("date", e.target.value)}
                    />
                    <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-2.5">
                      <span className="text-sm text-ink-soft" id="wa-pax-label">
                        {t("fPax")}
                      </span>
                      <div className="flex items-center gap-3" role="group" aria-labelledby="wa-pax-label">
                        <button
                          type="button"
                          onClick={() => set("pax", Math.max(1, v.pax - 1))}
                          disabled={v.pax <= 1}
                          className="flex size-8 items-center justify-center rounded-full border border-line transition-colors hover:border-hb-blue disabled:opacity-40"
                          aria-label="−1"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <output aria-live="polite" className="tabular w-6 text-center text-lg font-semibold">
                          {v.pax}
                        </output>
                        <button
                          type="button"
                          onClick={() => set("pax", Math.min(MAX_PAX, v.pax + 1))}
                          disabled={v.pax >= MAX_PAX}
                          className="flex size-8 items-center justify-center rounded-full border border-line transition-colors hover:border-hb-blue disabled:opacity-40"
                          aria-label="+1"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <Input
                    id="wa-origin"
                    label={t("fOrigin")}
                    value={v.origin}
                    onChange={(e) => set("origin", e.target.value)}
                  />
                  <Textarea
                    id="wa-message"
                    label={t("fMessage")}
                    value={v.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                </>
              )}
            </motion.fieldset>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => go(step - 1)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-ink-soft transition-colors hover:text-ink",
              step === 0 && "invisible",
            )}
          >
            <ArrowLeft className="size-4" /> {t("back")}
          </button>
          {step < steps.length - 1 ? (
            <button
              type="submit"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-hb-blue"
            >
              {t("next")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-[#06351b] transition-[filter] hover:brightness-95 lg:hidden"
            >
              <WaGlyph className="size-4" /> {t("continue")}
            </button>
          )}
        </div>
      </form>

      {/* ── Right: live WhatsApp preview ── */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow text-hb-blue-ink">{t("previewTitle")}</p>
          <p className="text-xs text-ink-mute">{t("previewHint")}</p>
        </div>
        <div className="mt-4 overflow-hidden rounded-[28px] border border-black/5 shadow-[0_40px_90px_-40px_rgba(6,19,31,0.5)]">
          <div className="flex items-center gap-3 bg-[#075E54] px-5 py-3.5 text-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-white">
              <Emblem className="h-6 w-auto text-hb-blue" />
            </span>
            <div className="min-w-0">
              <p className="leading-tight font-semibold">Helibol</p>
              <p className="tabular text-xs text-white/70">
                {site.whatsappDisplay} · {t("previewOnline")}
              </p>
            </div>
            <WaGlyph className="ml-auto size-5 text-white/70" />
          </div>
          <div
            className="relative min-h-[380px] bg-[#EFEAE2] px-4 py-6 sm:px-6"
            style={{
              backgroundImage:
                "radial-gradient(rgba(7,94,84,0.07) 1px, transparent 1px), radial-gradient(rgba(7,94,84,0.05) 1px, transparent 1px)",
              backgroundSize: "22px 22px, 22px 22px",
              backgroundPosition: "0 0, 11px 11px",
            }}
          >
            <motion.div
              layout={!reduced}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="relative ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] px-4 pt-3 pb-2 text-[15px] leading-relaxed text-[#111B21] shadow-sm"
            >
              <span
                aria-hidden
                className="absolute top-0 -right-2 size-3 bg-[#D9FDD3] [clip-path:polygon(0_0,100%_0,0_100%)]"
              />
              <LayoutGroup>
                <div aria-live="polite" aria-atomic="false" className="break-words">
                  <AnimatePresence initial={false}>
                    {previewLines.map((line, i) => (
                      <motion.p
                        key={line.startsWith("*") ? line.slice(0, line.indexOf(":*")) : `l${i}-${line}`}
                        layout={!reduced ? "position" : false}
                        initial={reduced ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={cn(!line && "h-3")}
                      >
                        <Formatted line={line} />
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>
              <span
                suppressHydrationWarning
                className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[#667781]"
              >
                {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date())}
                <CheckCheck className="size-3.5 text-[#53BDEB]" aria-hidden />
              </span>
            </motion.div>
          </div>
        </div>
        <button
          type="button"
          onClick={send}
          aria-disabled={!ready}
          className={cn(
            "group mt-5 flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-base font-semibold transition-all duration-300",
            ready
              ? "bg-[#25D366] text-[#06351b] shadow-[0_18px_40px_-14px_rgba(37,211,102,0.9)] hover:-translate-y-0.5"
              : "cursor-not-allowed bg-line text-ink-mute",
          )}
        >
          <WaGlyph className="size-5" />
          {t("continue")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
        <p className="mt-3 min-h-5 text-center text-sm text-ink-mute" aria-live="polite">
          {ready ? "" : t("needMore")}
        </p>
      </div>
    </div>
  );
}
