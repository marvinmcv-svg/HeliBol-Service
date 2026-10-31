"use client";
import { siWhatsapp } from "simple-icons";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { whatsappHref } from "@/content/site";

/** Renders nothing until the WhatsApp Business number is configured (no dead links). */
export function WhatsAppButton({
  variant = "ghost",
  text,
}: {
  variant?: "ghost" | "ghost-dark" | "light";
  text?: string;
}) {
  const t = useTranslations("common");
  const href = whatsappHref(text);
  if (!href) return null;
  return (
    <Button href={href} external variant={variant} event="cta_whatsapp">
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d={siWhatsapp.path} />
      </svg>
      {t("whatsapp")}
    </Button>
  );
}
