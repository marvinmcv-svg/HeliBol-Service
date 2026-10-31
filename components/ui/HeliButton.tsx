"use client";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { useHeli, type HeliTopic } from "@/lib/heli-store";

export function HeliButton({
  topic,
  variant = "ghost",
  label,
}: {
  topic?: HeliTopic;
  variant?: "ghost" | "ghost-dark" | "light" | "primary";
  label?: string;
}) {
  const t = useTranslations("common");
  const openHeli = useHeli((s) => s.openHeli);
  return (
    <Button variant={variant} onClick={() => openHeli({ topic })}>
      {label ?? t("talkToHeli")} <ArrowRight className="size-4" aria-hidden />
    </Button>
  );
}
