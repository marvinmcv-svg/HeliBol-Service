"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Pickaxe,
  LifeBuoy,
  Flame,
  Package,
  Crown,
  Mountain,
  Clapperboard,
  Plane,
  HelpCircle,
} from "lucide-react";
import { z } from "zod";
import { QuoteSchema, serviceTypes } from "@/lib/schemas";
import { submitQuote } from "@/lib/actions/forms";
import { track } from "@/lib/analytics";
import { Input, Textarea, Honeypot } from "./fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FormIn = z.input<typeof QuoteSchema>;
type FormOut = z.output<typeof QuoteSchema>;
type MissionType = (typeof serviceTypes)[number];

const typeIcons: Record<MissionType, typeof Plane> = {
  energy: Pickaxe,
  rescue: LifeBuoy,
  fire: Flame,
  cargo: Package,
  vip: Crown,
  scenic: Mountain,
  film: Clapperboard,
  turnkey: Plane,
  other: HelpCircle,
};

const stepFields: FieldPath<FormIn>[][] = [
  ["type"],
  ["dateStart", "dateEnd", "flexibility"],
  ["origin", "destination", "pax", "cargoKg", "notes"],
  ["name", "company", "email", "phone", "language", "consent"],
  [],
];

/** Multi-step quote (plan §7 Cotizar): progress bar, Motion step transitions, server action submit. */
export function QuoteForm({ initialType, aircraft }: { initialType?: string; aircraft?: string }) {
  const t = useTranslations("quote");
  const tf = useTranslations("form");
  const tc = useTranslations("common");
  const locale = useLocale() as "es" | "en";
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [result, setResult] = useState<{ ok: true; reference: string } | { ok: false; error: string } | null>(
    null,
  );
  const validType = serviceTypes.includes(initialType as MissionType)
    ? (initialType as MissionType)
    : undefined;

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(QuoteSchema),
    mode: "onTouched",
    defaultValues: {
      type: validType,
      flexibility: "days",
      language: locale,
      notes: aircraft
        ? `${locale === "es" ? "Aeronave de interés" : "Aircraft of interest"}: ${aircraft}`
        : "",
      dateStart: "",
      origin: "",
      name: "",
      email: "",
      phone: "",
    },
  });
  const { register, handleSubmit, formState, trigger, watch } = form;
  const errors = formState.errors;
  const values = watch();
  const steps = t.raw("steps") as string[];
  const err = (msg?: string) =>
    msg
      ? msg === "contactRequired"
        ? tf("contactRequired")
        : msg.includes("email")
          ? tf("invalidEmail")
          : tf("required")
      : undefined;

  const go = async (to: number) => {
    if (to > step) {
      const ok = await trigger(stepFields[step]);
      if (!ok) return;
    }
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const onSubmit = handleSubmit(async (data) => {
    const res = await submitQuote(data);
    setResult(res);
    if (res.ok) track("quote_submitted", { type: data.type });
  });

  if (result?.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-line bg-white p-10 text-center shadow-sm sm:p-16"
        role="status"
      >
        <CheckCircle2 className="mx-auto size-14 text-hb-blue" aria-hidden />
        <h2 className="mt-6 text-4xl font-medium">{t("successTitle")}</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-ink-soft">
          {t("successBody", { reference: result.reference })}
        </p>
        <div className="mt-10 flex justify-center">
          <Button href="/">{t("successHome")}</Button>
        </div>
      </motion.div>
    );
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -40 }),
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative rounded-[28px] border border-line bg-white p-6 shadow-sm sm:p-10"
    >
      <Honeypot {...register("website")} />
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-sm">
          <p className="eyebrow text-hb-blue-ink" aria-live="polite">
            {t("step", { current: step + 1, total: steps.length })}
          </p>
          <p className="font-medium text-ink-soft">{steps[step]}</p>
        </div>
        <div
          className="mt-3 h-1 overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
        >
          <motion.div
            className="h-full rounded-full bg-hb-blue"
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 0 && (
            <fieldset>
              <legend className="font-display text-3xl font-medium">{t("missionTitle")}</legend>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {serviceTypes.map((type) => {
                  const Icon = typeIcons[type];
                  const active = values.type === type;
                  return (
                    <label
                      key={type}
                      className={cn(
                        "flex cursor-pointer flex-col gap-4 rounded-[20px] border p-5 transition-colors",
                        active ? "border-hb-blue bg-hb-sky" : "border-line hover:border-ink/30",
                      )}
                    >
                      <input
                        type="radio"
                        value={type}
                        className="sr-only"
                        {...register("type", {
                          onChange: () => setTimeout(() => go(1), 200),
                        })}
                      />
                      <Icon className={cn("size-6", active ? "text-hb-blue" : "text-ink-soft")} aria-hidden />
                      <span className="font-medium">{t(`types.${type}`)}</span>
                    </label>
                  );
                })}
              </div>
              {errors.type && <p className="mt-3 text-sm text-hb-rescue">{tf("required")}</p>}
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="space-y-5">
              <legend className="mb-8 font-display text-3xl font-medium">{t("datesTitle")}</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  type="date"
                  label={t("dateStart")}
                  {...register("dateStart")}
                  error={err(errors.dateStart?.message)}
                  className="[&_label]:top-2 [&_label]:text-xs"
                />
                <Input
                  type="date"
                  label={t("dateEnd")}
                  {...register("dateEnd")}
                  className="[&_label]:top-2 [&_label]:text-xs"
                />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-ink-soft">{t("flexibility")}</p>
                <div className="flex flex-wrap gap-2">
                  {(["exact", "days", "flexible"] as const).map((f) => (
                    <label
                      key={f}
                      className={cn(
                        "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        values.flexibility === f ? "border-hb-blue bg-hb-blue text-white" : "border-line",
                      )}
                    >
                      <input type="radio" value={f} className="sr-only" {...register("flexibility")} />
                      {t(`flex.${f}`)}
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="space-y-5">
              <legend className="mb-8 font-display text-3xl font-medium">{t("routeTitle")}</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={t("origin")}
                  {...register("origin")}
                  error={err(errors.origin?.message)}
                  autoComplete="off"
                />
                <Input label={t("destination")} {...register("destination")} autoComplete="off" />
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  label={t("pax")}
                  {...register("pax", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
                />
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  label={t("cargo")}
                  {...register("cargoKg", {
                    setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)),
                  })}
                />
              </div>
              <Textarea label={t("notes")} {...register("notes")} />
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="space-y-5">
              <legend className="mb-8 font-display text-3xl font-medium">{t("contactTitle")}</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label={tf("name")}
                  autoComplete="name"
                  {...register("name")}
                  error={err(errors.name?.message)}
                />
                <Input label={tf("company")} autoComplete="organization" {...register("company")} />
                <Input
                  type="email"
                  label={tf("email")}
                  autoComplete="email"
                  {...register("email")}
                  error={err(errors.email?.message)}
                />
                <Input type="tel" label={tf("phone")} autoComplete="tel" {...register("phone")} />
              </div>
              <div>
                <p className="mb-3 text-sm font-medium text-ink-soft">{tf("language")}</p>
                <div className="flex gap-2">
                  {(["es", "en"] as const).map((l) => (
                    <label
                      key={l}
                      className={cn(
                        "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium",
                        values.language === l ? "border-hb-blue bg-hb-blue text-white" : "border-line",
                      )}
                    >
                      <input type="radio" value={l} className="sr-only" {...register("language")} />
                      {l === "es" ? "Español" : "English"}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-3 text-sm text-ink-soft">
                <input type="checkbox" className="mt-0.5 size-4 accent-hb-blue" {...register("consent")} />
                <span>{tf("consent")}</span>
              </label>
              {errors.consent && <p className="text-sm text-hb-rescue">{tf("required")}</p>}
            </fieldset>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl font-medium">{t("reviewTitle")}</h2>
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {[
                  [steps[0], values.type ? t(`types.${values.type}`) : "—", 0],
                  [
                    steps[1],
                    [values.dateStart, values.dateEnd].filter(Boolean).join(" → ") +
                      ` · ${t(`flex.${values.flexibility ?? "days"}`)}`,
                    1,
                  ],
                  [
                    steps[2],
                    [values.origin, values.destination].filter(Boolean).join(" → ") +
                      (values.pax ? ` · ${values.pax} pax` : "") +
                      (values.cargoKg ? ` · ${values.cargoKg} kg` : ""),
                    2,
                  ],
                  [
                    steps[3],
                    [values.name, values.company, values.email, values.phone].filter(Boolean).join(" · "),
                    3,
                  ],
                ].map(([label, value, s]) => (
                  <div key={String(s)} className="flex items-start justify-between gap-6 py-4">
                    <div>
                      <dt className="text-sm text-ink-soft">{label}</dt>
                      <dd className="mt-1 font-medium">{value}</dd>
                    </div>
                    <button
                      type="button"
                      onClick={() => go(Number(s))}
                      className="text-sm font-semibold text-hb-blue"
                    >
                      {t("edit")}
                    </button>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-sm text-ink-mute">{t("noPrices")}</p>
              {result && !result.ok && (
                <p role="alert" className="mt-4 rounded-2xl bg-hb-rescue/10 p-4 text-sm text-ink">
                  {tf("error")}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="size-4" /> {tc("back")}
          </button>
        ) : (
          <span />
        )}
        {step < 4 ? (
          // Distinct keys: reusing one <button> and flipping it to type=submit mid-click would submit the form.
          <Button key="next" onClick={() => go(step + 1)} magnetic={false}>
            {tc("next")} <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button key="submit" type="submit" disabled={formState.isSubmitting} magnetic={false}>
            {formState.isSubmitting ? tf("sending") : t("submit")}
          </Button>
        )}
      </div>
    </form>
  );
}
