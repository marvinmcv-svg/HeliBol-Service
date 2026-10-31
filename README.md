# helibol.com

Bilingual (ES/EN) marketing site for **HELIBOL S.R.L.**, the helicopter operator flying from Hangar 22, El Trompillo, Santa Cruz de la Sierra since 1988. It includes **Heli**, an AI receptionist built on the Claude API.

Built from [`HELIBOL_WEBSITE_PLAN.md`](./HELIBOL_WEBSITE_PLAN.md). Facts still waiting on the client, plus known gaps, are in [`TODO.md`](./TODO.md).

## Stack

Next.js 15 (App Router, TypeScript strict) · React 19 · Tailwind CSS v4 · next-intl (`/es` default, `/en`) · Lenis + GSAP (ScrollTrigger, SplitText, DrawSVG, ScrambleText) · Motion · React Three Fiber (rotor-wash particles, desktop only) · react-hook-form + zod + server actions · Supabase · Resend · Anthropic SDK (Heli) · Vercel.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in what you have; everything degrades gracefully
pnpm dev                     # http://localhost:3000 → /es
```

Without env vars the site still works: form submissions return a reference but skip the DB and email, and Heli returns "unavailable".

| Script                               | What it does                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start`       | Next.js                                                                                                                                  |
| `pnpm lint` / `typecheck` / `format` | ESLint, `tsc`, Prettier                                                                                                                  |
| `pnpm test:e2e`                      | Playwright smoke tests (every route in both locales, redirects, quote flow, Heli, reduced motion)                                        |
| `./scripts/download-media.sh`        | Pull the curated originals (plan §5) from Google Drive into `media-src/` (gitignored)                                                    |
| `pnpm media`                         | Optimise them into `public/media/` (sharp + ffmpeg): image masters, blur placeholders, the Bell 412 cut-out, H.264/VP9 loops and posters |

## Where things live

```
app/[locale]/(site)/…        pages (home, servicios, flota, operaciones, vuelos-panoramicos, nosotros, cotizar, contacto)
app/[locale]/(legal)/…       privacidad, terminos
app/[locale]/dev/motion      motion-primitives playground (noindex)
app/api/heli/route.ts        Heli: streaming tool-use loop (claude-haiku-5-5, escalates to claude-sonnet-5-5)
content/{es,en}/messages.json  ALL UI copy
content/*.ts                 services, fleet, operations, socials, site facts: the single source of truth (Heli reads these too)
components/motion/*          SmoothScroll, Reveal, SplitHeading, Magnetic, TiltCard, Marquee, CountUp, RevealImage, Eyebrow, Cursor, PageTransition
components/heli/*            launcher, panel, messages, quick replies, lead card
lib/heli/*                   system prompt (plan §8, verbatim), knowledge base, tools
supabase/migrations/         schema (RLS on, server-only writes)
```

## Heli

- `POST /api/heli` streams NDJSON events (`text`, `lead`, `handoff`, `error`, `done`).
- Tools: `capture_lead` (zod-validated → Supabase `leads` + Resend), `get_service_info`, `get_aircraft_specs`, `handoff_to_human` (`urgency: "emergency"` shows the red call button).
- The system prompt and knowledge base are cached (`cache_control`); per-request context goes in a mid-conversation system message, so the cache prefix stays stable.
- Guardrails: no prices or availability promises, no flight-safety/weather/medical advice, emergency numbers first, consent before taking contact details. Limits are 20 messages per 10 min per IP and 30 turns per conversation. Transcripts go to `heli_conversations` (90-day retention).

## Accessibility & motion

Everything respects `prefers-reduced-motion`: Lenis is off, there's no pinning, scrubbing or WebGL, and all content is visible. The Heli panel is a focus-trapped `role="dialog"` with an `aria-live` message list.
