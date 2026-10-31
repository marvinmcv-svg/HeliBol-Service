import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { HELI_SYSTEM_PROMPT } from "@/lib/heli/system-prompt";
import { HELI_KNOWLEDGE } from "@/lib/heli/knowledge";
import { heliTools, runHeliTool, type HeliUiEvent } from "@/lib/heli/tools";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TURNS = 30; // plan §8: max 30 user turns per conversation
const MAX_TOOL_ROUNDS = 4;

const BodySchema = z.object({
  conversationId: z.uuid(),
  locale: z.enum(["es", "en"]),
  topic: z.string().max(40).optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(MAX_TURNS * 2 + 1),
  leadCaptured: z.boolean().optional(),
});

/** Stream protocol to the client: newline-delimited JSON. */
export type HeliStreamEvent =
  | { type: "text"; text: string }
  | HeliUiEvent
  | { type: "error"; code: "rate_limited" | "limit" | "bad_request" | "unavailable" | "refused" }
  | { type: "done" };

// Byte-stable system blocks → the cache breakpoint on the last block caches tools + system.
const system: Anthropic.Beta.BetaTextBlockParam[] = [
  { type: "text", text: HELI_SYSTEM_PROMPT },
  { type: "text", text: HELI_KNOWLEDGE, cache_control: { type: "ephemeral" } },
];

/**
 * Haiku 5.5 handles reception chat; complex quote reasoning (multi-leg, long campaigns,
 * heavy cargo) escalates to Sonnet 5.5 (plan §2).
 */
function pickModel(messages: { role: string; content: string }[]) {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();
  const complex =
    /(campañ|campaign|sísmic|sismic|seismic|perforaci|drill|meses|months|semanas|weeks|toneladas|tons|long-?line|multi|varios destinos|several (stops|sites)|contrato|contract|licitaci|tender)/.test(
      userText,
    ) && messages.length >= 4;
  return complex ? ("claude-sonnet-5-5" as const) : ("claude-haiku-5-5" as const);
}

const client = new Anthropic();

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ type: "error", code: "unavailable" }, { status: 503 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return Response.json({ type: "error", code: "bad_request" }, { status: 400 });
  }
  if (body.messages.at(-1)?.role !== "user") {
    return Response.json({ type: "error", code: "bad_request" }, { status: 400 });
  }
  if (body.messages.filter((m) => m.role === "user").length > MAX_TURNS) {
    return Response.json({ type: "error", code: "limit" }, { status: 429 });
  }
  if (!(await rateLimit(`heli:${clientIp(req)}`))) {
    return Response.json({ type: "error", code: "rate_limited" }, { status: 429 });
  }

  // Context from the CTA that opened Heli ("Hablar con Heli" on the scenic page, etc.) and the
  // page locale go in a mid-conversation system message, after the cached prefix.
  const context = `Site locale: ${body.locale}.${body.topic ? ` The user opened the chat from a "${body.topic}" call-to-action.` : ""}${body.leadCaptured ? " A lead has already been captured in this conversation; do not call capture_lead again." : ""}`;
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...body.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: "system", content: context },
  ];

  const model = pickModel(body.messages);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (e: HeliStreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      let assistantText = "";
      let leadReference: string | undefined;
      let leadCaptured = Boolean(body.leadCaptured);

      try {
        for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
          const s = client.beta.messages.stream(
            {
              model,
              max_tokens: 1024,
              system,
              tools: heliTools,
              tool_choice: { type: "auto" },
              messages,
              output_config: { effort: model === "claude-haiku-5-5" ? "low" : "medium" },
              // Sonnet 5.5: on a safety decline, the API re-runs the request on a fallback model.
              ...(model === "claude-sonnet-5-5"
                ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
                : {}),
            },
            { signal: req.signal },
          );
          s.on("text", (delta) => {
            assistantText += delta;
            send({ type: "text", text: delta });
          });

          const message = await s.finalMessage();

          if (message.stop_reason === "refusal") {
            send({ type: "error", code: "refused" });
            break;
          }
          const toolUses = message.content.filter(
            (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use",
          );
          if (toolUses.length === 0 || message.stop_reason !== "tool_use") break;

          messages.push({ role: "assistant", content: message.content });
          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const tu of toolUses) {
            const r = await runHeliTool(tu.name, tu.input, {
              conversationId: body.conversationId,
              leadCaptured,
              emit: (e) => {
                if (e.type === "lead") leadReference = e.reference;
                send(e);
              },
            });
            if (r.leadCaptured) leadCaptured = true;
            results.push({
              type: "tool_result",
              tool_use_id: tu.id,
              content: r.content,
              is_error: r.isError,
            });
          }
          messages.push({ role: "user", content: results });
          if (assistantText && !/\s$/.test(assistantText)) {
            assistantText += "\n\n";
            send({ type: "text", text: "\n\n" });
          }
        }
        send({ type: "done" });
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) console.warn("[heli] anthropic rate limited");
        else if (err instanceof Anthropic.APIError)
          console.error(`[heli] API error ${err.status}`, err.message);
        else if (!req.signal.aborted) console.error("[heli] stream failed", err);
        if (!req.signal.aborted) send({ type: "error", code: "unavailable" });
      } finally {
        controller.close();
        await logConversation(body, assistantText, model, leadReference);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Transcript → heli_conversations (90-day retention, see privacy policy). Never throws. */
async function logConversation(
  body: z.infer<typeof BodySchema>,
  reply: string,
  model: string,
  leadReference?: string,
) {
  const db = supabaseAdmin();
  if (!db) return;
  const transcript = [...body.messages, ...(reply ? [{ role: "assistant", content: reply }] : [])];
  const { error } = await db.from("heli_conversations").upsert(
    {
      id: body.conversationId,
      locale: body.locale,
      topic: body.topic ?? null,
      model,
      messages: transcript,
      turns: transcript.filter((m) => m.role === "user").length,
      ...(leadReference ? { lead_reference: leadReference } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) console.error("[supabase] heli_conversations upsert failed", error);
}
