import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { getGatewayConfig, getServiceConfig } from './config';
import { legacyRouteCheckMiddleware } from './middlewares/legacy-route-check.middleware';
import { RateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { requestLoggerMiddleware } from './middlewares/request-logger.middleware';
import { verifyTokenServicesMiddleware } from './middlewares/verify-jwt.middleware';
import { setupLegacyRoutes } from './routes/legacy-routes';
import { NotFoundRoute } from './routes/not-found.route';
import ProtectedRoutes from './routes/protected-routes/protected-routes.factory';
import { swaggerConfig } from './swagger/swagger-config';
export const createApp = () => {
    const app = new Hono();
    const gatewayConfig = getGatewayConfig();
    const services = getServiceConfig();
    app.use('*', timing());
    app.use('*', logger());
    app.use('*', cors({
        origin: gatewayConfig.corsOrigins,
        allowHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        exposeHeaders: ['Content-Disposition', 'X-Response-Time'],
        credentials: false,
    }));
    app.use('*', requestLoggerMiddleware);
    app.use('*', RateLimitMiddleware);
    const protectedRoutes = new Hono();
    protectedRoutes.use('*', verifyTokenServicesMiddleware);
    protectedRoutes.use('*', legacyRouteCheckMiddleware);
    // Setup legacy routes FIRST (more specific routes)
    setupLegacyRoutes(protectedRoutes);
    // Then setup the general protected routes
    ProtectedRoutes.ProtectedRoutes.configRoute(protectedRoutes, services);
    app.route('/api', protectedRoutes);
    app.get('/health', (c) => {
        return c.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            services: services.map(s => ({ path: s.path, target: s.target })),
        });
    });
    app.get('/swagger.json', (c) => {
        return c.json(swaggerConfig);
    });
    app.get('/docs', (c) => {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assembleo API Gateway - Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
        return c.html(html);
    });
    app.onError((err, c) => {
        console.error('Gateway error:', err);
        if (err instanceof HTTPException) {
            return c.json({ error: err.message }, err.status);
        }
        return c.json({
            error: 'Internal server error',
            requestId: c.req.header('X-Request-ID') || 'unknown',
        }, 500);
    });
    NotFoundRoute.configRoute(app);
    return app;
};
export default createApp;
