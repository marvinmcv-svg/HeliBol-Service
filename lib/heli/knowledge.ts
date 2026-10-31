import { services } from "@/content/services";
import { fleet, formatSpec } from "@/content/fleet";
import { operations } from "@/content/operations";
import { site } from "@/content/site";

/**
 * Knowledge base injected as a cached system block (plan §8). Built from content/*.ts — the
 * single source of truth — so Heli and the site never disagree. Deterministic output (no dates)
 * keeps the prompt cache warm.
 */
function build() {
  const lines: string[] = ["# HELIBOL KNOWLEDGE BASE (authoritative; do not go beyond it)", ""];
  lines.push("## Services");
  for (const s of services) {
    lines.push(`### ${s.title.en} / ${s.title.es} (slug: ${s.slug})`);
    lines.push(`EN: ${s.promise.en} ${s.challenge.en}`);
    lines.push(`ES: ${s.promise.es}`);
    lines.push(`Capabilities: ${s.capabilities.en.join("; ")}`);
    lines.push(`Recommended aircraft: ${s.aircraft.join(", ")}`);
    for (const f of s.faqs) lines.push(`Q: ${f.q.en} A: ${f.a.en}`);
    lines.push("");
  }
  lines.push(
    "## Fleet (reference figures; real capacity depends on altitude/temperature/config — a specialist confirms)",
  );
  for (const a of fleet) {
    lines.push(`### ${a.model} (${a.variants}) — "${a.nickname.en}" (slug: ${a.slug})`);
    lines.push(a.summary.en);
    lines.push(`Best for: ${a.bestFor.en.join(", ")}`);
    lines.push(
      `Specs: ${a.specs.map((sp) => `${sp.label.en}: ${formatSpec(sp, "metric", "en")}`).join("; ")}`,
    );
    lines.push("");
  }
  lines.push("## Recent operations (public track record)");
  for (const o of operations)
    lines.push(`- ${o.year}: ${o.name} (${o.region}, Bolivia) — ${o.description.en}`);
  lines.push("");
  lines.push("## Scenic flights");
  lines.push(
    "Offered on request (no published prices). Occasions: birthdays, anniversaries, proposals, corporate, photography. Weight per passenger is asked at booking; children fly with an adult; wear comfortable clothes and closed shoes; flights are rescheduled if weather is unsuitable; gift flights can be arranged.",
  );
  lines.push("");
  lines.push("## Turnkey projects");
  lines.push(
    "Helibol helps clients source, inspect and import their own aircraft through its international network.",
  );
  lines.push("");
  lines.push("## Contact");
  lines.push(
    `Address: ${site.address.street}, ${site.address.city}, ${site.address.country}. Phone/24-7 emergencies: ${site.phone}. Email: ${site.email}. Replies within one business day.`,
  );
  lines.push(
    `Bolivian emergency numbers: ${site.emergencyNumbers.map((n) => `${n.label.en} ${n.number}`).join(", ")}.`,
  );
  return lines.join("\n");
}

export const HELI_KNOWLEDGE = build();
