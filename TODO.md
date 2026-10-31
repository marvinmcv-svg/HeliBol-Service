# TODO — before launch

Facts to confirm with Helibol (plan §12). **These block launch.** Each one points to the single place it lives in code.

| #   | Item                                                                                                                           | Where it lives                                                                                   | Status                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 1   | "Desde 1988 / 38 años" used everywhere. Confirm.                                                                               | `content/site.ts` (`founded`; years are computed)                                                | ⏳ confirm                                                       |
| 2   | HAI Robert E. Trimble award — year + proof/image.                                                                              | **Not shown anywhere yet.** Add to Nosotros certifications + home trust band only once verified. | ⏳ verify or drop                                                |
| 3   | IOGP/OGP wording; any certificates (IS-BAO, ISO 9001/45001, DGAC Bolivia AOC number)?                                          | `content/{es,en}/messages.json` → `aboutPage.certs`, `home.safety.pillars[0]`, `home.marquee`    | ⏳                                                               |
| 4   | Fleet count per type and registrations (CP-2562, CP-2935, CP-3066 seen in photos). Is the Bell 412 VIP interior still offered? | `content/fleet.ts`, `content/services.ts` (vip-y-turismo)                                        | ⏳                                                               |
| 5   | Official spec sheets (412 MTOW duplicated the 212's; 212 payload said both 1,100 and 1,200 kg on the old site).                | `content/fleet.ts` (all figures are "reference")                                                 | ⏳                                                               |
| 6   | WhatsApp Business number; exact Facebook and LinkedIn URLs; YouTube/TikTok if they exist.                                      | `NEXT_PUBLIC_HELIBOL_WHATSAPP` env; `content/socials.ts`                                         | ✅ WhatsApp set to +591 77165787 (env can override) · ⏳ socials |
| 7   | Scenic flights: offered to the public? From where? Minimum party size?                                                         | `content/{es,en}/messages.json` → `scenicPage`                                                   | ⏳ copy assumes "on request"                                     |
| 8   | Hoist capability for SAR (yes/no).                                                                                             | Currently **not claimed** — `content/services.ts` lists "rescue team insertion" only.            | ⏳                                                               |
| 9   | Real testimonials + client logos with written permission.                                                                      | `content/testimonials.ts` + `NEXT_PUBLIC_SHOW_TESTIMONIALS=true`                                 | ⏳ section hidden                                                |
| 10  | Team portraits, founders' names/story; high-res originals of the hangar-interior and cliff-top-crew thumbnails.                | Nosotros "Nuestra gente" (`app/[locale]/(site)/nosotros/page.tsx`)                               | ⏳                                                               |
| 11  | ICAO code for El Trompillo (SLET) and HUD coordinates.                                                                         | `content/site.ts` (`icao`, `hudCoords`, `geo`)                                                   | ⏳                                                               |
| 12  | Bolivian emergency numbers (110 / 118 / 119) for Heli and the contact page.                                                    | `content/site.ts` (`emergencyNumbers`)                                                           | ⏳                                                               |

## Also needs the client

- **Operation map coordinates** are approximate locality/block centroids — confirm or supply exact areas (`content/operations.ts`).
- **Privacy policy & terms** (`content/legal.ts`) are plain-language drafts — have counsel review.
- "Pilots and engineers with thousands of hours" was **dropped** from the safety pillars per plan §6.8 (unverified). Re-add with a real figure if Helibol provides one.

## Infrastructure to set up (needs account access)

- **Supabase:** create the project and run `supabase/migrations/20261031000000_init.sql` (tables `leads`, `quote_requests`, `heli_conversations`, RLS on, no public policies). Schedule `purge_old_heli_conversations()` daily with pg_cron (90-day retention promised in the privacy policy).
- **Resend:** verify the `helibol.com` sending domain, set `RESEND_FROM` and `RESEND_API_KEY`.
- **Anthropic:** `ANTHROPIC_API_KEY` for Heli.
- **Upstash Redis** (recommended): `UPSTASH_REDIS_REST_URL` / `_TOKEN` so Heli's 20-msgs/10-min limit is shared across serverless instances (in-memory fallback otherwise).
- **Vercel:** import the repo, add the env vars from `.env.example`, deploy a preview → client review → DNS cut-over for helibol.com (plan §11.11).
- **GA4 / Meta Pixel IDs** (optional): `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`. They load only after cookie consent.

## Known gaps vs. plan

- **Performance budget (§10)** — Lighthouse mobile (simulated 4G, local prod build): `/es` perf ~70–75, `/es/servicios/rescate-y-medevac` ~87, `/es/flota/bell-412` ~87; accessibility & best-practices 100; SEO 92 locally only because the canonical points at `https://helibol.com`. CLS = 0. The _observed_ LCP is ~0.3 s (= FCP); the simulated LCP (~4 s) and TBT are driven by JS weight: home first-load JS is ~265 KB gz vs. the 180 KB target (Next/React baseline alone is ~102 KB; GSAP ~53 KB, Motion ~44 KB). Next steps: move Motion to `LazyMotion` + `m` components, consolidate simple reveals onto one library, lazy-load GSAP-only sections (map, timeline) below the fold. Re-measure on the Vercel preview (real CDN + HTTP/2) before deciding.
- **M8 fleet showroom** uses Motion crossfades/layout instead of GSAP Flip (same effect, one less plugin). MorphSVG isn't used.
- **M9** — /operaciones now uses an R3F 3D globe (Natural Earth outlines in `content/geo-south-america.ts`); the SVG map stays on the home page and as the reduced-motion / no-WebGL fallback. Only 8 projects have documented data, so the globe plots those 8 and states "a selection from 100+". Send the full project list (name, year, location) to plot the rest.
- **About hero video** reuses the home hero clip — a dedicated about-page clip (crew, hangar, fleet line-up) would be better.
- **Nosotros "Our people"** shows role cards (pilots, engineers, rescue crew, ops) until real portraits and names arrive (#10).
- **Mobile device pass** on a real iPhone (Safari) and Android (Chrome) still needs doing by a human (plan §13).
- **Bell 212 cut-out** — only the Bell 412 photo had a clean white sky for automatic background removal; the 212 is shown as a photo. A manual cut-out (remove.bg) of `bell212-blue-sky.jpg` would let it float like the 412.
- **JSON-LD** — validate on the preview URL with Google's Rich Results Test.
