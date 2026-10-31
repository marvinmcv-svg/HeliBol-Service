/**
 * Media pipeline (plan §5 / §11.2).
 *
 *   pnpm media           # after ./scripts/download-media.sh
 *
 * - Images → public/media/img/<name>.jpg (max 2560px, mozjpeg). next/image serves
 *   AVIF/WebP at 640/1080/1920/2560 from these masters on demand.
 * - Blur placeholders → content/media-blur.json (tiny base64 webp).
 * - Bell 412 cut-out → public/media/img/bell412-cutout.webp (alpha), made by
 *   flood-filling the near-white sky from the borders.
 * - Video loops → public/media/video/* via ffmpeg (H.264 + VP9, no audio, faststart) + posters.
 * - Logos are copied as-is to public/media/logos.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(__dirname, "..");
const src = path.join(root, "media-src");
const outImg = path.join(root, "public/media/img");
const outVid = path.join(root, "public/media/video");
const outLogo = path.join(root, "public/media/logos");
for (const d of [outImg, outVid, outLogo]) mkdirSync(d, { recursive: true });

async function images() {
  const blur: Record<string, { w: number; h: number; blur: string }> = {};
  for (const file of readdirSync(path.join(src, "images"))) {
    const name = file.replace(/\.jpe?g$/i, "");
    const input = sharp(path.join(src, "images", file)).rotate();
    const meta = await input.metadata();
    const out = path.join(outImg, `${name}.jpg`);
    const info = await input
      .clone()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true, progressive: true })
      .toFile(out);
    const tiny = await input.clone().resize(16).webp({ quality: 40 }).toBuffer();
    blur[name] = {
      w: info.width,
      h: info.height,
      blur: `data:image/webp;base64,${tiny.toString("base64")}`,
    };
    console.log(`✓ ${name} ${meta.width}×${meta.height} → ${info.width}×${info.height}`);
  }
  writeFileSync(path.join(root, "content/media-blur.json"), JSON.stringify(blur, null, 2) + "\n");
}

/** Remove the near-white sky behind the Bell 412 (B212HLB-COV4 — actually a 412). */
async function cutout() {
  const { data, info } = await sharp(path.join(src, "images/bell412-white-sky.jpg"))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const isSky = (i: number) => {
    const r = data[i * 4]!,
      g = data[i * 4 + 1]!,
      b = data[i * 4 + 2]!;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    return min > 205 && max - min < 28;
  };
  const visited = new Uint8Array(W * H);
  const stack: number[] = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const p = stack.pop()!;
    if (visited[p] || !isSky(p)) continue;
    visited[p] = 1;
    const x = p % W,
      y = (p / W) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < W - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - W);
    if (y < H - 1) stack.push(p + W);
  }
  // Alpha = not-sky, softened with a 3×3 box filter so the edge doesn't look cut with scissors.
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let solid = 0,
        n = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx,
            yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          n++;
          if (!visited[yy * W + xx]) solid++;
        }
      data[(y * W + x) * 4 + 3] = Math.round((255 * solid) / n);
    }
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(path.join(outImg, "bell412-cutout.webp"));
  console.log("✓ bell412-cutout.webp");
}

function ff(args: string[]) {
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
}

function videos() {
  const v = (f: string) => path.join(src, "videos", f);
  const o = (f: string) => path.join(outVid, f);
  const h264 = [
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
  ];
  const vp9 = ["-an", "-c:v", "libvpx-vp9", "-crf", "44", "-b:v", "0", "-row-mt", "1"];

  // HERO — 4–14s segment. Desktop: centre-cropped 16:9. Mobile: native vertical.
  const seg = ["-ss", "4", "-t", "10"];
  const wide = "crop=720:405:0:(ih-405)/2,scale=1280:720:flags=lanczos";
  ff([...seg, "-i", v("mission-ready.mp4"), "-vf", wide, ...h264, o("hero-desktop.mp4")]);
  ff([...seg, "-i", v("mission-ready.mp4"), "-vf", wide, ...vp9, o("hero-desktop.webm")]);
  const h264m = h264.map((a) => (a === "28" ? "31" : a));
  ff([...seg, "-i", v("mission-ready.mp4"), "-vf", "scale=720:1280", ...h264m, o("hero-mobile.mp4")]);
  ff([
    ...seg,
    "-i",
    v("mission-ready.mp4"),
    "-vf",
    "scale=720:1280",
    ...vp9.map((a) => (a === "44" ? "48" : a)),
    o("hero-mobile.webm"),
  ]);
  ff([
    "-ss",
    "4",
    "-i",
    v("mission-ready.mp4"),
    "-frames:v",
    "1",
    "-vf",
    wide,
    "-q:v",
    "3",
    o("hero-desktop-poster.jpg"),
  ]);
  ff(["-ss", "4", "-i", v("mission-ready.mp4"), "-frames:v", "1", "-q:v", "3", o("hero-mobile-poster.jpg")]);

  // Micro-loops.
  ff(["-t", "8", "-i", v("crew-boarding.mp4"), "-vf", "scale=540:-2", ...h264, o("crew-boarding.mp4")]);
  ff([
    "-ss",
    "1",
    "-i",
    v("crew-boarding.mp4"),
    "-frames:v",
    "1",
    "-vf",
    "scale=540:-2",
    "-q:v",
    "4",
    o("crew-boarding-poster.jpg"),
  ]);
  ff(["-i", v("cockpit.mp4"), "-vf", "scale=360:-2", ...h264, o("cockpit.mp4")]);
  ff(["-ss", "2", "-i", v("cockpit.mp4"), "-frames:v", "1", "-q:v", "4", o("cockpit-poster.jpg")]);
  console.log("✓ videos");
}

function logos() {
  for (const f of readdirSync(path.join(src, "logos")))
    copyFileSync(path.join(src, "logos", f), path.join(outLogo, f));
  console.log("✓ logos");
}

(async () => {
  if (!existsSync(src)) throw new Error("media-src/ missing — run ./scripts/download-media.sh first");
  mkdirSync(path.join(root, "content"), { recursive: true });
  logos();
  await images();
  await cutout();
  if (!process.argv.includes("--no-video")) videos();
})();
