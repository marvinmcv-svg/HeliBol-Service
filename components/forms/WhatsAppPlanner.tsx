"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  ChevronLeft,
  Minus,
  MoreVertical,
  Phone,
  Plus,
  SendHorizontal,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { siWhatsapp } from "simple-icons";
import { Emblem } from "@/components/ui/Emblem";
import { fleet, type AircraftSlug } from "@/content/fleet";
import { getPlannerTopic, plannerTopics, type PlannerTopicKey } from "@/content/planner";
import { site, whatsappHref } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Locale = "es" | "en";
type Values = {
  topic?: PlannerTopicKey;
  picks: Record<string, string>;
  aircraft: string;
  pax: number;
  place: string;
  date: string;
  name: string;
  company: string;
  message: string;
};
type Labels = Record<
  "service" | "place" | "date" | "pax" | "aircraft" | "name" | "company" | "message",
  string
>;

const MAX_PAX = 14;
const STEPS = 4;
const WA_GREEN = "#25D366";

function WaGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={siWhatsapp.path} />
    </svg>
  );
}

/** "*Label:* value" lines → WhatsApp bold. Exported for tests / reuse. */
export function buildPlannerMessage(
  v: Values,
  locale: Locale,
  copy: { hello: string; intro: string; outro: string; labels: Labels },
) {
  const topic = getPlannerTopic(v.topic);
  if (!topic) return copy.hello;
  const date = v.date
    ? new Intl.DateTimeFormat(locale === "es" ? "es-BO" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${v.date}T00:00:00Z`))
    : "";
  const rows: [string, string][] = [
    [copy.labels.service, topic.title[locale]],
    ...topic.choices.map((c) => [c.short[locale], v.picks[c.key] ?? ""] as [string, string]),
    [copy.labels.pax, topic.pax ? String(v.pax) : ""],
    [copy.labels.place, v.place.trim()],
    [copy.labels.date, date],
    [copy.labels.aircraft, v.aircraft],
    [copy.labels.name, v.name.trim()],
    [copy.labels.company, v.company.trim()],
    [copy.labels.message, v.message.trim()],
  ];
  const lines = rows.filter(([, val]) => val).map(([k, val]) => `*${k}:* ${val}`);
  return [`${copy.hello} ${copy.intro}`, "", ...lines, "", copy.outro].join("\n");
}

function Formatted({ line }: { line: string }) {
  const m = /^\*(.+?):\*\s?(.*)$/.exec(line);
  if (!m) return <>{line}</>;
  return (
    <>
      <strong className="font-semibold">{m[1]}:</strong> {m[2]}
    </>
  );
}

/**
 * The site's main CTA: a four-step, service-aware request builder with a live WhatsApp chat
 * preview on a phone. The message it writes opens in WhatsApp ready to send.
 */
export function WhatsAppPlanner({
  initialTopic,
  initialAircraft,
  from = "planner",
}: {
  initialTopic?: PlannerTopicKey;
  initialAircraft?: AircraftSlug;
  from?: string;
}) {
  const t = useTranslations("planner");
  const locale = useLocale() as Locale;
  const reduced = useReducedMotion();
  const steps = t.raw("steps") as string[];
  const labels = t.raw("labels") as Labels;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [v, setV] = useState<Values>(() => ({
    topic: initialTopic,
    picks: {},
    aircraft: fleet.find((a) => a.slug === initialAircraft)?.model ?? "",
    pax: 2,
    place: "",
    date: "",
    name: "",
    company: "",
    message: "",
  }));
  const [error, setError] = useState<"topic" | "name" | null>(null);
  const [today, setToday] = useState<string>();
  const [time, setTime] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setToday(now.toISOString().slice(0, 10));
    setTime(new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(now));
  }, [locale]);

  const topic = getPlannerTopic(v.topic);
  const message = buildPlannerMessage(v, locale, {
    hello: t("payloadHello"),
    intro: t("payloadIntro"),
    outro: t("payloadOutro"),
    labels,
  });
  const ready = !!topic && v.name.trim().length > 1;

  // Keep the newest part of the chat in view as the bubble grows.
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [message, reduced]);

  const patch = (p: Partial<Values>) => {
    setV((prev) => ({ ...prev, ...p }));
    setError(null);
  };
  const pickTopic = (key: PlannerTopicKey) => {
    if (key === v.topic) return;
    const next = getPlannerTopic(key)!;
    // Answers belong to a topic; keep the aircraft only if the new topic offers it.
    const keepAircraft = next.aircraft.some((s) => fleet.find((a) => a.slug === s)?.model === v.aircraft);
    patch({ topic: key, picks: {}, aircraft: keepAircraft ? v.aircraft : "" });
  };

  const valid = (s: number) => {
    if (s === 0 && !topic) {
      setError("topic");
      return false;
    }
    if (s === 2 && v.name.trim().length < 2) {
      setError("name");
      nameRef.current?.focus();
      return false;
    }
    return true;
  };
  const go = (to: number) => {
    if (to < 0 || to >= STEPS) return;
    for (let s = step; s < to; s++)
      if (!valid(s)) {
        if (s !== step) {
          setDir(1);
          setStep(s);
        }
        return;
      }
    setDir(to > step ? 1 : -1);
    setStep(to);
    // On small screens the form is tall; bring its top back into view.
    if (window.innerWidth < 1024) topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };
  const send = () => {
    if (!ready) return go(STEPS - 1);
    track("cta_whatsapp", { from, topic: v.topic ?? "" });
    window.open(whatsappHref(message), "_blank", "noopener,noreferrer");
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS - 1) go(step + 1);
    else send();
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm transition-all duration-300",
      active
        ? "border-hb-sunset bg-hb-sunset text-hb-night font-semibold shadow-[0_8px_24px_-10px_rgba(242,162,58,0.9)]"
        : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
    );
  const field =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/35 focus:border-hb-sunset aria-invalid:border-hb-rescue [color-scheme:dark]";

  const slide = {
    initial: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * 36 }),
    animate: { opacity: 1, x: 0 },
    exit: (d: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: d * -36 }),
  };

  const aircraftChoices = topic
    ? [t("aircraftAny"), ...topic.aircraft.map((s) => fleet.find((a) => a.slug === s)!.model)]
    : [];

  return (
    <div
      ref={topRef}
      className="grid scroll-mt-28 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:gap-16 xl:gap-24"
    >
      {/* ── Form ── */}
      <form onSubmit={onSubmit} noValidate className="min-w-0">
        <ol
          className="grid grid-cols-4 gap-2 sm:gap-3"
          aria-label={t("stepOf", { current: step + 1, total: STEPS })}
        >
          {steps.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => go(i)}
                className="group w-full text-left"
                aria-current={i === step ? "step" : undefined}
              >
                <span className="block h-px bg-white/15">
                  <motion.span
                    className="block h-full bg-hb-sunset"
                    initial={false}
                    animate={{ width: i <= step ? "100%" : "0%" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
                <span
                  className={cn(
                    "mt-4 block text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors sm:text-[11px]",
                    i === step
                      ? "text-white"
                      : i < step
                        ? "text-white/60"
                        : "text-white/35 group-hover:text-white/60",
                  )}
                >
                  0{i + 1}
                  <span className="hidden sm:inline"> · {s}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">
          {t("stepOf", { current: step + 1, total: STEPS })}: {steps[step]}
        </p>

        <div className="relative mt-10 min-h-[420px]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.fieldset
              key={step}
              custom={dir}
              variants={slide}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <legend className="sr-only">{steps[step]}</legend>

              {step === 0 && (
                <>
                  <div role="radiogroup" aria-label={steps[0]} className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    {plannerTopics.map((tp, i) => {
                      const active = v.topic === tp.key;
                      return (
                        <button
                          key={tp.key}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => pickTopic(tp.key)}
                          className={cn(
                            "group relative flex flex-col items-start overflow-hidden border p-5 text-left transition-all duration-300 sm:p-7",
                            active
                              ? "border-hb-sunset bg-hb-sunset/[0.08]"
                              : "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]",
                          )}
                        >
                          <span className="tabular font-display text-sm text-hb-sunset">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="mt-3 font-display text-xl font-medium tracking-[0.04em] text-white uppercase sm:mt-4 sm:text-2xl">
                            {tp.title[locale]}
                          </span>
                          <span className="mt-2 text-sm leading-relaxed text-white/55">
                            {tp.line[locale]}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "absolute top-5 right-5 grid size-5 place-items-center rounded-full border transition-colors",
                              active ? "border-hb-sunset bg-hb-sunset" : "border-white/20",
                            )}
                          >
                            {active && <span className="size-1.5 rounded-full bg-hb-night" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {error === "topic" && (
                    <p className="mt-4 text-sm text-hb-rescue" role="alert">
                      {t("pickTopic")}
                    </p>
                  )}
                </>
              )}

              {step === 1 && topic && (
                <div className="space-y-8">
                  <p className="font-display text-2xl font-medium tracking-[0.04em] text-white uppercase">
                    {topic.title[locale]}
                  </p>
                  {topic.urgent && (
                    <div className="flex flex-col gap-4 border border-hb-rescue/40 bg-hb-rescue/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{t("urgentTitle")}</p>
                        <p className="mt-1 text-sm text-white/70">{t("urgentBody")}</p>
                      </div>
                      <a
                        href={site.phoneHref}
                        onClick={() => track("cta_call", { from: `${from}_${topic.key}` })}
                        className="tabular inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-hb-rescue px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:self-auto"
                      >
                        <Phone className="size-4" aria-hidden /> {site.phone}
                      </a>
                    </div>
                  )}
                  {topic.choices.map((c) => (
                    <div key={c.key} role="radiogroup" aria-label={c.label[locale]}>
                      <p className="text-sm font-semibold tracking-[0.15em] text-white/50 uppercase">
                        {c.label[locale]}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.options.map((o) => {
                          const val = o[locale];
                          const active = v.picks[c.key] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => patch({ picks: { ...v.picks, [c.key]: active ? "" : val } })}
                              className={chip(active)}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {aircraftChoices.length > 0 && (
                    <div role="radiogroup" aria-label={t("aircraft")}>
                      <p className="text-sm font-semibold tracking-[0.15em] text-white/50 uppercase">
                        {t("aircraft")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {aircraftChoices.map((m) => (
                          <button
                            key={m}
                            type="button"
                            role="radio"
                            aria-checked={v.aircraft === m}
                            onClick={() => patch({ aircraft: v.aircraft === m ? "" : m })}
                            className={chip(v.aircraft === m)}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={cn("grid gap-4", topic.pax ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-2")}>
                    <label className="block">
                      <span className="text-sm text-white/60">{topic.place[locale]}</span>
                      <input
                        className={cn(field, "mt-2")}
                        value={v.place}
                        onChange={(e) => patch({ place: e.target.value })}
                      />
                    </label>
                    {topic.pax ? (
                      <div>
                        <span className="text-sm text-white/60" id="planner-pax">
                          {t("pax")}
                        </span>
                        <div
                          className="mt-2 flex items-center gap-4 rounded-xl border border-white/15 px-3 py-2"
                          role="group"
                          aria-labelledby="planner-pax"
                        >
                          <button
                            type="button"
                            onClick={() => patch({ pax: Math.max(1, v.pax - 1) })}
                            disabled={v.pax <= 1}
                            className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-hb-sunset disabled:opacity-30"
                            aria-label="−1"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <output
                            aria-live="polite"
                            className="tabular w-6 text-center text-lg font-semibold text-white"
                          >
                            {v.pax}
                          </output>
                          <button
                            type="button"
                            onClick={() => patch({ pax: Math.min(MAX_PAX, v.pax + 1) })}
                            disabled={v.pax >= MAX_PAX}
                            className="grid size-9 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-hb-sunset disabled:opacity-30"
                            aria-label="+1"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                    <label className={cn("block", topic.pax && "sm:col-span-2")}>
                      <span className="text-sm text-white/60">{topic.date[locale]}</span>
                      <input
                        type="date"
                        min={today}
                        className={cn(field, "mt-2")}
                        value={v.date}
                        onChange={(e) => patch({ date: e.target.value })}
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <label className="block">
                    <span className="text-sm text-white/60">{t("fName")}</span>
                    <input
                      ref={nameRef}
                      id="planner-name"
                      autoComplete="name"
                      className={cn(field, "mt-2")}
                      value={v.name}
                      aria-invalid={error === "name" || undefined}
                      aria-describedby={error === "name" ? "planner-name-err" : undefined}
                      onChange={(e) => patch({ name: e.target.value })}
                    />
                    {error === "name" && (
                      <span id="planner-name-err" className="mt-2 block text-sm text-hb-rescue">
                        {t("needName")}
                      </span>
                    )}
                  </label>
                  <label className="block">
                    <span className="text-sm text-white/60">{t("fCompany")}</span>
                    <input
                      autoComplete="organization"
                      className={cn(field, "mt-2")}
                      value={v.company}
                      onChange={(e) => patch({ company: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-white/60">{t("fMessage")}</span>
                    <textarea
                      rows={4}
                      className={cn(field, "mt-2 resize-y")}
                      value={v.message}
                      onChange={(e) => patch({ message: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="font-display text-3xl font-medium tracking-[0.04em] text-white uppercase sm:text-4xl">
                    {t("reviewTitle")}
                  </p>
                  <p className="mt-4 max-w-xl text-white/65">{t("reviewBody")}</p>
                  <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
                    {message
                      .split("\n")
                      .filter((l) => l.startsWith("*"))
                      .map((l) => {
                        const m = /^\*(.+?):\*\s?(.*)$/.exec(l)!;
                        return (
                          <div key={m[1]} className="grid grid-cols-[minmax(0,9rem)_1fr] gap-4 py-3 text-sm">
                            <dt className="text-white/45">{m[1]}</dt>
                            <dd className="break-words text-white">{m[2]}</dd>
                          </div>
                        );
                      })}
                  </dl>
                  <button
                    type="submit"
                    className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full px-7 py-4 text-base font-semibold text-[#06351b] shadow-[0_18px_40px_-14px_rgba(37,211,102,0.9)] transition-transform hover:-translate-y-0.5 sm:w-auto"
                    style={{ background: WA_GREEN }}
                  >
                    <WaGlyph className="size-5" />
                    {t("send")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}
            </motion.fieldset>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => go(step - 1)}
            className={cn(
              "inline-flex items-center gap-2 px-1 py-3 text-sm font-semibold text-white/60 transition-colors hover:text-white",
              step === 0 && "invisible",
            )}
          >
            <ArrowLeft className="size-4" /> {t("back")}
          </button>
          {step < STEPS - 1 && (
            <button
              type="submit"
              className="group inline-flex min-w-48 items-center justify-center gap-2 bg-hb-blue px-8 py-4 text-sm font-semibold tracking-[0.15em] text-white uppercase transition-colors hover:bg-hb-blue-deep"
            >
              {t("next")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </form>

      {/* ── Phone with the live chat ── */}
      <div
        className={cn("lg:sticky lg:top-28 lg:block lg:self-start", step === STEPS - 1 ? "block" : "hidden")}
      >
        <div className="mx-auto w-full max-w-[380px] rounded-[48px] border border-white/10 bg-[#0b0d10] p-3 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="relative flex h-[600px] flex-col overflow-hidden rounded-[38px] bg-[#0b141a]">
            <span
              aria-hidden
              className="absolute top-2.5 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-black"
            />
            {/* Chat header */}
            <div className="flex items-center gap-3 bg-[#1f2c34] px-4 pt-12 pb-3 text-white">
              <ChevronLeft className="size-5 text-white/70" aria-hidden />
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white">
                <Emblem className="h-6 w-auto text-hb-blue" />
              </span>
              <div className="min-w-0">
                <p className="truncate leading-tight font-semibold">Helibol</p>
                <p className="truncate text-xs text-white/60">{t("chatStatus")}</p>
              </div>
              <MoreVertical className="ml-auto size-5 text-white/60" aria-hidden />
            </div>
            {/* Messages */}
            <div
              ref={chatRef}
              data-lenis-prevent
              className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <p className="mx-auto w-fit rounded-md bg-[#1f2c34] px-3 py-1 text-[11px] tracking-wider text-white/60">
                {t("today")}
              </p>
              <div className="relative mr-8 rounded-xl rounded-tl-sm bg-[#1f2c34] px-3.5 pt-2.5 pb-1.5 text-[14px] leading-snug text-[#e9edef]">
                {t("greeting")}
                <span suppressHydrationWarning className="mt-1 block text-right text-[10px] text-white/45">
                  {time}
                </span>
              </div>
              <motion.div
                layout={!reduced}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="relative ml-8 rounded-xl rounded-tr-sm bg-[#005c4b] px-3.5 pt-2.5 pb-1.5 text-[14px] leading-snug text-[#e9edef]"
              >
                <div aria-live="polite" className="break-words">
                  {message.split("\n").map((line, i) => (
                    <p key={`${i}-${line.slice(0, 12)}`} className={cn(!line && "h-2.5")}>
                      <Formatted line={line} />
                    </p>
                  ))}
                </div>
                <span
                  suppressHydrationWarning
                  className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/55"
                >
                  {time}
                  <CheckCheck className="size-3.5 text-[#53bdeb]" aria-hidden />
                </span>
              </motion.div>
              <AnimatePresence>
                {ready && step === STEPS - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-fit rounded-xl rounded-tl-sm bg-[#1f2c34] px-3.5 py-2 text-[12px] text-white/60 italic"
                  >
                    Helibol {t("typing")}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Input bar */}
            <div className="flex items-center gap-2 bg-[#0b141a] px-3 pt-2 pb-5">
              <span className="flex-1 truncate rounded-full bg-[#1f2c34] px-4 py-3 text-sm text-white/40">
                {t("inputPlaceholder")}
              </span>
              <button
                type="button"
                onClick={send}
                aria-label={t("send")}
                aria-disabled={!ready}
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full text-[#06351b] transition-all",
                  ready ? "hover:scale-105" : "opacity-50",
                )}
                style={{ background: WA_GREEN }}
              >
                <SendHorizontal className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
