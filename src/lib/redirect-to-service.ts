import { Context } from "hono";

export class RedirectToService {
  static async handle(c: Context, serviceUrl: string, pathPrefix: string, timeout: number = 5000) {
    const originalPath = c.req.path;
    const servicePath = originalPath.replace(`/api${pathPrefix}`, pathPrefix);
    let url: URL;

    try {
      console.log('RedirectToService params:', { serviceUrl, pathPrefix, timeout, originalPath, servicePath });

      const headers = {} as Record<string, string>;
      for (const [key, value] of Object.entries(c.req.header())) {
        if (!['host', 'content-length'].includes(key.toLowerCase())) {
          headers[key] = value;
        }
      }

      // Ensure required headers for EC2 services
      if (!headers['Authorization'] && c.req.header('Authorization')) {
        headers['Authorization'] = c.req.header('Authorization')!;
      }

      if (!headers['Content-Type'] && c.req.method !== 'GET') {
        headers['Content-Type'] = 'application/json';
      }

      url = new URL(servicePath, serviceUrl);
      console.log('Final URL:', url.toString());

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

      const init: RequestInit = {
        method: c.req.method,
        headers,
        signal: controller.signal,
      };

      if (!['GET', 'HEAD'].includes(c.req.method)) {
        init.body = await c.req.arrayBuffer();
      }

      const response = await fetch(url.toString(), init);
      clearTimeout(timeoutId);

      const proxiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText
      });

      for (const [key, value] of response.headers.entries()) {
        if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          proxiedResponse.headers.set(key, value);
        }
      }

      for (const [key, value] of c.res.headers.entries()) {
        proxiedResponse.headers.set(key, value);
      }

      return proxiedResponse;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return c.json({
          error: 'Request timeout',
          message: 'Service did not respond within the timeout period'
        }, 504);
      }

      console.error('Service connection error:', {
        error: error instanceof Error ? error.message : String(error),
        serviceUrl,
        servicePath,
        finalUrl: url?.toString() || 'URL not constructed'
      });

      return c.json({
        error: 'Service temporarily unavailable',
        message: 'Failed to connect to target service',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 503);
    }
  }
}
