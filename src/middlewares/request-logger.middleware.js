import { createMiddleware } from "hono/factory";
export const requestLoggerMiddleware = createMiddleware(async (c, next) => {
    const start = Date.now();
    await next();
    const end = Date.now();
    console.log({
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration: `${end - start}ms`,
        userAgent: c.req.header('User-Agent'),
        ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')
    });
});
