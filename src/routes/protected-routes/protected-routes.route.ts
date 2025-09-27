import { Context, Hono } from 'hono';
import type { ServiceRoute } from '../../config';
import { RedirectToService } from '../../lib/redirect-to-service';
import { isLegacyRoute } from '../../middlewares/legacy-route-check.middleware';

export class ProtectedRoutes {
  constructor() {
    this.configRoute = this.configRoute.bind(this);
  }

  configRoute(app: Hono, routes: ServiceRoute[]) {
    this.configAssociatesRoute(app, routes);
    this.configUnitiesRoute(app, routes);
    this.configMeetingsRoute(app, routes);
  }

  configAssociatesRoute(app: Hono, routes: ServiceRoute[]) {
    app.all('/associates/*', async (c: Context) => {
      // Skip if this is a legacy route
      if (isLegacyRoute(c)) {
        return c.notFound();
      }

      console.log('Available routes:', routes.map(r => ({ path: r.path, target: r.target })));
      const associatesService = routes.find(s => s.path.includes('/associates'));
      console.log('Found associates service:', associatesService);

      if (!associatesService) {
        return c.json({
          error: 'Associates service not configured',
          availableRoutes: routes.map(r => r.path)
        }, 503);
      }
      return await RedirectToService.handle(c, associatesService.target, '/associates', associatesService.timeout);
    });
  }

  configUnitiesRoute(app: Hono, routes: ServiceRoute[]) {
    app.all('/unities/*', async (c: Context) => {
      const unitiesService = routes.find(s => s.path.includes('/unities'));
      if (!unitiesService) {
        return c.json({ error: 'Unities service not configured' }, 503);
      }
      return await RedirectToService.handle(c, unitiesService.target, '/unities', unitiesService.timeout);
    });
  }

  configMeetingsRoute(app: Hono, routes: ServiceRoute[]) {
    app.all('/meetings/*', async (c: Context) => {
      const meetingsService = routes.find(s => s.path.includes('/meetings'));
      if (!meetingsService) {
        return c.json({ error: 'Meetings service not configured' }, 503);
      }
      return await RedirectToService.handle(c, meetingsService.target, '/meetings', meetingsService.timeout);
    });
  }
}
