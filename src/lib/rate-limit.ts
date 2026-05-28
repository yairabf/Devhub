import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimitWindow = `${number} ${"s" | "m" | "h" | "d"}`;

type LimiterConfig = {
  limit: number;
  window: LimitWindow;
  prefix: string;
};

export const RATE_LIMITS = {
  login: { limit: 5, window: "15 m", prefix: "rl:login" },
  register: { limit: 3, window: "1 h", prefix: "rl:register" },
  forgotPassword: { limit: 3, window: "1 h", prefix: "rl:forgot" },
  resetPassword: { limit: 5, window: "15 m", prefix: "rl:reset" },
  resendVerification: { limit: 3, window: "15 m", prefix: "rl:resend" },
} as const satisfies Record<string, LimiterConfig>;

export type RateLimitKey = keyof typeof RATE_LIMITS;

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  return redisClient;
}

const limiterCache = new Map<RateLimitKey, Ratelimit>();

function getLimiter(key: RateLimitKey): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const cached = limiterCache.get(key);
  if (cached) return cached;
  const cfg = RATE_LIMITS[key];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.limit, cfg.window),
    prefix: cfg.prefix,
    analytics: false,
  });
  limiterCache.set(key, limiter);
  return limiter;
}

export type RateLimitResult =
  | { success: true }
  | { success: false; retryAfterSeconds: number };

export async function rateLimit(
  key: RateLimitKey,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(key);
  if (!limiter) return { success: true };
  try {
    const result = await limiter.limit(identifier);
    if (result.success) return { success: true };
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    return { success: false, retryAfterSeconds };
  } catch {
    return { success: true };
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { success: false, error: rateLimitMessage(retryAfterSeconds) },
    {
      status: 429,
      headers: { "Retry-After": retryAfterSeconds.toString() },
    },
  );
}
