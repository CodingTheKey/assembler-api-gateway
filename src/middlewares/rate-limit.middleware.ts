import { Context } from "hono";
import { createMiddleware } from "hono/factory";

export const RateLimitMiddleware = createMiddleware(
  async (c: Context, next: () => Promise<void>) => {
    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `rate_limit:${clientIP}`;

    // TODO: Implement rate limiting logic
    // For now, just pass through
    await next();
  }
)