import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";

/**
 * End-to-end screen test: every page, both locales, desktop + phone. Scrolls the full page so
 * scroll-triggered animations run, saves a screenshot per viewport-height step
 * (test-results/screens/<project>/…) and fails on console errors, broken images or
 * horizontal overflow.
 */
const pages = [
  "/es",
  "/es/servicios",
  "/es/servicios/rescate-y-medevac",
  "/es/servicios/energia-y-mineria",
  "/es/flota",
  "/es/flota/bell-412",
  "/es/flota/h125",
  "/es/operaciones",
  "/es/vuelos-panoramicos",
  "/es/nosotros",
  "/es/cotizar",
  "/es/contacto",
  "/es/privacidad",
  "/en",
  "/en/servicios/combate-de-incendios",
  "/en/flota/bell-212",
  "/en/vuelos-panoramicos",
  "/en/nosotros",
  "/en/contacto",
];

// Third-party / environment noise that isn't a site bug.
const ignored = [
  /_vercel\/insights/,
  /Failed to load resource.*404.*insights/i,
  /GL Driver Message/,
  /THREE\.Clock/,
  /WebGL/i,
  /maps\.google|google\.com\/maps/i,
];

async function scrollThrough(page: Page, dir: string, name: string) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize()!.height;
  let i = 0;
  for (let y = 0; y < height; y += vh * 0.9, i++) {
    await page.mouse.wheel(0, i === 0 ? 0 : vh * 0.9);
    await page.waitForTimeout(700);
    if (i < 14)
      await page.screenshot({
        path: `${dir}/${name}-${String(i).padStart(2, "0")}.jpg`,
        type: "jpeg",
        quality: 55,
      });
  }
  // Settle at the bottom so the footer/wordmark is captured.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/${name}-zz-bottom.jpg`, type: "jpeg", quality: 55 });
}

for (const path of pages) {
  test(`screen: ${path} @mobile`, async ({ page }, info) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on(
      "console",
      (m) => m.type() === "error" && !ignored.some((r) => r.test(m.text())) && errors.push(m.text()),
    );
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("hb-preloaded", "1");
        localStorage.setItem("hb-consent", "denied");
      } catch {}
    });
    await page.goto(path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const dir = `test-results/screens/${info.project.name}`;
    mkdirSync(dir, { recursive: true });
    const name = path.replace(/^\//, "").replace(/\//g, "_") || "root";
    await scrollThrough(page, dir, name);

    // No horizontal overflow — the most common mobile layout bug.
    const overflow = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.right <= w + 1) return false;
          // Ignore fixed UI (can't cause sideways scroll) and content inside scrollable/clipped containers.
          if (getComputedStyle(el).position === "fixed") return false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const cs = getComputedStyle(p);
            if (cs.position === "fixed" || /(auto|scroll|hidden|clip)/.test(cs.overflowX)) return false;
          }
          return true;
        })
        .slice(0, 5)
        .map(
          (el) =>
            `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → right ${Math.round(el.getBoundingClientRect().right)} > ${w}`,
        );
      return { scrollWidth: document.documentElement.scrollWidth, width: w, offenders };
    });
    expect(overflow.offenders, `elements wider than the viewport on ${path}`).toEqual([]);
    expect(overflow.scrollWidth, `page scrolls sideways on ${path}`).toBeLessThanOrEqual(overflow.width + 1);

    // Every image that should have loaded did.
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== "lazy")
        .map((i) => i.currentSrc || i.src),
    );
    expect(broken, `broken images on ${path}`).toEqual([]);

    // Primary CTAs are comfortably tappable on phones.
    if (info.project.name === "mobile") {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("main a.rounded-full, main button.rounded-full")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.width > 0 && r.height > 0 && r.height < 40 && getComputedStyle(el).visibility !== "hidden"
            );
          })
          .slice(0, 5)
          .map(
            (el) =>
              `${el.textContent?.trim().slice(0, 30)} (${Math.round(el.getBoundingClientRect().height)}px)`,
          ),
      );
      expect.soft(small, `small tap targets on ${path}`).toEqual([]);
    }

    expect(errors, `console errors on ${path}`).toEqual([]);
  });
}
