import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getService, services } from "@/content/services";
import { fleet, formatSpec, getAircraft } from "@/content/fleet";
import { site, whatsappHref } from "@/content/site";
import { LeadSchema, saveLead, serviceTypes } from "@/lib/leads";

/** Tool definitions (plan §8). Inputs are validated with zod before anything runs. */
export const heliTools: Anthropic.Beta.BetaTool[] = [
  {
    name: "capture_lead",
    description:
      "Save the user's contact details and mission so a Helibol specialist follows up within one business day. Only call AFTER the user has consented and given a name plus a phone/WhatsApp or email. Returns a reference code to share with the user.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        phone: { type: "string", description: "Phone or WhatsApp, as given" },
        email: { type: "string" },
        company: { type: "string" },
        service: { type: "string", enum: [...serviceTypes] },
        date: { type: "string", description: "Requested date(s), free text" },
        route: { type: "string", description: "Origin → destination or operating area" },
        pax_or_cargo: { type: "string", description: "Passengers or cargo weight" },
        language: { type: "string", enum: ["es", "en"] },
        notes: { type: "string", description: "Short summary of the mission" },
      },
      required: ["name", "service", "language", "notes"],
    },
  },
  {
    name: "get_service_info",
    description: `Get authoritative details for a Helibol service. Slugs: ${services.map((s) => s.slug).join(", ")}.`,
    input_schema: {
      type: "object",
      properties: { slug: { type: "string", enum: services.map((s) => s.slug) } },
      required: ["slug"],
    },
  },
  {
    name: "get_aircraft_specs",
    description: `Get reference specs for an aircraft in the Helibol fleet. Models: ${fleet.map((a) => a.slug).join(", ")}.`,
    input_schema: {
      type: "object",
      properties: { model: { type: "string", enum: fleet.map((a) => a.slug) } },
      required: ["model"],
    },
  },
  {
    name: "handoff_to_human",
    description:
      'Offer the user a direct line to a person (WhatsApp / phone). Use urgency "emergency" for any active, life-threatening situation — the UI will show a red call button.',
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string" },
        urgency: { type: "string", enum: ["normal", "emergency"] },
      },
      required: ["reason", "urgency"],
    },
  },
];

const ServiceInput = z.object({ slug: z.string() });
const AircraftInput = z.object({ model: z.string() });
const HandoffInput = z.object({ reason: z.string().max(500), urgency: z.enum(["normal", "emergency"]) });

/** Side-channel events the route streams to the UI alongside text. */
export type HeliUiEvent =
  | { type: "lead"; reference: string }
  | { type: "handoff"; urgency: "normal" | "emergency"; phone: string; phoneHref: string; whatsapp: string };

export async function runHeliTool(
  name: string,
  input: unknown,
  ctx: { conversationId: string; emit: (e: HeliUiEvent) => void; leadCaptured: boolean },
): Promise<{ content: string; isError?: boolean; leadCaptured?: boolean }> {
  switch (name) {
    case "capture_lead": {
      if (ctx.leadCaptured)
        return {
          content: JSON.stringify({ ok: false, error: "A lead was already captured in this conversation." }),
          isError: true,
        };
      // Drop empty strings the model may send for optional fields.
      const clean = Object.fromEntries(
        Object.entries((input ?? {}) as Record<string, unknown>).filter(([, v]) => v !== "" && v != null),
      );
      const parsed = LeadSchema.safeParse(clean);
      if (!parsed.success)
        return {
          content: JSON.stringify({ ok: false, error: z.prettifyError(parsed.error) }),
          isError: true,
        };
      const reference = await saveLead(parsed.data, "heli", ctx.conversationId);
      ctx.emit({ type: "lead", reference });
      return { content: JSON.stringify({ ok: true, reference }), leadCaptured: true };
    }
    case "get_service_info": {
      const p = ServiceInput.safeParse(input);
      const s = p.success ? getService(p.data.slug) : undefined;
      if (!s) return { content: JSON.stringify({ error: "unknown service" }), isError: true };
      return {
        content: JSON.stringify({
          title: s.title,
          promise: s.promise,
          capabilities: s.capabilities,
          aircraft: s.aircraft,
          faqs: s.faqs,
          url: `${site.url}/es/servicios/${s.slug}`,
        }),
      };
    }
    case "get_aircraft_specs": {
      const p = AircraftInput.safeParse(input);
      const a = p.success ? getAircraft(p.data.model) : undefined;
      if (!a) return { content: JSON.stringify({ error: "unknown aircraft" }), isError: true };
      return {
        content: JSON.stringify({
          model: `${a.model} (${a.variants})`,
          nickname: a.nickname,
          summary: a.summary,
          bestFor: a.bestFor,
          specs: a.specs.map((sp) => ({ [sp.label.en]: formatSpec(sp, "metric", "en") })),
          note: "Reference figures; a specialist confirms real capacity for the mission.",
        }),
      };
    }
    case "handoff_to_human": {
      const p = HandoffInput.safeParse(input);
      if (!p.success) return { content: JSON.stringify({ error: "invalid input" }), isError: true };
      const wa = whatsappHref();
      ctx.emit({
        type: "handoff",
        urgency: p.data.urgency,
        phone: site.phone,
        phoneHref: site.phoneHref,
        whatsapp: wa,
      });
      return {
        content: JSON.stringify({
          ok: true,
          phone: site.phone,
          whatsapp: wa || "not available",
          email: site.email,
          shown_to_user: true,
        }),
      };
    }
    default:
      return { content: JSON.stringify({ error: `unknown tool ${name}` }), isError: true };
  }
}
