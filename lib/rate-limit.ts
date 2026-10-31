import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 20; // plan §8: 20 messages / 10 minutes / IP

const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(LIMIT, "10 m"),
        prefix: "heli",
      })
    : null;

// Fallback for local dev / single instance. Not shared across serverless instances — configure Upstash in production.
const memory = new Map<string, number[]>();

export async function rateLimit(key: string, limit = LIMIT): Promise<boolean> {
  if (upstash && limit === LIMIT) return (await upstash.limit(key)).success;
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= limit) return false;
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) memory.clear();
  return true;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
}
