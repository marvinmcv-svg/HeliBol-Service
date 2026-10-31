import { expect, test } from "@playwright/test";

const routes = [
  "",
  "/servicios",
  "/servicios/energia-y-mineria",
  "/servicios/rescate-y-medevac",
  "/servicios/combate-de-incendios",
  "/servicios/carga-y-construccion",
  "/servicios/vip-y-turismo",
  "/servicios/cine-y-fotografia",
  "/flota",
  "/flota/bell-212",
  "/flota/bell-412",
  "/flota/h125",
  "/operaciones",
  "/vuelos-panoramicos",
  "/nosotros",
  "/cotizar",
  "/contacto",
  "/privacidad",
  "/terminos",
];

test.describe("routes", () => {
  for (const locale of ["es", "en"]) {
    for (const r of routes) {
      test(`${locale}${r || "/"} renders @mobile`, async ({ request }) => {
        const res = await request.get(`/${locale}${r}`);
        expect(res.status(), `/${locale}${r}`).toBe(200);
        const html = await res.text();
        expect(html).toMatch(/hreflang="en"/i);
        expect(html).toMatch(/<h1[\s>]/);
      });
    }
  }

  test("every internal link resolves (no 404s)", async ({ page, request }) => {
    const seen = new Set<string>();
    for (const locale of ["es", "en"]) {
      await page.goto(`/${locale}`);
      const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")!));
      hrefs.forEach((h) => seen.add(h.split("#")[0]!));
    }
    for (const href of seen) {
      const res = await request.get(href);
      expect(res.status(), href).toBeLessThan(400);
    }
  });

  test("unknown path shows the localized 404", async ({ request }) => {
    const res = await request.get("/es/no-existe");
    expect(res.status()).toBe(404);
  });
});

test("legacy WordPress URLs 301 to new routes", async ({ request }) => {
  const map: Record<string, string> = {
    "/about": "/es/nosotros",
    "/aeronaves": "/es/flota",
    "/services": "/es/servicios",
    "/contact-us": "/es/contacto",
    "/welcome-to-helibol-s-r-l": "/es",
    "/404-2": "/es/servicios",
  };
  for (const [from, to] of Object.entries(map)) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(301);
    expect(new URL(res.headers()["location"]!, "http://x").pathname, from).toBe(to);
  }
});

test("social links are all non-empty URLs", async ({ page }) => {
  await page.goto("/es");
  const links = await page.$$eval("footer a[target=_blank][aria-label]", (as) =>
    as.map((a) => a.getAttribute("href") ?? ""),
  );
  expect(links.length).toBeGreaterThan(0);
  for (const l of links) expect(l).toMatch(/^https?:\/\/.+/);
});

test("quote form submits through all five steps", async ({ page }) => {
  await page.goto("/es/cotizar");
  await page.getByText("Vuelo panorámico", { exact: true }).click();
  await expect(page.getByText("Paso 2 de 5")).toBeVisible();
  await page.getByLabel("Fecha de inicio").fill("2026-12-20");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByLabel("Origen o zona de operación").fill("Santa Cruz");
  await page.getByLabel("Pasajeros aprox.").fill("3");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await page.getByLabel("Nombre completo").fill("Prueba Playwright");
  await page.getByLabel("Correo electrónico").fill("qa@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("Revise su solicitud")).toBeVisible();
  await page.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByRole("status")).toContainText(/HB-[0-9A-F]{6}/);
});

test("quote form blocks a step with missing data", async ({ page }) => {
  await page.goto("/es/cotizar?type=energy");
  await page.getByRole("button", { name: "Siguiente" }).click();
  await expect(page.getByText("Campo obligatorio").first()).toBeVisible();
});

test.describe("Heli", () => {
  test("opens, streams a reply and shows the captured lead", async ({ page }) => {
    // Scripted conversation: the API is mocked so the test doesn't need an Anthropic key.
    let body: { messages: { role: string; content: string }[] } | undefined;
    await page.route("**/api/heli", async (route) => {
      body = route.request().postDataJSON();
      const lines = [
        { type: "text", text: "¡Perfecto, Ana! " },
        { type: "text", text: "Registré su solicitud." },
        { type: "lead", reference: "HB-ABC123" },
        { type: "done" },
      ];
      await route.fulfill({
        status: 200,
        contentType: "application/x-ndjson",
        body: lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
      });
    });
    await page.goto("/es");
    await page.getByRole("button", { name: /Pregúntale a Heli/ }).click();
    const dialog = page.getByRole("dialog", { name: "Heli" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Soy Heli");
    await dialog.getByRole("textbox").fill("Soy Ana, 70000000, quiero un vuelo panorámico");
    await dialog.getByRole("button", { name: "Enviar" }).click();
    await expect(dialog).toContainText("Registré su solicitud.");
    await expect(dialog).toContainText("HB-ABC123");
    expect(body?.messages.at(-1)?.content).toContain("Ana");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("emergency chip shows the call button", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("button", { name: /Pregúntale a Heli/ }).click();
    const dialog = page.getByRole("dialog", { name: "Heli" });
    await dialog.getByRole("button", { name: "Emergencia" }).click();
    await expect(dialog.getByRole("link", { name: /Llamar a Helibol 24\/7/ })).toHaveAttribute(
      "href",
      "tel:+59133529469",
    );
  });

  test("API rejects malformed requests", async ({ request }) => {
    const res = await request.post("/api/heli", { data: { nope: true } });
    expect([400, 503]).toContain(res.status());
  });
});

test.describe("reduced motion", () => {
  test.use({ colorScheme: "dark", reducedMotion: "reduce" });
  test("no pinning, no WebGL, all content visible", async ({ page }) => {
    await page.goto("/es");
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("canvas").count()).toBe(0);
    expect(await page.locator(".pin-spacer").count()).toBe(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByText("Cuéntenos su misión. Nosotros nos encargamos del resto.")).toBeVisible();
  });
});
