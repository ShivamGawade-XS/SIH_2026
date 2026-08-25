/**
 * Rate limiting helper adapted from CertXchange (https://github.com/ShivamGawade-XS/zerocert)
 * Author: Shivam Gawade (@ShivamGawade-XS)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback for local dev & demo
const memoryStore = new Map<string, { count: number; reset: number }>();

class FallbackRatelimit {
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    const now = Date.now();
    const entry = memoryStore.get(identifier);

    if (!entry || now > entry.reset) {
      memoryStore.set(identifier, { count: 1, reset: now + this.windowMs });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: entry.reset,
      };
    }

    entry.count += 1;
    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - entry.count,
      reset: entry.reset,
    };
  }
}

let redisClient: Redis | null = null;
if (redisUrl && redisToken && !redisUrl.includes("dummy")) {
  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  } catch (e) {
    console.warn("Failed to initialize Redis client, using in-memory rate limiter:", e);
  }
}

/**
 * Verification Rate Limiter: 100 requests per minute per IP
 */
export const verifyRateLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: false,
      prefix: "honeychain:verify",
    })
  : new FallbackRatelimit(100, 60000);

/**
 * Minting Rate Limiter: 20 batch mints per minute per officer
 */
export const mintRateLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: false,
      prefix: "honeychain:mint",
    })
  : new FallbackRatelimit(20, 60000);
