"use client";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function LeadCard({ reference }: { reference: string }) {
  const t = useTranslations("heli");
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-100">
      <CheckCircle2 className="size-4 shrink-0" aria-hidden />
      <span className="tabular">{t("leadSaved", { reference })}</span>
    </div>
  );
}
