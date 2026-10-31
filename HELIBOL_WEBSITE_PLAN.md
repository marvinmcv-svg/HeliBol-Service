# HELIBOL.COM — Website Rebuild Master Plan
**Hand-off doc for the coding agent · v1.0 · Oct 31 2026**

> Repo is currently a blank slate — the coding agent scaffolds the project from scratch following this document.

---

## 0. Context — why we're rebuilding

**Who Helibol is.** HELIBOL S.R.L. is a helicopter services and aerial logistics operator based at **Hangar 22, El Trompillo Airport, Santa Cruz de la Sierra, Bolivia**. It was **founded in 1988**, which makes 2026 its **38th year** (their own Instagram already says *"38 AÑOS — Volando los cielos más puros de América"*). It's family-run, and it's one of the largest helicopter operators in Bolivia. It flies a **Bell 212 / 212HP, a Bell 412 / 412HP (with a VIP-interior version) and an Airbus H125 / AS350 B3**, and its first aircraft was a **Bell 47**. Main lines of work:
- **Energy & Mining:** seismic acquisition, drill moves, geophysics, camp support, aeromagnetics. It has supported 100+ exploration projects, with operations in Bolivia, Argentina and Peru.
- **Emergency:** search & rescue, MEDEVAC, aerial firefighting with a Bambi Bucket (1,220 L per drop).
- **Utility:** internal and external cargo, long-line work, construction, inspection and survey.
- **People:** personnel transport, VIP transport, tourism and scenic flights, film and aerial photography.
- **Turnkey:** aircraft acquisition and sourcing through its international network.

Credentials it already claims: compliance with OGP/IOGP industry standards, being audited and approved by major international oil companies, and the HAI Robert E. Trimble award for operational excellence (**verify before publishing**, see §12).

**What's wrong with the current site** (WordPress, helibol.com):
- **Broken conversion path:** every "LEER MÁS" link goes to `/404-2`. There's no quote form, no WhatsApp, and phone and email aren't clickable on the home page.
- **Facts contradict each other:** 35, 30 and 21 years appear on different pages, and the phone number is written two ways.
- **Copy problems:** typos ("Ocassion", "Incedios"), an empty "Medio Ambiente" section, an AS350 description cut off mid-sentence, and pages that are half English and half Spanish.
- **No trust layer:** no named team, no testimonials or case studies, no social links, no certificate visuals.
- **Dated presentation:** generic slider and 2014-era images.

**The goal.** Build a site that looks and feels like a US$10k+ agency build. It should be cinematic, fast and bilingual (ES primary, EN secondary). Tone: **premium, professional and warm/family-friendly**, because this is a family company that flies families, crews and rescuers home. It should turn three audiences into enquiries:
1. **B2B clients** (oil & gas, mining, construction, government and NGOs).
2. **Emergency and institutional buyers.**
3. **Private, family and VIP clients** (scenic flights, transfers, events).

**Heli**, an AI receptionist, answers questions 24/7 and collects qualified leads.

---

## 1. Brand system

| Token | Value | Use |
|---|---|---|
| `--hb-blue` | **#1C75BC** (exact fill from `helibol-blue.svg`) | Primary brand color, CTAs, links |
| `--hb-blue-deep` | #0B3A63 | Section backgrounds, footer |
| `--hb-night` | #06131F | Hero overlay and dark sections (premium "cockpit at dusk") |
| `--hb-sky` | #E8F2FA | Light section backgrounds |
| `--hb-white` | #FFFFFF | |
| `--hb-sunset` | #F2A23A | **Accent only** (≤5% of UI). Taken from the golden-hour Bell 412 photo. Use for small highlights, stat underlines and Heli's status dot |
| `--hb-rescue` | #FF5A1F | Only in the Emergency/SAR context (matches the orange flight suits in the photos) |
| Ink/greys | #0F172A, #475569, #94A3B8, #E2E8F0 | Text and borders |

- **Logo assets (Drive `/media/logos` and `/01_helibol.com_website/helibol-assets/logos`):**
  - `helibol-white.svg` and `helibol-blue.svg`: header and footer.
  - `helibol-emblema.svg` / `HLBLEMA.4X.svg`: emblem used for the preloader and favicon.
  - `HLB30YRS.svg`: anniversary wings mark. Reuse its wing shape for a **"38 AÑOS"** badge, which must be redrawn because the file says 30.
  - `HLBFAVICON.png`.
- **Brand line (from their own logo lock-up):** **"VERTICAL EFFICIENCY · EST. 1988"**. Use it as an eyebrow line throughout.
- **Type:**
  - Display: **"Clash Display"** (Fontshare, free), or **"Neue Montreal"** if licensed. Wide, aviation-feeling, uppercase with tracked eyebrows.
  - Body: **"Inter Tight"** or **"Geist"**.
  - Numerals: tabular figures for stats and specs.
  - Self-host via `next/font/local`.
- **Visual language:**
  - Generous negative space and full-bleed photography.
  - Hairline 1px grid lines, like instrument panels.
  - Small HUD-style details: coordinates `17°47′S 63°11′W` (El Trompillo), altitude ticks, ICAO-style labels `SLET` (El Trompillo's ICAO code — **verify**).
  - Rounded 20–28px cards with glass layers (`backdrop-blur`), and subtle film grain over dark sections.

---

## 2. Tech stack (non-negotiable unless noted)

| Concern | Choice |
|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript (strict)**, React 19 |
| Styling | **Tailwind CSS v4** with CSS variables from §1, plus `clsx`/`tailwind-merge` |
| Smooth scroll | **Lenis** (`lenis` package), synced to GSAP's ticker |
| Scroll animation | **GSAP 3.13+** with **ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVG, Flip** (all free since 2025), via `@gsap/react` `useGSAP()` |
| Component motion | **Motion** (`motion/react`, formerly Framer Motion) for hover, layout, presence, page transitions and the Heli chat UI |
| 3D | **React Three Fiber + drei**, lazy-loaded, for the hero "rotor wash" particle field and the 3D topographic Bolivia map. **CSS-3D tilt cards** (Motion springs) for services and fleet |
| i18n | **next-intl**, with `/es` (default) and `/en` routes and hreflang |
| Forms | react-hook-form + zod, server actions |
| AI (Heli) | **Anthropic Claude API** via `@anthropic-ai/sdk` from a Next route handler with streaming. Model `claude-haiku-5-5` for chat (fast and cheap), with escalation to `claude-sonnet-5-5` for complex quote reasoning |
| Data | **Supabase** tables `leads`, `heli_conversations` and `quote_requests`, with RLS on (writes from the server only) |
| Email | Resend: lead notification to `info@helibol.com` and an auto-reply to the client |
| Media | `next/image` (AVIF/WebP); videos transcoded to H.264 + VP9/AV1, 720p and 1080p, under 3 MB for loops, `preload="metadata"` with a poster |
| Hosting | Vercel (Edge for static, Node runtime for `/api/heli`) |
| Analytics | Vercel Analytics plus GA4/Meta Pixel behind a consent banner. Track events `cta_quote`, `cta_whatsapp`, `heli_open`, `heli_lead_captured` and `quote_submitted` |
| Quality | ESLint, Prettier, Playwright smoke tests, Lighthouse CI |

**Folder structure:**
```
app/[locale]/(site)/page.tsx                 # Home
app/[locale]/(site)/servicios/page.tsx       # Services hub
app/[locale]/(site)/servicios/[slug]/page.tsx
app/[locale]/(site)/flota/page.tsx           # Fleet
app/[locale]/(site)/flota/[slug]/page.tsx
app/[locale]/(site)/nosotros/page.tsx        # About / history / safety
app/[locale]/(site)/operaciones/page.tsx     # Projects / track record
app/[locale]/(site)/vuelos-panoramicos/page.tsx  # Family / tourism / VIP landing
app/[locale]/(site)/cotizar/page.tsx         # Multi-step quote
app/[locale]/(site)/contacto/page.tsx
app/[locale]/(legal)/privacidad|terminos/page.tsx
app/api/heli/route.ts                        # Heli streaming endpoint
components/motion/*  (SmoothScroll, Reveal, SplitHeading, Magnetic, TiltCard, Marquee, CountUp, ParallaxImage, PinnedSequence)
components/three/*   (RotorWashField, BoliviaTopoMap)
components/heli/*    (HeliLauncher, HeliPanel, HeliMessage, HeliQuickReplies, LeadCard)
content/{es,en}/*.json   # ALL copy lives here (copy from §6 & §7)
content/services.ts, content/fleet.ts, content/operations.ts, content/socials.ts
lib/heli/{system-prompt.ts, knowledge.ts, tools.ts}
public/media/** (optimized images from §5)
```

---

## 3. Motion and interaction spec (the "$10k feel")

Global rules:
- Lenis `lerp: 0.1`, `wheelMultiplier: 1`. Drive Lenis from `gsap.ticker` and call `ScrollTrigger.update` on scroll.
- Respect **`prefers-reduced-motion`**: Lenis off, ScrollTrigger scrubs replaced with simple fades, WebGL replaced with a static poster.
- Animate `transform` and `opacity` only. Run `ScrollTrigger.refresh()` after fonts and images load.
- Easing: `expo.out` for reveals (0.9–1.2s), `power3.inOut` for pinned scrubs. Motion springs: `{stiffness: 260, damping: 26}`.

| # | Effect | Where | Implementation |
|---|---|---|---|
| M1 | **Preloader:** the emblem's globe draws in (DrawSVG), wings slide out, "EST. 1988 → 2026" counter, then a curtain wipes upward | First visit only (sessionStorage) | GSAP timeline, ≤1.6s, skippable |
| M2 | **Hero "lift-off":** full-bleed video loop. On scroll the frame scales 1.0→1.15, the headline splits by line and rises with a mask, and a HUD (altitude counter 0→"FL 38 años", coordinates) ticks | Home hero | ScrollTrigger pin + scrub, SplitText `lines` with mask |
| M3 | **Rotor-wash particles:** a WebGL field of ~2k grass/dust points that swirl away from the cursor and calm as you scroll | Behind hero, desktop only | R3F `Points` + shader, lazy, `dpr={[1, 1.5]}` |
| M4 | **Magnetic CTAs:** buttons follow the cursor ±8px; a fill sweep on hover | All primary CTAs | Motion `useSpring` |
| M5 | **3D tilt cards:** perspective 1000, ±10° tilt, specular glare that follows the cursor, image parallax inside (translateZ 40px) | Services grid, Fleet cards | Motion + CSS 3D; disabled on touch (replaced by a gyroscope-light or static press state) |
| M6 | **Horizontal pinned services rail:** the section pins and 6 service panels scroll sideways, each image counter-parallaxes and a progress bar fills | Home §6.4 | GSAP `containerAnimation` |
| M7 | **Count-up stats:** numbers roll like an odometer (digits slot vertically) | Stats band | GSAP per-digit |
| M8 | **Fleet showroom:** pinned stage where the aircraft image crossfades with Flip between Bell 212 → Bell 412 → H125; the spec table morphs; giant outlined model name behind | Home §6.6 + /flota | ScrollTrigger + Flip |
| M9 | **Bolivia flight-path map:** a 3D tilted topographic map (or a 2D SVG fallback). DrawSVG traces flight lines from El Trompillo to the real operation sites (Charagua, Entre Ríos, Huacareta, Miguillas, Beni Norte, Isarsama, Boomerang), and pins pop in with labels and years | Home §6.7 + /operaciones | R3F with a displacement texture, or SVG + DrawSVG |
| M10 | **Timeline "since 1988":** a vertical line draws as you scroll, years scale up when they become active, and photos parallax. The Bell 47 photo is shown in sepia, turning to color as you scroll | /nosotros + Home teaser | ScrollTrigger scrub |
| M11 | **Marquee:** an infinite logo/keyword ticker (service names, or client-type icons) that speeds up with scroll velocity | Between sections | GSAP + Lenis velocity |
| M12 | **Image reveals:** clip-path inset 100%→0 with a 1.2→1.0 scale | All section images | Reusable `<RevealImage>` |
| M13 | **Page transitions:** a blue panel sweeps across with the emblem in the center | Route changes | Motion `AnimatePresence` + template.tsx |
| M14 | **Custom cursor (desktop):** a small ring that grows to "VER / VIEW" or "ARRASTRA / DRAG" labels over media and rails | Global | Motion |
| M15 | **Text scramble:** eyebrow labels scramble in like an instrument readout | Eyebrows | GSAP ScrambleText |
| M16 | **Sticky glass nav:** hides on scroll down and shows on scroll up; turns solid after the hero; active link has a sliding underline (layoutId) | Global | Motion |

---

## 4. Information architecture and sitemap

```
/es (default)  ·  /en
├─ Inicio / Home
├─ Servicios / Services
│   ├─ energia-y-mineria   (Oil & Gas, Seismic, Mining, Drilling, Aeromagnetics, Geology)
│   ├─ rescate-y-medevac   (SAR, MEDEVAC, medical emergency support)
│   ├─ combate-de-incendios (Bambi Bucket, Category-2 firefighting)
│   ├─ carga-y-construccion (internal/external cargo, long-line, construction, inspection, survey)
│   ├─ vip-y-turismo        (VIP transfer, personnel, scenic flights, events)  ← links to Vuelos Panorámicos
│   └─ cine-y-fotografia    (aerial filming, camera platforms)
├─ Flota / Fleet  → bell-212 · bell-412 · h125 + "Proyectos Turnkey" block
├─ Operaciones / Track record (map + project timeline)
├─ Vuelos Panorámicos / Scenic Flights (family & private landing page)
├─ Nosotros / About (story since 1988, safety, team, values)
├─ Cotizar / Get a quote (multi-step)
└─ Contacto / Contact
```
- **Primary CTA everywhere:** **"Solicitar cotización / Request a quote"**.
- **Secondary CTA:** **WhatsApp** (+591 number, see §12) and **"Hablar con Heli / Talk to Heli"**.
- **Emergency strip:** a persistent but slim pill in the nav, *"¿Emergencia? +591 3 352 9469"*, as a `tel:` link.

---

## 5. Image selection (curated, deliberate)

I reviewed all ~80 images and 5 videos in the Drive folder. The selection rules: **real Helibol aircraft only**; **no baked-in text or logos**; **≥1900px wide for full-bleed**; **people and human moments wherever possible** (family-friendly warmth); and **one strong idea per section**. Download originals from Drive by file ID → `public/media/...`, then export AVIF/WebP at 640/1080/1920/2560.

> ⚠️ **The Drive filenames for the fleet photos are swapped.** `fleet/bell212.jpg` shows a **Bell 412** (4-blade rotor, CP-3066). `fleet/bell412.jpg` shows a **Bell 212** (2-blade, jungle). Label aircraft by what is in the photo, not by the filename.

### ✅ SELECTED (in priority order)

| Role | File (Drive folder) | Drive ID | Why |
|---|---|---|---|
| **HERO video loop** | `ig_video_mission_ready.mp4` (media/videos) | `1lexHfTSv5pZiOQ-IWAU25hqj9DM90aJV` | Real Bell 212 lifting off straight at the camera, with grass blowing in the rotor wash. Pure "lift-off" energy. It's vertical (720×1280), so on desktop use the **4–14s segment, center-cropped to 16:9** behind a dark gradient, and play it **native vertical on mobile**. Re-encode under 3 MB |
| **HERO poster / desktop still** | `Mountain-Edge-212-page-stretched.jpg` (media/hero) | `1OrpT5PkpwxSjkfqhI0DX89ZbGPhOAgQ7` | 3600×2400, the highest-resolution image they have. A Bell 212 on a ridge above the clouds. Cinematic and "where roads end". Use the B&W-with-blue-accent treatment as delivered. Also the OG image |
| **Golden-hour signature shot** | `bell212.jpg` (media/fleet), **actually a Bell 412** | `17Jdww02-hd2Z0nyB-LIR0WGELexXTjF_` | The most premium, emotional photo in the set. Use for the "Family company / 38 years" story and the CTA band background |
| **Bell 412 in flight (cut-out)** | `B212HLB-COV4.jpg` (media/hero), **actually a Bell 412** | `1Yl48FJfgyHV0eb9eihuzOPZaobpK3eGj` | On a pure white sky, so it's easy to **remove the background into a transparent PNG** for the fleet showroom and 3D floating effect |
| **Bell 412 belly / power** | `HLB-BTWIN-RESC-WEBASSET-12.jpg` (helibol-assets/images) | `181oYt2xGFEymtbHvzJMIZuty7a2EKIWu` | Dramatic low angle, CP-3066 registration visible. Fleet detail hero |
| **Bell 212 in flight (clean)** | `HLB-BTWIN-RESC-WEBASSET-8-scaled.jpg` (media/about) | `1nV0g1S0pR4A0s2BRmwfxpIxHePZvu7v8` | 2560px, new livery, blue sky. Bell 212 fleet card and cut-out |
| **Bell 212 in the jungle** | `bell412.jpg` (media/fleet), **actually a Bell 212** | `1Bvb2xvepJLLSLVW_w6RVVFSBfNapCNyE` | Remote landing among canyon walls. Energy & Mining hero |
| **H125 / AS350 field ops** | `as350-alt.jpg` (media/fleet) | `1blAwG-cF3YraDcWwVLSm6V4ZtInkkzLh` | AS350 on the high plateau with fuel drums: real hot-and-high field work. H125 fleet card |
| **H125 long-line** | `as350.jpg` (media/fleet) | `1LsOfcIP0BY12jwcQkx4lyKJq8_r6wa0l` | Long-line against dramatic clouds. Cargo service and parallax |
| **Scenic / family flights hero** | `turismo.jpg` (media/services) | `1QoDqDg3c1RcQXyUjZh3H115nYmyvtK2S` | Bell 412 over a waterfall and red canyon walls. Shows Bolivia's beauty and sells scenic flights (vertical, 844×1500, so use it in a tall card or split layout, **not** full-bleed desktop) |
| **Rescue: human moment** | `ig_18.jpg` (media/instagram) | `1gZCBlkLQsP0k9QPyqtoXXGOFed9LHtaN` | Orange-suit rescue crew loading a stretcher. The single most human, trustworthy image. Low-res (480×640), so **use it only in a small card** or as a tilt-card portrait |
| **Rescue: hoist** | `rescate.jpg` (media/services) | `1856FF1GBhDau1CZZQupP5uzx6jv8cCJI` | Crew member on the skid. SAR service card |
| **Firefighting: drop** | `bambi2.jpg` (media/services) | `1nViXP823HFnG14vgoD_oAQT0hkRWQuYG` | Bambi Bucket releasing water, shot from below. Strong graphic shape |
| **Firefighting: ground** | `bambi.jpg` (media/services) | `1rpznjESk-snDpbj7zPsxRNzEunquYu1F` | Bell 212 with the orange Bambi Bucket. Firefighting detail page |
| **Logistics / camp** | `logistica.jpg` (media/services) | `1YoYEJZ0qlQ78A8b5da3QnENd_Eek27nP` | Two aircraft at a jungle helipad camp. Seismic/camp-support proof |
| **Cargo long-line pair** | `HLB-BTWIN-RESC-WEBASSET-5.jpg` (helibol-assets/images) | `1ZpxfetxZ2MS0EjCA36fvhn4qs-Du9WH3` | Two helicopters, one carrying an external load. Cargo & Construction |
| **Survey / aeromagnetics** | `telid1.jpg` and `telid2.jpg` (media/services) | `1e6pWsQmotqj5k2Ra3ed_gh2ZLpMmkJ3g`, `1ukcWF8bks1bCqKeU7eP-w8BY-bQ4QFGD` | Technicians with airborne survey equipment. Human expertise |
| **Maintenance / team** | `HLB.ABOUTUS-COV.jpg` (media/about) | `11Afuiyhd9zHdAEFIT2kAGWJlnZXoZ6A0` | Engineers smiling around an engine in the hangar. "Our people" (family warmth) |
| **Heritage: Bell 47** | `HLB-BTWIN-RESC-WEBASSET-6.jpg` (helibol-assets/images) | `1tT698sMkQBF3AtEK-sVTS9daPBpA5aoF` | Vintage Bell 47 at El Trompillo: the "1988 origin" image for the timeline (sepia → color effect) |
| **Ramp at dusk** | `HLB-BTWIN-RESC-WEBASSET-15.jpg` (helibol-assets/images) | `19N-2a9SJNxSQAWetroYaK-VUVt8MA3me` | Bell 212 at dusk on the ramp. Contact page and "visit us" |
| **B&W drama** | `BTwin-WebAsset.jpg` (helibol-assets/images) | `11Rn1qUiwDYXRQaUzvDYuAiefYLK4rHi7` | 1800² head-on monochrome. Pull-quote and safety-section background |
| **Video: crew boarding** | `ig_video_dias_grises.mp4` (media/videos) | `1z3ur15w-8Sp6MvpTpOUmK9LXMmvEy-eR` | Ground crew boarding on a grey day. A muted micro-loop in the "Our people" card |
| **Video: cockpit** | `ig_reel_eye_in_the_sky.mp4` (media/videos) | `1nKQTQywxhTZPPnCmlQ30nrzPPjJ8vrNG` | B&W cockpit POV. Background for the safety section, and Heli's panel header |
| Logos | `helibol-white.svg`, `helibol-blue.svg`, `helibol-emblema.svg`, `HLBFAVICON.png` (media/logos) | see Drive | Brand |

### ❌ REJECTED (and why)

- **`andes-night.jpg`:** stock night-mountain photo with no aircraft. It doesn't appear to be Bolivia, and it isn't Helibol.
- **`SIJ2.jpg`, `SIJ2_1.jpg`, `SIG_2.jpg`, `SIF1.jpg`, `slider-image.jpg`:** text, logos and "25 YEARS" are baked into the image, and the panoramic crop doesn't suit modern layouts.
- **`HLB.ABOUTUS-COV2.jpg`:** a collage grid, which looks dated.
- **`B212HLB-COV.jpg`:** a red guide line is drawn on the image.
- **`B212HLB-COV2.jpg` / `bell212-alt.jpg`:** an awkward low-light ground scene. Allowed in the gallery only.
- **All `Helibol_home*`, `Helibol_aboutus*`, `helibol_services*`, `galery1`, `aircrafts*`, `infrastructure1`:** thumbnails of 78–161px, unusable. *(Ask the client for originals of `helibol_infrastructure1`, the hangar interior, and `Helibol_services1`, the cliff-top crew. Both are great shots.)*
- **IG cockpit stills `ig_02/10`, the runway stills `ig_03/04/05/13`, and `ig_01/23`:** low-res or empty frames.
- **`ig_raw_2.jpg`:** shows another operator's livery. Never use it.
- **`ig_video_excelencia_experiencia.mp4`:** a brand motion graphic. Don't embed it, but **reuse its ideas**: line-art aircraft illustrations, *"Excelencia por experiencia"* and *"38 años"*.

**Duplicates found** (same bytes): `fleet/bell212 = about/RESC13`, `fleet/bell412 = assets/RESC10`, `fleet/as350 = assets/RESC14.1`, `fleet/as350-alt = assets/RESC11`, `services/turismo = assets/RESC4`, `services/incendios = assets/FIRE1`, `services/rescate = assets/RESC2`. Import each image only once.

**Image treatment:**
- Dark sections: 10% grain plus a gradient from `--hb-night` at 70% opacity to transparent.
- Keep Mountain-Edge's selective-color B&W style as a **signature treatment** for 2–3 hero moments only.
- Everything else stays full color.

---

## 6. HOME PAGE — section-by-section, with final copy (ES primary / EN)

> Voice: confident, calm, warm. Short sentences. Facts over adjectives. "We" = a family of aviators. Never hype safety ("100% safe"), never invent prices.

### 6.1 Nav
Logo · Servicios · Flota · Operaciones · Vuelos Panorámicos · Nosotros · Contacto · `ES|EN` · **[Solicitar cotización]** · slim pill **"Emergencias 24/7 · +591 3 352 9469"**

### 6.2 Hero (M1, M2, M3)
- **Eyebrow:** `VERTICAL EFFICIENCY · EST. 1988 · SANTA CRUZ, BOLIVIA`
- **H1 (ES):** **Donde terminan los caminos, empezamos nosotros.**
- **H1 (EN):** **Where the roads end, we begin.**
- **Sub (ES):** Desde 1988 llevamos personas, carga y ayuda a los rincones más remotos de Bolivia, con la experiencia de 38 años y el cuidado de una empresa familiar.
- **Sub (EN):** Since 1988, we've flown people, cargo and help to Bolivia's most remote corners, with 38 years of experience and the care of a family company.
- **CTAs:** [Solicitar cotización / Request a quote] · [Hablar con Heli → / Talk to Heli →]
- **HUD corner (bottom-left):** `17°47′S 63°11′W · HANGAR 22 · EL TROMPILLO` · **(bottom-right)** scroll cue "Despegar ↓ / Lift off ↓"

### 6.3 Trust band (M7, M11)
Four count-up stats on a glass strip:
- **38** años en el aire / *years in the air*
- **100+** proyectos de exploración / *exploration projects*
- **3** países operados: Bolivia · Argentina · Perú / *countries flown*
- **24/7** respuesta a emergencias / *emergency response*

Then a marquee: `IOGP STANDARDS · AUDITADOS POR OPERADORAS INTERNACIONALES · BELL 212 · BELL 412 · H125 · SAR · MEDEVAC · BAMBI BUCKET · LONG-LINE ·`

### 6.4 "Lo que hacemos" — pinned horizontal services rail (M6, M5)
- **Section H2 (ES):** Un helicóptero para cada misión. **(EN):** A helicopter for every mission.
- **Lead (ES):** Analizamos el terreno, la altura, la carga y el objetivo, y recomendamos la aeronave exacta. Nada más, nada menos.
- **Lead (EN):** We study the terrain, the altitude, the payload and the goal, and recommend the exact aircraft for the job. Nothing more, nothing less.

Six panels (each is a tilt card with image, title, one-liner, and a "Ver servicio →" link):

| # | ES title / line | EN title / line | Image |
|---|---|---|---|
| 01 | **Energía y Minería:** Sísmica, perforación y campamentos donde no hay caminos. | **Energy & Mining:** Seismic, drilling and camp support where there are no roads. | Bell 212 jungle |
| 02 | **Rescate y MEDEVAC:** Cuando cada minuto cuenta, despegamos. | **Rescue & MEDEVAC:** When every minute counts, we're already airborne. | rescate / ig_18 |
| 03 | **Combate de Incendios:** 1.220 litros por descarga. Precisión cuando el fuego avanza. | **Aerial Firefighting:** 1,220 litres per drop. Precision when the fire won't wait. | bambi2 |
| 04 | **Carga y Construcción:** Long-line, montaje e inspección: la grúa que vuela. | **Cargo & Construction:** Long-line, lifting and inspection: the crane that flies. | RESC5 |
| 05 | **VIP y Vuelos Panorámicos:** Bolivia desde arriba, con tu familia o tu equipo. | **VIP & Scenic Flights:** See Bolivia from above, with your family or your team. | turismo |
| 06 | **Cine y Fotografía:** Plataformas aéreas para tomas imposibles. | **Film & Photography:** Aerial platforms for impossible shots. | as350 long-line or a still from the cockpit reel |

### 6.5 "Una familia que vuela" — story split (M12, M10 teaser)
- **Image:** golden-hour Bell 412, with the maintenance-crew photo overlapping as a tilted card.
- **Eyebrow:** `DESDE 1988`
- **H2 (ES):** Somos una empresa familiar. Volamos como tal.
- **H2 (EN):** We're a family company. We fly like one.
- **Body (ES):** Helibol nació en 1988 en un hangar de El Trompillo con un Bell 47 y una convicción: que la distancia no debería dejar a nadie sin ayuda. Treinta y ocho años después, nuestros pilotos, técnicos y tripulantes siguen trabajando con la misma regla: cada persona que sube a bordo vuelve a casa. La tuya, y la nuestra.
- **Body (EN):** Helibol was born in 1988 in a hangar at El Trompillo with a single Bell 47 and one conviction: distance should never leave anyone without help. Thirty-eight years later, our pilots, engineers and crew still follow the same rule: everyone who comes aboard comes home. Yours and ours.
- **Link:** Conoce nuestra historia → / Read our story →

### 6.6 Fleet showroom — pinned (M8)
- **H2 (ES):** La flota correcta, lista para despegar. **(EN):** The right fleet, ready to fly.
- Three states (cut-out aircraft, spec table, a one-line "best for", and a CTA "Ver ficha técnica / View specs"). Specs are taken from the current site and must be verified (§12):
  - **Bell 212 / 212HP: "El caballo de batalla" / "The workhorse."** Twin P&W PT6T-3 Twin-Pac · 1,800 shp · up to 14 passengers · 2,041 kg on the hook · cruise 185 km/h. *Best for: seismic, firefighting, heavy external cargo, SAR.*
  - **Bell 412 / 412HP: "Potencia y confort" / "Power meets comfort."** P&W PT6T-3DF · 4-blade rotor (a smoother ride) · up to 14 passengers · cruise 220 km/h · VIP interior available. *Best for: VIP and executive transfers, personnel, MEDEVAC.*
  - **Airbus H125 (AS350 B3): "Rey de las alturas" / "King of high altitude."** Turbomeca Arriel 2D · cruise 235 km/h · up to 5 passengers · 1,400 kg on the hook. *Best for: the Andes and hot-and-high work, survey, filming, scenic flights.*
- Footer strip: **Proyectos Turnkey:** *¿Necesita su propia aeronave? Le ayudamos a encontrarla, evaluarla y traerla, con nuestra red internacional.* / *Need your own aircraft? We'll help you source, inspect and import it through our international network.* → [Consultar / Enquire]

### 6.7 Operations map (M9)
- **H2 (ES):** Ya hemos estado ahí. **(EN):** We've already been there.
- **Lead (ES):** Más de 100 proyectos de exploración en Bolivia, Argentina y Perú. Estos son algunos de los más recientes.
- **Lead (EN):** 100+ exploration projects across Bolivia, Argentina and Peru. Here are some of the most recent.
- **Pins (from their own timeline):**
  - 2023: Sara Boomerang 2D
  - 2019: Charagua · San Miguel Isarsama · Chirca
  - 2018: Beni Norte · Entre Ríos Norte/Sur · Miguillas
  - 2017: Entre Ríos / Huacareta

### 6.8 Safety pillars — dark section over the B&W cockpit loop
- **H2 (ES):** La seguridad no es un departamento. Es nuestra cultura. **(EN):** Safety isn't a department. It's our culture.

Four tilt cards:
1. **Auditados internacionalmente / Internationally audited:** Cumplimos estándares IOGP y somos auditados y aprobados por operadoras internacionales de primer nivel. / *We meet IOGP standards and are audited and approved by top-tier international operators.*
2. **Tripulación experimentada / Experienced crews:** Pilotos y técnicos con miles de horas en selva, altiplano y montaña. / *Pilots and engineers with thousands of hours over jungle, altiplano and mountains.* (**verify the hours figure, or drop it**)
3. **Respuesta inmediata / Rapid response:** Técnicos, repuestos y asesoría a una llamada de distancia, con canales directos a nuestra red internacional. / *Engineers, parts and advice one call away, with direct lines into our international network.*
4. **Asesoría experta / Expert advice:** Le recomendamos la aeronave con la capacidad exacta que su misión necesita. / *We recommend the aircraft with exactly the capacity your mission needs.*

Also an **eco note:** *Nuestra operación long-line reduce la necesidad de construir helipuertos, cuidando el entorno donde trabajamos.* / *Long-line operations reduce the need to clear helipads, protecting the places we work in.*

### 6.9 Scenic and family flights teaser (warmth moment)
- **Split layout:** the vertical turismo image in a tall rounded card plus copy.
- **H2 (ES):** Bolivia, como nunca la has visto. **(EN):** Bolivia, like you've never seen it.
- **Body (ES):** Cumpleaños, aniversarios, propuestas o simplemente el regalo de ver tu tierra desde el cielo. Vuelos panorámicos y traslados privados con tripulación profesional y toda la tranquilidad de 38 años de experiencia.
- **Body (EN):** Birthdays, anniversaries, proposals, or simply the gift of seeing your homeland from the sky. Scenic flights and private transfers with professional crews and the peace of mind of 38 years' experience.
- **CTA:** [Reservar un vuelo / Book a flight] → /vuelos-panoramicos

### 6.10 Testimonials (placeholder structure, **client must supply**)
- 3 quote cards: oil-company HSE manager, rescue coordinator, private family.
- **Do not fabricate quotes or names.** Ship with the section hidden behind a feature flag until real quotes exist.
- In the meantime, show the **HAI award** (if verified) and **client-type logos** (only with permission).

### 6.11 Final CTA band (golden-hour background)
- **H2 (ES):** Cuéntenos su misión. Nosotros nos encargamos del resto.
- **H2 (EN):** Tell us your mission. We'll handle the rest.
- **Sub:** Respuesta en menos de 24 horas hábiles. Emergencias: 24/7. / *Reply within one business day. Emergencies: 24/7.*
- **CTAs:** [Solicitar cotización] [WhatsApp] [Hablar con Heli]

### 6.12 Footer (see §9 for socials)
- **4 columns:**
  1. Logo, the line "Vertical Efficiency · Est. 1988", and a one-line mission.
  2. Services links.
  3. Company: Fleet, Operations, About, Scenic Flights, Contact.
  4. Contact: Hangar 22, Aeropuerto El Trompillo, Santa Cruz de la Sierra, Bolivia · **+591 3 352 9469** · info@helibol.com · Map link `https://maps.app.goo.gl/gjpMLZKtps7ER59V7`.
- **Social icon row** with hover-magnetic icons.
- Newsletter-free (B2B). A small "38 años" wing badge.
- © 2026 HELIBOL S.R.L. · Privacidad · Términos · `ES|EN`.
- A giant outlined **"HELIBOL"** wordmark spans the bottom and fills with blue as it scrolls into view.

---

## 7. Inner-page copy and structure

**Service detail template** (`/servicios/[slug]`):
1. Hero image + H1 + one-line promise.
2. "El reto / The challenge" (2–3 sentences).
3. "Cómo lo resolvemos / How we do it" (3 steps with icons).
4. Recommended aircraft (linked fleet cards).
5. Capabilities list.
6. A related operation from the map.
7. FAQ (4–6 items, also exported as FAQPage JSON-LD).
8. CTA band.

Copy per slug:
- **energia-y-mineria**
  - H1: *Logística aérea para la exploración más exigente. / Air logistics for the toughest exploration.*
  - Capabilities: seismic acquisition, drill moves, camp support, sample transport, geophysics and aeromagnetics, geological field work, environmental-response deployment.
  - Proof: 100+ projects; IOGP.
- **rescate-y-medevac**
  - H1: *Cuando cada minuto cuenta. / When every minute counts.*
  - Capabilities: SAR, MEDEVAC, medical emergency support, hoist/long-line rescue (**verify** whether hoist equipment exists).
  - Prominent `tel:` button.
- **combate-de-incendios**
  - H1: *Agua precisa, donde el fuego avanza. / Precise water, right where the fire is.*
  - Facts: Bambi Bucket; 1,220 L per drop; the Bell 212 as a Category-2 firefighting reference; 12–13 personnel capacity for crew insertion.
- **carga-y-construccion**
  - H1: *La grúa que vuela. / The crane that flies.*
  - Capabilities: internal and external cargo, long-line, tower and line construction, inspection, survey.
- **vip-y-turismo**
  - H1: *Llegue descansado. Llegue a tiempo. / Arrive rested. Arrive on time.*
  - Bell 412 VIP interior, personnel transport, events; links to scenic flights.
- **cine-y-fotografia**
  - H1: *Tomas imposibles, vuelo preciso. / Impossible shots, precise flying.*
  - Camera platforms for TV, film and advertising.

**Fleet detail** (`/flota/[slug]`):
- Hero cut-out with a float animation and an interactive spec table (metric/imperial toggle).
- "Ideal para / Ideal for" chips, a gallery (from §5), "Solicitar esta aeronave" CTA.

**Vuelos Panorámicos** (family landing page):
- H1 *Regala el cielo. / Give the gift of the sky.*
- Occasions grid: birthday, anniversary, proposal, corporate, photography.
- "Cómo funciona / How it works": 1 Choose → 2 We confirm weather and route → 3 Fly.
- Safety briefing reassurance and an FAQ (weight limits, children, what to wear, weather cancellations, gift vouchers).
- **No prices**: the CTA is "Consultar disponibilidad", which opens Heli or the form pre-filled with `service=scenic`.

**Nosotros:**
- Story timeline (M10): 1988 Bell 47 → oil-sector growth → Argentina/Peru operations → fleet modernisation (Bell 412/H125) → 2026.
- Values: Seguridad · Precisión · Familia · Servicio.
- "Our people" (photos of the real team; **request portraits from the client**).
- Certifications strip. Hangar 22 "Visit us" with map embed.

**Operaciones:** the full-screen map plus a filterable project list (year, sector, region).

**Cotizar** (multi-step, progress bar, Motion step transitions):
1. Tipo de misión (cards).
2. Fecha/s y flexibilidad.
3. Origen → destino (free text) and approximate passengers or cargo kg.
4. Datos de contacto (name, company optional, email, phone/WhatsApp, preferred language).
5. Review → submit.

On submit: write to Supabase, email via Resend, and show a confetti-free tasteful success state: *"Recibido. Un especialista le contactará en menos de 24 horas hábiles."* (*"Received. A specialist will contact you within one business day."*)

**Contacto:** the cards Phone/WhatsApp/Email/Visit, a short form, an emergency notice, and the dusk ramp photo.

---

## 8. Heli — the AI receptionist

**Persona:**
- **Heli** is Helibol's virtual receptionist. Warm, professional, concise, bilingual (it auto-detects ES/EN and replies in the user's language).
- It introduces itself as an AI assistant on first open, every time.
- Avatar: a small animated emblem whose globe rotates gently while Heli is "thinking", plus an orange status dot.

**UI:**
- Floating launcher bottom-right: a pill reading "Pregúntale a Heli / Ask Heli" with a pulsing dot. It opens a 400×640 glass panel; full-screen sheet on mobile.
- The header uses the B&W cockpit loop at 10% opacity.
- Streaming text, quick-reply chips, and a "Hablar con una persona / Talk to a human" button that opens WhatsApp deep-link and `tel:`.
- Opened from any "Hablar con Heli" CTA via a global store (zustand), with optional context, e.g. `openHeli({topic:'scenic'})`.
- Opening message: *"¡Hola! Soy Heli, la asistente virtual de Helibol ✈️ ¿En qué le puedo ayudar hoy?"* Chips: `Cotizar un vuelo` · `Vuelo panorámico` · `Emergencia` · `Nuestra flota` · `Hablar con una persona`.

**Backend:** `app/api/heli/route.ts`
- Anthropic SDK with `stream: true`, model `claude-haiku-5-5`, `max_tokens` 600.
- Prompt caching on the system prompt and knowledge base (`cache_control: {type: 'ephemeral'}`).
- **Tools (tool use):**
  - `capture_lead({name, phone?, email?, company?, service, date?, route?, pax_or_cargo?, language, notes})`: validates with zod, inserts into Supabase `leads`, triggers a Resend email to info@helibol.com, and returns `{ok, reference}`.
  - `get_service_info({slug})` and `get_aircraft_specs({model})`: return data from `content/*.ts`, the single source of truth.
  - `handoff_to_human({reason, urgency})`: returns the WhatsApp link and phone; urgency `emergency` makes the UI show a red call button.
- **Guardrails** (enforced in the system prompt and in code):
  - Never quote prices, availability or flight times as confirmed. Always say a specialist confirms.
  - Never give operational or safety-of-flight advice or weather go/no-go.
  - **Emergencies:** if the user describes a life-threatening situation, Heli immediately shows **+591 3 352 9469** and the national emergency numbers (verify the Bolivian numbers, e.g. 110 police / 118 ambulance / 119 fire) and keeps the reply short.
  - Off-topic → politely redirect.
  - Collect personal data only with consent ("¿Me permite tomar sus datos para que un especialista le contacte?").
- **Limits:** IP rate limit of 20 messages per 10 minutes (Upstash or Vercel KV); max 30 turns per conversation. Store the transcript in `heli_conversations` with a 90-day retention note in the privacy policy.
- **Env:** `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `HELIBOL_WHATSAPP`. Server only, never exposed to the client.

**System prompt** (put it in `lib/heli/system-prompt.ts`):
```
You are Heli, the virtual receptionist of HELIBOL S.R.L., a family-owned helicopter operator founded in 1988 and based at Hangar 22, El Trompillo Airport, Santa Cruz de la Sierra, Bolivia.
Tone: warm, professional, concise (max ~80 words per reply unless asked for detail). Reply in the user's language (Spanish by default; English if they write in English). Use "usted" in Spanish unless the user is informal.
Always state you are an AI assistant in your first message.
Your goals, in order: (1) help people quickly, (2) understand their mission, (3) with consent, capture their contact details using capture_lead so a specialist follows up within one business day.
For quotes, gather: service type, date(s), origin/destination or area, passengers or cargo weight, contact name + phone/WhatsApp or email. Ask at most 2 questions per message.
Never invent prices, availability, flight times, certifications, client names or specs; use get_service_info / get_aircraft_specs, and if unknown say a specialist will confirm.
Never give flight-safety, weather go/no-go, or medical advice.
EMERGENCY: if someone describes an active emergency, immediately give: Helibol 24/7 +591 3 352 9469 and local emergency services, call handoff_to_human with urgency "emergency", and keep it short.
If asked something unrelated to Helibol, politely steer back.
Facts: Fleet — Bell 212/212HP, Bell 412/412HP (VIP interior available), Airbus H125/AS350 B3. Services — energy & mining (seismic, drilling, camps, aeromagnetics), SAR & MEDEVAC, aerial firefighting (Bambi Bucket, 1,220 L), cargo & long-line, construction/inspection/survey, VIP & personnel transport, scenic flights, film & photography, turnkey aircraft sourcing. Operations in Bolivia, Argentina and Peru; 100+ exploration projects. Email info@helibol.com. Phone +591 3 352 9469.
```
**Knowledge base:** `lib/heli/knowledge.ts` is built from `content/services.ts`, `content/fleet.ts` and an FAQ list, and is injected as a cached system block.

---

## 9. Footer socials (`content/socials.ts`)

| Network | URL | Status |
|---|---|---|
| Instagram | `https://www.instagram.com/helibolhelicopters/` | ✅ Handle confirmed by the client's Drive folder name (`02_instagram_helibolhelicopters`) |
| Facebook | `https://www.facebook.com/helibol` | ⚠️ A Facebook page "HELIBOL" exists according to a third-party directory ([charterbroker.aero](https://www.charterbroker.aero/direct_detail.html?id=144921)). **Confirm the exact URL** |
| LinkedIn | `https://www.linkedin.com/company/helibol` | ⚠️ Confirm |
| WhatsApp | `https://wa.me/591XXXXXXXX` | ⚠️ **Client to supply the WhatsApp Business number** |
| YouTube / TikTok | — | Optional; only include if the accounts exist |

Render icons with `lucide-react` or `simple-icons` (Lucide has no brand icons, so prefer `simple-icons`). Each link gets `aria-label`, `rel="noopener"` and `target="_blank"`. **Hide any entry whose URL is empty**, so the site never shows dead links (which is exactly the current site's problem).

---

## 10. SEO, performance, accessibility

- **SEO:**
  - Per-page `generateMetadata` (ES/EN), hreflang alternates, canonical, sitemap.xml, robots.txt.
  - OG images generated with `@vercel/og` from the hero photo.
  - **JSON-LD:** `Organization` + `LocalBusiness` (sub-type `AirlineOrAirport`-adjacent; use `Organization` with `areaServed: BO, AR, PE`), `Service` per service page, and `FAQPage`.
  - Target keywords (ES): *servicio de helicópteros Bolivia, alquiler de helicóptero Santa Cruz, vuelo en helicóptero Santa Cruz, evacuación aeromédica Bolivia, combate de incendios helicóptero, transporte aéreo sísmica*.
  - **301 redirects:** `/about`→`/es/nosotros`, `/aeronaves`→`/es/flota`, `/services`→`/es/servicios`, `/contact-us`→`/es/contacto`, `/welcome-to-helibol-s-r-l`→`/es`, `/404-2`→`/es/servicios`.
- **Performance budget (mobile, 4G):**
  - LCP ≤ 2.0s, CLS < 0.05, INP < 200ms, Lighthouse ≥ 90 on all four categories.
  - JS ≤ 180 KB gzipped on initial load. Three.js is dynamically imported (`ssr:false`) only after idle and only on desktop, behind a `useMediaQuery('(min-width:1024px) and (pointer:fine)')` check.
  - Hero video loads after the poster paints.
- **A11y:**
  - WCAG 2.2 AA. Color contrast checked (white text on #1C75BC passes for large text only, so use `--hb-blue-deep` behind body text).
  - Focus rings, a skip link, the Heli panel as `role="dialog"` with focus trap and `aria-live="polite"` for streamed messages.
  - All motion respects reduced-motion. Captions/alt text are in ES/EN.

---

## 11. Build order (milestones for the coding agent)

1. **Scaffold:**
   - Next 15, TS, Tailwind v4, next-intl, fonts, tokens, ESLint/Prettier.
   - The `SmoothScroll` provider (Lenis + GSAP ticker) and `gsap.registerPlugin(...)` in a single client module.
2. **Media pipeline:**
   - Download the selected Drive files (§5) into `public/media/`.
   - Script `scripts/optimize-media.ts` (sharp) to produce AVIF/WebP sizes, and ffmpeg commands to re-encode video loops (`-crf 28 -an -movflags +faststart`, 720p/1080p, plus a poster).
   - Background-remove the Bell 412 / 212 cut-outs (remove.bg, or manually) → PNG/WebP with alpha.
3. **Content layer:** `content/{es,en}` JSON with all copy from §6–7; `services.ts`, `fleet.ts`, `operations.ts`, `socials.ts`.
4. **Motion primitives:** components M4, M5, M7, M11, M12, M14, M15, M16 plus a Storybook-lite `/dev/motion` page (noindex).
5. **Home**, section by section (§6), then inner templates (§7).
6. **3D:** RotorWashField, then BoliviaTopoMap (start with the SVG + DrawSVG fallback; add R3F if time allows).
7. **Quote flow + Supabase + Resend.**
8. **Heli** (API route, tools, UI, rate limit, logging).
9. **SEO / redirects / JSON-LD / OG.**
10. **QA:** Playwright, Lighthouse CI, reduced-motion pass, mobile device pass (iOS Safari + Android Chrome), ES/EN copy proofread.
11. **Deploy** to a Vercel preview → client review → DNS cut-over for helibol.com.

---

## 12. Facts to confirm with Helibol before launch (shown in a `TODO.md`, and blocking launch)

1. **Years:** use "Desde 1988 / 38 años" everywhere (consistent with their 2026 Instagram). Confirm.
2. **HAI Robert E. Trimble award:** year, and proof or an image. If it can't be verified, remove it.
3. **IOGP/OGP compliance wording:** any certificates (IS-BAO, ISO 9001/45001, DGAC Bolivia AOC number)?
4. **Current fleet:** how many of each type, and registrations (CP-2562, CP-2935, CP-3066 are visible in photos). Is the Bell 412 VIP interior still offered?
5. **Spec corrections:** the Bell 412 MTOW on the current site duplicates the 212's; the 212 payload says both 1,100 and 1,200 kg. Get the official sheets.
6. **WhatsApp Business number**, Facebook, LinkedIn and any other social URLs.
7. **Scenic flights:** are they actually offered to the public, from where, and is there a minimum party size? (Copy assumes yes, on request.)
8. **Hoist capability** for SAR (yes/no).
9. **Real testimonials and client logos**, with written permission.
10. **Team portraits and the founders' names/story** (for Nosotros), and high-res originals of the hangar-interior and cliff-top-crew thumbnails.
11. **ICAO code** for El Trompillo (SLET) and the HUD coordinates.
12. **Bolivian emergency numbers** for Heli's emergency message.

---

## 13. Verification checklist (definition of done)

- `pnpm build` passes with zero TS/ESLint errors; `pnpm start` and click through every route in both `/es` and `/en`.
- **Playwright:**
  - Nav links resolve (no 404s); quote form submits (Supabase row created, email sent in the Resend test mode).
  - Heli opens, streams a reply and calls `capture_lead` in a scripted conversation; the emergency prompt shows the call button.
  - Social links are all non-empty URLs.
- **Lighthouse CI** on `/es`, `/es/servicios/rescate-y-medevac`, `/es/flota/bell-412`: all ≥ 90 on mobile.
- Toggle the OS reduced-motion setting: no pinning or scrubbing, no WebGL, and all content is visible.
- Test on a real iPhone (Safari) + Android (Chrome): Lenis feels native, the vertical hero video plays inline (`playsInline muted autoPlay loop`), tilt cards are disabled on touch.
- Check with `curl -I` that every old WordPress URL in §10 returns a 301 to the new route.
- Validate JSON-LD with Google's Rich Results Test.

---
*Prepared from: live analysis of helibol.com (home, about, aeronaves, services, contact), a full visual review of the client Drive folder (≈80 images + 5 videos), and the brand colors extracted from the official SVG logos.*
