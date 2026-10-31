import "server-only";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "./supabase";
import { site } from "@/content/site";

export { serviceTypes, LeadSchema, QuoteSchema, ContactSchema } from "./schemas";
export type { Lead, Quote, Contact } from "./schemas";
import type { Lead, Quote } from "./schemas";

export const newReference = () => `HB-${randomBytes(3).toString("hex").toUpperCase()}`;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const table = (rows: Record<string, unknown>) =>
  `<table cellpadding="6" style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">${Object.entries(
    rows,
  )
    .filter(([, v]) => v !== undefined && v !== "" && v !== null)
    .map(
      ([k, v]) =>
        `<tr><td style="color:#475569;border-bottom:1px solid #E2E8F0">${esc(k)}</td><td style="border-bottom:1px solid #E2E8F0"><b>${esc(String(v))}</b></td></tr>`,
    )
    .join("")}</table>`;

/** Notify info@helibol.com and auto-reply to the client (plan §2 Email). Never throws. */
async function sendEmails(opts: {
  subject: string;
  reference: string;
  rows: Record<string, unknown>;
  replyTo?: string;
  language: "es" | "en";
  name: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    console.warn("[resend] RESEND_API_KEY / RESEND_FROM not set — emails skipped", opts.reference);
    return;
  }
  const resend = new Resend(key);
  const inbox = process.env.LEAD_INBOX || site.email;
  try {
    await resend.emails.send({
      from,
      to: inbox,
      replyTo: opts.replyTo,
      subject: `${opts.subject} · ${opts.reference}`,
      html: `<h2 style="font-family:system-ui">${esc(opts.subject)} — ${opts.reference}</h2>${table(opts.rows)}`,
    });
    if (opts.replyTo) {
      const es = opts.language === "es";
      await resend.emails.send({
        from,
        to: opts.replyTo,
        replyTo: inbox,
        subject: es
          ? `Recibimos su solicitud · ${opts.reference}`
          : `We received your request · ${opts.reference}`,
        html: `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#0F172A">
<p>${es ? "Hola" : "Hi"} ${esc(opts.name)},</p>
<p>${es ? "Gracias por escribir a Helibol. Un especialista le contactará en menos de 24 horas hábiles." : "Thank you for contacting Helibol. A specialist will contact you within one business day."}</p>
<p>${es ? "Su referencia es" : "Your reference is"} <b>${opts.reference}</b>.</p>
<p>${es ? "Emergencias 24/7" : "24/7 emergencies"}: <a href="${site.phoneHref}">${site.phone}</a></p>
<p style="color:#475569">HELIBOL S.R.L. · Hangar 22, Aeropuerto El Trompillo · Santa Cruz de la Sierra, Bolivia</p></div>`,
      });
    }
  } catch (e) {
    console.error("[resend] send failed", opts.reference, e);
  }
}

export async function saveLead(lead: Lead, source: "heli" | "contact", conversationId?: string) {
  const reference = newReference();
  const db = supabaseAdmin();
  if (db) {
    const { error } = await db
      .from("leads")
      .insert({ reference, source, conversation_id: conversationId ?? null, ...lead });
    if (error) console.error("[supabase] leads insert failed", error);
  }
  await sendEmails({
    subject: source === "heli" ? "Nuevo lead (Heli)" : "Nuevo mensaje de contacto",
    reference,
    rows: {
      Nombre: lead.name,
      Empresa: lead.company,
      Email: lead.email,
      Teléfono: lead.phone,
      Servicio: lead.service,
      Fecha: lead.date,
      Ruta: lead.route,
      "Pax / carga": lead.pax_or_cargo,
      Idioma: lead.language,
      Notas: lead.notes,
    },
    replyTo: lead.email,
    language: lead.language,
    name: lead.name,
  });
  return reference;
}

export async function saveQuote(q: Quote) {
  const reference = newReference();
  const db = supabaseAdmin();
  const row = {
    reference,
    mission_type: q.type,
    date_start: q.dateStart,
    date_end: q.dateEnd || null,
    flexibility: q.flexibility,
    origin: q.origin,
    destination: q.destination || null,
    pax: q.pax ?? null,
    cargo_kg: q.cargoKg ?? null,
    notes: q.notes || null,
    name: q.name,
    company: q.company || null,
    email: q.email || null,
    phone: q.phone || null,
    language: q.language,
  };
  if (db) {
    const { error } = await db.from("quote_requests").insert(row);
    if (error) {
      console.error("[supabase] quote insert failed", error);
      throw new Error("db");
    }
  }
  await sendEmails({
    subject: "Nueva solicitud de cotización",
    reference,
    rows: {
      Misión: q.type,
      Desde: q.dateStart,
      Hasta: q.dateEnd,
      Flexibilidad: q.flexibility,
      Origen: q.origin,
      Destino: q.destination,
      Pasajeros: q.pax,
      "Carga (kg)": q.cargoKg,
      Nombre: q.name,
      Empresa: q.company,
      Email: q.email,
      Teléfono: q.phone,
      Idioma: q.language,
      Notas: q.notes,
    },
    replyTo: q.email || undefined,
    language: q.language,
    name: q.name,
  });
  return reference;
}
