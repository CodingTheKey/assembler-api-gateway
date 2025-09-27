import { Context, Hono } from 'hono';
import { getEnv } from '../env';

// Helper function to add CORS headers to legacy route responses
function addCorsHeaders(c: Context) {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Expose-Headers', 'Content-Disposition, X-Response-Time');
}

export async function setupLegacyRoutes(app: Hono) {
  const env = getEnv();
  app.options('*', async (c: Context) => {
    addCorsHeaders(c);
    return c.text('', 204);
  });

  // Auth routes
  app.post('/auth/login', async (c: Context) => {
    try {
      const body = await c.req.json();
      const response = await fetch(`${env.LEGACY_AUTH_SERVICE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': c.req.header('Authorization') || '',
        },
        body: JSON.stringify(body)
      });

      // Add CORS headers
      addCorsHeaders(c);

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      addCorsHeaders(c);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Associate routes
  app.get('/associates/download-pdf/:id', async (c: Context) => {
    try {
      const id = c.req.param('id');

      const response = await fetch(`${env.LEGACY_ASSOCIATE_SERVICE}/associate/download-pdf/${id}`, {
        headers: {
          'Authorization': c.req.header('Authorization') || '',
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'application/pdf';
        const contentDisposition = response.headers.get('content-disposition');

        // Set content headers
        c.header('Content-Type', contentType);
        if (contentDisposition) {
          c.header('Content-Disposition', contentDisposition);
        }

        // Add CORS headers for file downloads
        addCorsHeaders(c);

        // Get the response body as ArrayBuffer to avoid stream issues
        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
          status: response.status,
          headers: c.res.headers
        });
      } else {
        const data = await response.json();
        return c.json(data, response.status as any);
      }
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  app.delete('/associate/deactivate', async (c: Context) => {
    try {
      const body = await c.req.json();

      const response = await fetch(`${env.LEGACY_ASSOCIATE_SERVICE}/associate/deactivate`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': c.req.header('Authorization') || '',
        },
        body: JSON.stringify(body)
      });

      // Add CORS headers
      addCorsHeaders(c);

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      addCorsHeaders(c);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Unity routes
  app.get('/file/:key', async (c: Context) => {
    try {
      const key = c.req.param('key');

      const response = await fetch(`${env.LEGACY_UNITY_SERVICE}/file/${key}`, {
        headers: {
          'Authorization': c.req.header('Authorization') || '',
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Set content headers
        c.header('Content-Type', contentType);

        // Add CORS headers for file downloads
        addCorsHeaders(c);

        // Get the response body as ArrayBuffer to avoid stream issues
        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
          status: response.status,
          headers: c.res.headers
        });
      } else {
        // Handle error responses - check content type
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          const data = await response.json();
          return c.json(data, response.status as any);
        } else {
          const text = await response.text();
          return c.json({ message: text }, response.status as any);
        }
      }
    } catch (error) {
      console.error('Error in legacy file route:', error);
      return c.json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        service: env.LEGACY_UNITY_SERVICE
      }, 500);
    }
  });

  // Legacy health check - diferentes do gateway principal
  app.get('/legacy-health', async (c: Context) => {
    try {
      const services = [
        { name: 'auth', url: `${env.LEGACY_AUTH_SERVICE}/health` },
        { name: 'meeting', url: `${env.LEGACY_MEETING_SERVICE}/health` },
        { name: 'associate', url: `${env.LEGACY_ASSOCIATE_SERVICE}/health` },
        { name: 'unity', url: `${env.LEGACY_UNITY_SERVICE}/health` }
      ];

      const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            const response = await fetch(service.url, {
              signal: controller.signal
            });
            const data = await response.json();
            return { service: service.name, status: 'healthy', data };
          } catch (error) {
            return { service: service.name, status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
          } finally {
            clearTimeout(timeoutId);
          }
        })
      );

      const results = healthChecks.map((check, index) => ({
        service: services[index].name,
        ...(check.status === 'fulfilled' ? check.value : { status: 'error', error: check.reason })
      }));

      const allHealthy = results.every(result => result.status === 'healthy');

      return c.json({
        status: allHealthy ? 'healthy' : 'degraded',
        services: results,
        timestamp: new Date().toISOString()
      }, allHealthy ? 200 : 503);
    } catch (error) {
      return c.json({
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 500);
    }
  });
}
