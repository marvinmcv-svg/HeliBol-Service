"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import type { z } from "zod";
import { ContactSchema } from "@/lib/schemas";
import { submitContact } from "@/lib/actions/forms";
import { Input, Textarea, Honeypot } from "./fields";
import { Button } from "@/components/ui/Button";

type In = z.input<typeof ContactSchema>;
type Out = z.output<typeof ContactSchema>;

export function ContactForm() {
  const tf = useTranslations("form");
  const locale = useLocale() as "es" | "en";
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");
  const { register, handleSubmit, formState } = useForm<In, unknown, Out>({
    resolver: zodResolver(ContactSchema),
    mode: "onTouched",
    defaultValues: { language: locale, name: "", email: "", phone: "", message: "" },
  });
  const e = formState.errors;
  const err = (m?: string) =>
    m
      ? m === "contactRequired"
        ? tf("contactRequired")
        : m.includes("email")
          ? tf("invalidEmail")
          : tf("required")
      : undefined;

  const onSubmit = handleSubmit(async (data) => {
    const res = await submitContact(data);
    setState(res.ok ? "ok" : "error");
  });

  if (state === "ok") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        className="flex items-start gap-4 rounded-[24px] bg-hb-sky p-8"
      >
        <CheckCircle2 className="size-7 shrink-0 text-hb-blue" aria-hidden />
        <p className="text-lg">{tf("success")}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <Honeypot {...register("website")} />
      <input type="hidden" {...register("language")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label={tf("name")} autoComplete="name" {...register("name")} error={err(e.name?.message)} />
        <Input label={tf("company")} autoComplete="organization" {...register("company")} />
        <Input
          type="email"
          label={tf("email")}
          autoComplete="email"
          {...register("email")}
          error={err(e.email?.message)}
        />
        <Input type="tel" label={tf("phone")} autoComplete="tel" {...register("phone")} />
      </div>
      <Textarea label={tf("message")} {...register("message")} error={err(e.message?.message)} />
      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" className="mt-0.5 size-4 accent-hb-blue" {...register("consent")} />
        <span>{tf("consent")}</span>
      </label>
      {e.consent && <p className="text-sm text-hb-rescue">{tf("required")}</p>}
      {state === "error" && (
        <p role="alert" className="rounded-2xl bg-hb-rescue/10 p-4 text-sm">
          {tf("error")}
        </p>
      )}
      <Button type="submit" disabled={formState.isSubmitting} magnetic={false}>
        {formState.isSubmitting ? tf("sending") : tf("send")}
      </Button>
    </form>
  );
}
