# Scroll-driven flight-path timeline (with flying helicopter)

How the "Desde 1988" timeline on **/nosotros** works, and how to rebuild it for a new feature.

Source of truth: [`components/sections/Timeline.tsx`](../components/sections/Timeline.tsx).

## What it does

As the user scrolls through the section:

1. A **curved flight path** draws itself down the page, weaving left and right through a dot at each milestone.
2. A **top-down helicopter** (with a spinning rotor) flies along the tip of the path and turns to face where it's going.
3. When the helicopter reaches a milestone, the **dot pops** with a shockwave ring, the **year scrambles** into place (digit roulette), the **copy fades up** and the **photo wipes in** from the side.
4. Photos **parallax** while on screen, and the first (heritage) photo goes from **sepia to full colour**.
5. With `prefers-reduced-motion`, everything is shown static and the helicopter is hidden.

## Stack

| Piece                  | Used for                                                     |
| ---------------------- | ------------------------------------------------------------ |
| GSAP `ScrollTrigger`   | Ties every animation to scroll position                      |
| GSAP `DrawSVGPlugin`   | Draws the path stroke from 0% → 100%                         |
| GSAP `MotionPathPlugin` | Moves and rotates the helicopter along the same SVG path    |
| GSAP `ScrambleTextPlugin` | Year "roulette" effect                                    |
| `@gsap/react` `useGSAP` | Scoped setup + automatic cleanup in React                   |
| Inline SVG             | The path and the helicopter glyph                            |
| `ResizeObserver`       | Rebuilds the path when the layout changes                    |

All GSAP plugins (including the former "Club" ones) are free since GSAP 3.13. Register them once:

```ts
// lib/gsap.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, ScrambleTextPlugin, useGSAP);
export { gsap, useGSAP };
```

`MotionPathPlugin` is registered only inside the component that needs it, so other pages don't pay for it:

```ts
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
if (typeof window !== "undefined") gsap.registerPlugin(MotionPathPlugin);
```

## The key idea: measure the DOM, then build the path from it

The path is **not** hand-drawn. The milestones are laid out with normal CSS (grid, alternating sides). Each one has a dot marked `data-dot`. After layout, we measure every dot's centre relative to the container and generate a smooth SVG path that passes through all of them. So the path always lines up with the content, at any screen size and any amount of text.

```tsx
const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);

useLayoutEffect(() => {
  const root = ref.current!;
  const measure = () => {
    const box = root.getBoundingClientRect();
    const dots = [...root.querySelectorAll<HTMLElement>("[data-dot]")].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    const wide = box.width >= 768;
    const d = buildPath(dots, wide ? 70 : 10, 0, box.height); // big swings on desktop, nearly straight on mobile
    setGeo((g) => (g && g.d === d ? g : { d, w: box.width, h: box.height }));
  };
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(root);
  return () => ro.disconnect();
}, []);
```

### Path builder

A chain of cubic Béziers from the top edge, through every dot, to the bottom edge. Control points are pushed sideways by `amp`, alternating direction on each segment. That's what makes the line "weave" like a flight path instead of zig-zagging.

```ts
function buildPath(points: { x: number; y: number }[], amp: number, top: number, bottom: number) {
  if (!points.length) return "";
  const pts = [{ x: points[0].x, y: top }, ...points, { x: points.at(-1)!.x, y: bottom }];
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const s = i % 2 ? 1 : -1;            // alternate bulge direction
    const dy = b.y - a.y;
    d += ` C${a.x + amp * s},${a.y + dy * 0.35} ${b.x + amp * s},${b.y - dy * 0.35} ${b.x},${b.y}`;
  }
  return d;
}
```

Tune `amp` for how wide the swings are and `0.35` for how "loose" the curves feel.

## Markup

The SVG sits absolutely over the list, sized to the container in **pixels** (`viewBox = 0 0 w h`). Path coordinates are then the same as the measured DOM coordinates. It has three layers:

1. A faint **dashed guide** (always visible, shows the route ahead).
2. The **drawn path** (`data-path`) with a gradient stroke, which gets animated.
3. The **helicopter** group (`data-heli`).

```tsx
<div ref={ref} className="relative overflow-x-clip">
  {geo && (
    <svg aria-hidden className="pointer-events-none absolute inset-0 overflow-visible"
         width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
      <path d={geo.d} fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
      <path data-path d={geo.d} fill="none" stroke="url(#tl-grad)" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        {/* userSpaceOnUse so the gradient runs top→bottom of the whole timeline */}
        <linearGradient id="tl-grad" x1="0" y1="0" x2="0" y2={geo.h} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2A23A" />
          <stop offset="35%" stopColor="#1C75BC" />
          <stop offset="100%" stopColor="#0B3A63" />
        </linearGradient>
      </defs>
      <HeliGlyph />
    </svg>
  )}

  <ol className="relative space-y-24 md:space-y-40">
    {items.map((it, i) => (
      <li key={it.title} data-item className="relative grid items-center gap-8 pl-12 md:grid-cols-2 md:gap-28 md:pl-0">
        {/* Dot: left gutter on mobile, centre column on desktop */}
        <span aria-hidden className="absolute top-2 left-4 z-10 -translate-x-1/2 md:top-1/2 md:left-1/2 md:-translate-y-1/2">
          <span data-ring className="absolute inset-0 rounded-full border-2 border-hb-sunset opacity-0" />
          <span data-dot className="relative block size-4 rounded-full border-[3px] border-hb-blue bg-white" />
        </span>
        <div data-copy>{/* data-year + h3 + p */}</div>
        <div data-media className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
          <div data-photo className="absolute inset-x-0 -inset-y-[10%]">{/* <Image> (taller than frame, for parallax) */}</div>
        </div>
      </li>
    ))}
  </ol>
</div>
```

Alternate sides on desktop by swapping `order-1` / `order-2` on copy and media for even/odd items.

### The helicopter glyph

A tiny top-down helicopter drawn in a 28×28 box, centred on the origin (`translate(-14,-14)`) so MotionPath can align its centre to the path. The rotor is a separate `<g>` spun with CSS so it keeps turning even when scroll stops:

```tsx
function HeliGlyph() {
  return (
    <g data-heli>
      <g transform="scale(1.6) translate(-14,-14)">
        <ellipse cx="14" cy="16" rx="5" ry="7.5" fill="#1C75BC" stroke="white" strokeWidth="1.5" /> {/* cabin */}
        <rect x="13" y="22" width="2" height="12" rx="1" fill="#1C75BC" />                          {/* tail boom */}
        <rect x="9.5" y="32" width="9" height="2" rx="1" fill="#1C75BC" />                          {/* tail rotor */}
        <g className="origin-[14px_15px] animate-[spin_0.35s_linear_infinite] motion-reduce:animate-none">
          <line x1="0" y1="15" x2="28" y2="15" stroke="#06131F" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="14" y1="1" x2="14" y2="29" stroke="#06131F" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <circle cx="14" cy="15" r="1.8" fill="#F2A23A" /> {/* rotor hub */}
      </g>
    </g>
  );
}
```

Swap this for any SVG (a plane, a drone, your logo). Keep it centred on (0,0) and pointing **up** in its own drawing. `autoRotate: 90` below corrects for that.

## The animations

Everything is inside one `useGSAP` call that re-runs whenever the path changes (`dependencies: [geo?.d]`, `revertOnUpdate: true`), so a resize kills the old tweens and builds fresh ones against the new path.

### 1. Draw the path + fly the helicopter (same scroll window)

Both use the **same** ScrollTrigger range and scrub, so the helicopter is always exactly at the tip of the drawn line.

```ts
const path = root.querySelector<SVGPathElement>("[data-path]")!;
const heli = root.querySelector<SVGGElement>("[data-heli]");
const flight = { start: "top 62%", end: "bottom 62%" }; // the "reading line" sits 62% down the viewport

gsap.fromTo(path, { drawSVG: "0%" },
  { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: root, ...flight, scrub: 0.6 } });

gsap.to(heli, {
  ease: "none",
  motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: 90 },
  scrollTrigger: { trigger: root, ...flight, scrub: 0.6 },
});
```

- `ease: "none"` is essential: progress must map linearly to scroll, or the heli drifts off the line tip.
- `scrub: 0.6` adds ~0.6 s of smoothing, which gives a nice "inertia" feel.
- `autoRotate: 90` turns the heli to face along the path. The +90° is because the glyph points up and MotionPath assumes "right".
- `62%` is the reading line. Milestones trigger at the same line (below), so the heli "arrives" exactly when a milestone animates in.

### 2. Milestone reveal (fires when its dot crosses the reading line)

```ts
root.querySelectorAll<HTMLElement>("[data-item]").forEach((item, i) => {
  const dot = item.querySelector("[data-dot]");
  const ring = item.querySelector("[data-ring]");
  const year = item.querySelector<HTMLElement>("[data-year]");
  const copy = item.querySelectorAll("[data-copy] > :not([data-year])");
  const media = item.querySelector("[data-media]");
  const fromLeft = i % 2 === 0;

  gsap.timeline({ scrollTrigger: { trigger: dot, start: "center 62%", toggleActions: "play none none reverse" } })
    .from(dot, { scale: 0, duration: 0.6, ease: "back.out(3)" })                                  // pop
    .fromTo(ring, { scale: 0.4, autoAlpha: 0.9 }, { scale: 2.6, autoAlpha: 0, duration: 1, ease: "power2.out" }, "<") // shockwave
    .from(year, {
      autoAlpha: 0, scale: 0.7, duration: 0.8, ease: "expo.out",
      scrambleText: {
        text: year?.textContent ?? "",
        chars: /^\d+$/.test(year?.textContent ?? "") ? "0123456789" : "upperAndLowerCase",
        speed: 0.6,
      },
    }, "<")
    .from(copy, { autoAlpha: 0, y: 24, duration: 0.8, stagger: 0.08, ease: "expo.out" }, "<0.1")
    .fromTo(media,
      { clipPath: fromLeft ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", x: fromLeft ? 40 : -40 },
      { clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: 1.2, ease: "expo.out" }, "<");
});
```

`toggleActions: "play none none reverse"` replays it backwards when the user scrolls back up past the dot, so the timeline "un-flies".

### 3. Photo parallax + sepia → colour

```ts
gsap.fromTo(item.querySelector("[data-photo]"), { yPercent: -8 }, {
  yPercent: 8, ease: "none",
  scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
});

const sepia = item.querySelector("[data-sepia]"); // only on the first (oldest) photo
if (sepia) gsap.fromTo(sepia,
  { filter: "sepia(1) saturate(0.6) contrast(1.05)" },
  { filter: "sepia(0) saturate(1) contrast(1)", ease: "none",
    scrollTrigger: { trigger: item, start: "top 75%", end: "bottom 45%", scrub: true } });
```

The photo wrapper is 20% taller than its frame (`-inset-y-[10%]`) so the ±8% movement never shows an edge.

### 4. Reduced motion

```ts
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  gsap.set(path, { drawSVG: "100%" });
  if (heli) gsap.set(heli, { autoAlpha: 0 });
  return; // no other tweens: content is visible by default
}
```

Content is never hidden in CSS. GSAP's `.from()` hides it only once JS is running, so no-JS and reduced-motion users see everything.

## Replicating it in a new feature: checklist

1. **Content:** an array of `{ year, title, body }` (plus an image per item).
2. **Layout first:** build the list with plain CSS. Put a `data-dot` element wherever the path should pass through each item.
3. **Measure → `buildPath`** in `useLayoutEffect` + `ResizeObserver`. Store `{ d, w, h }` in state.
4. **Render the SVG** absolutely over the container with `viewBox="0 0 w h"`: guide path, `data-path`, your vehicle glyph centred on (0,0) pointing up.
5. **One `useGSAP`** keyed on `geo.d` with `revertOnUpdate: true`:
   - DrawSVG `0% → 100%` and MotionPath on the **same** trigger range, `ease: "none"`, same `scrub`.
   - Per-item timeline triggered at the **same reading line** (`center 62%`).
6. **Reduced motion:** draw the path fully, hide the vehicle, skip the tweens.
7. Container needs `position: relative` and `overflow-x: clip`, so wide curves and slide-ins don't cause horizontal scroll.

### Common variations

- **Horizontal timeline:** pin the section and drive a horizontal track (see `ServicesRail.tsx`). Build the path from x-sorted dots with `top/bottom` replaced by `left/right` and the bulge applied to `y`.
- **Different vehicle:** any SVG glyph. Adjust `autoRotate` (0 if it points right, 90 if it points up, 180 if it points left).
- **Trail behind the vehicle:** add a second `data-path` copy with a blur filter and `drawSVG: "0% 100%" → "95% 100%"` so only a short glowing segment follows the heli.
- **Snap to milestones:** add `snap: { snapTo: dotProgresses }` to the flight ScrollTrigger, where `dotProgresses` = each dot's `y / h`.

### Gotchas

- Measure **after fonts load**. `ResizeObserver` catches the height change when web fonts swap in. Without it the path drifts off the dots.
- Keep `geo` in state only when `d` actually changes (`g.d === d ? g : …`), or you get an infinite re-render/re-animate loop.
- Use `gradientUnits="userSpaceOnUse"` on the stroke gradient. With the default (objectBoundingBox) a nearly-vertical path gets a degenerate gradient.
- If the page uses Lenis smooth scroll, make sure Lenis calls `ScrollTrigger.update` on scroll (see `components/motion/SmoothScroll.tsx`).
