import { Context } from "hono";

export class NotFoundRoute {
  static async configRoute(app: any) {
    app.notFound((c: Context) => {
      return c.json({
        error: 'Endpoint not found',
        path: c.req.path,
        method: c.req.method,
        availableRoutes: ['/health', '/api/associates/*', '/api/unities/*', '/api/meetings/*'],
        timestamp: new Date().toISOString()
      }, 404);
    });
  }
}