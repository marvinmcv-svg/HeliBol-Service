import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const alt = "Helibol — Vertical Efficiency · Est. 1988";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image from the Mountain-Edge hero photo (plan §10). */
export default async function OG({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const root = process.cwd();
  const photo = await sharp(path.join(root, "public/media/img/hero-mountain-edge.jpg"))
    .resize(1200, 630, { fit: "cover" })
    .jpeg({ quality: 80 })
    .toBuffer();
  const logo = await readFile(path.join(root, "public/media/logos/helibol-white.svg"));
  const title =
    locale === "es" ? "Donde terminan los caminos, empezamos nosotros." : "Where the roads end, we begin.";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      <img
        src={`data:image/jpeg;base64,${photo.toString("base64")}`}
        width={1200}
        height={630}
        style={{ position: "absolute", inset: 0 }}
        alt=""
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(6,19,31,0.9) 0%, rgba(6,19,31,0.4) 60%, rgba(6,19,31,0.1) 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          width: "100%",
          color: "white",
          position: "relative",
        }}
      >
        <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} width={216} height={72} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <div style={{ fontSize: 18, letterSpacing: 6, color: "#F2A23A" }}>{site.brandLine}</div>
          <div style={{ fontSize: 64, lineHeight: 1.02, marginTop: 20 }}>{title}</div>
        </div>
      </div>
    </div>,
    size,
  );
}
