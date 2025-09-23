import { Context, Hono } from 'hono';

const LEGACY_AUTH_SERVICE = process.env.LEGACY_AUTH_SERVICE || 'http://localhost:3001';
const LEGACY_MEETING_SERVICE = process.env.LEGACY_MEETING_SERVICE || 'http://localhost:3002';
const LEGACY_ASSOCIATE_SERVICE = process.env.LEGACY_ASSOCIATE_SERVICE || 'http://localhost:3003';
const LEGACY_UNITY_SERVICE = process.env.LEGACY_UNITY_SERVICE || 'http://localhost:3004';

export function setupLegacyRoutes(app: Hono) {
  // Auth routes
  app.post('/auth/login', async (c: Context) => {
    try {
      const body = await c.req.json();
      const response = await fetch(`${LEGACY_AUTH_SERVICE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': c.req.header('Authorization') || '',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Meeting routes
  app.get('/meetings/count', async (c: Context) => {
    try {
      const url = new URL(`${LEGACY_MEETING_SERVICE}/meetings/count`);
      Object.entries(c.req.query()).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': c.req.header('Authorization') || '',
        }
      });

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  app.get('/meetings', async (c: Context) => {
    try {
      const url = new URL(`${LEGACY_MEETING_SERVICE}/meetings`);
      Object.entries(c.req.query()).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': c.req.header('Authorization') || '',
        }
      });

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  app.post('/meetings/:id/start', async (c: Context) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();

      const response = await fetch(`${LEGACY_MEETING_SERVICE}/meetings/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': c.req.header('Authorization') || '',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Associate routes
  app.get('/associate/download-pdf/:id', async (c: Context) => {
    try {
      const id = c.req.param('id');

      const response = await fetch(`${LEGACY_ASSOCIATE_SERVICE}/associate/download-pdf/${id}`, {
        headers: {
          'Authorization': c.req.header('Authorization') || '',
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'application/pdf';
        const contentDisposition = response.headers.get('content-disposition');

        c.header('Content-Type', contentType);
        if (contentDisposition) {
          c.header('Content-Disposition', contentDisposition);
        }

        return new Response(response.body, {
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

      const response = await fetch(`${LEGACY_ASSOCIATE_SERVICE}/associate/deactivate`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': c.req.header('Authorization') || '',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      return c.json(data, response.status as any);
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Unity routes
  app.get('/file/:key', async (c: Context) => {
    try {
      const key = c.req.param('key');

      console.log('Fetching file with key:', key);

      const response = await fetch(`${LEGACY_UNITY_SERVICE}/file/${key}`, {
        headers: {
          'Authorization': c.req.header('Authorization') || '',
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        c.header('Content-Type', contentType);

        return new Response(response.body, {
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

  // Legacy health check - diferentes do gateway principal
  app.get('/legacy-health', async (c: Context) => {
    try {
      const services = [
        { name: 'auth', url: `${LEGACY_AUTH_SERVICE}/health` },
        { name: 'meeting', url: `${LEGACY_MEETING_SERVICE}/health` },
        { name: 'associate', url: `${LEGACY_ASSOCIATE_SERVICE}/health` },
        { name: 'unity', url: `${LEGACY_UNITY_SERVICE}/health` }
      ];

      const healthChecks = await Promise.allSettled(
        services.map(async (service) => {
          try {
            const response = await fetch(service.url, {
              signal: AbortSignal.timeout(5000)
            });
            const data = await response.json();
            return { service: service.name, status: 'healthy', data };
          } catch (error) {
            return { service: service.name, status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
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