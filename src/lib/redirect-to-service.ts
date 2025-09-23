import { Context } from "hono";

export class RedirectToService {
  static async handle(c: Context, serviceUrl: string, pathPrefix: string, timeout: number = 5000) {
    try {
      const originalPath = c.req.path;
      const servicePath = originalPath.replace(`/api${pathPrefix}`, pathPrefix);

      const headers = {} as Record<string, string>;
      for (const [key, value] of Object.entries(c.req.header())) {
        if (!['host', 'content-length'].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      }

      const url = new URL(servicePath, serviceUrl);

      if (c.req.queries()) {
        for (const [key, value] of Object.entries(c.req.queries())) {
          if (Array.isArray(value)) {
            for (const v of value) {
              url.searchParams.append(key, String(v));
            }
          } else if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const request = new Request(url.href, {
        method: c.req.method,
        headers,
        body: ['GET', 'HEAD'].includes(c.req.method) ? null : await c.req.arrayBuffer(),
        signal: controller.signal
      });

      const response = await fetch(request);
      clearTimeout(timeoutId);

      const responseHeaders = {} as Record<string, string>;
      for (const [key, value] of response.headers.entries()) {
        if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          responseHeaders[key] = value;
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      console.error('Redirect to service error:', error);

      if (error instanceof Error && error.name === 'AbortError') {
        return c.json({
          error: 'Request timeout',
          message: 'Service did not respond within the timeout period'
        }, 504);
      }

      return c.json({
        error: 'Service temporarily unavailable',
        message: 'Failed to connect to target service',
        timestamp: new Date().toISOString()
      }, 503);
    }
  }
}