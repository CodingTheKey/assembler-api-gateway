import { createMiddleware } from "hono/factory";

export const verifyTokenServicesMiddleware = createMiddleware(
  async (c, next) => {
    // TODO: Implement token verification logic
    // For now, just pass through
    return next()
  }
)