"use server";
import { headers } from "next/headers";
import { ContactSchema, QuoteSchema, saveLead, saveQuote } from "@/lib/leads";
import { rateLimit } from "@/lib/rate-limit";

export type ActionResult =
  { ok: true; reference: string } | { ok: false; error: "invalid" | "rate_limited" | "server" };

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
}

/** Multi-step quote (plan §7 Cotizar): Supabase quote_requests + Resend notification/auto-reply. */
export async function submitQuote(input: unknown): Promise<ActionResult> {
  const parsed = QuoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  if (parsed.data.website) return { ok: true, reference: "HB-000000" }; // honeypot: pretend success
  if (!(await rateLimit(`quote:${await ip()}`, 5))) return { ok: false, error: "rate_limited" };
  try {
    return { ok: true, reference: await saveQuote(parsed.data) };
  } catch {
    return { ok: false, error: "server" };
  }
}

export async function submitContact(input: unknown): Promise<ActionResult> {
  const parsed = ContactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const c = parsed.data;
  if (c.website) return { ok: true, reference: "HB-000000" };
  if (!(await rateLimit(`contact:${await ip()}`, 5))) return { ok: false, error: "rate_limited" };
  try {
    const reference = await saveLead(
      {
        name: c.name,
        company: c.company || undefined,
        email: c.email || undefined,
        phone: c.phone || undefined,
        service: "other",
        language: c.language,
        notes: c.message,
      },
      "contact",
    );
    return { ok: true, reference };
  } catch {
    return { ok: false, error: "server" };
  }
}
