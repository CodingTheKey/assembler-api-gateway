import { Context, Hono } from 'hono';
import { serviceConfig } from '../../config';
import { RedirectToService } from '../../lib/redirect-to-service';
import { isLegacyRoute } from '../../middlewares/legacy-route-check.middleware';

export class ProtectedRoutes {
  constructor() {
    this.configRoute = this.configRoute.bind(this);
  }

  configRoute(app: Hono) {
    this.configAssociatesRoute(app);
    this.configUnitiesRoute(app);
    this.configMeetingsRoute(app);
  }

  configAssociatesRoute(app: Hono) {
    app.all('/associates/*', async (c: Context) => {
      // Skip if this is a legacy route
      if (isLegacyRoute(c)) {
        return c.notFound();
      }

      const associatesService = serviceConfig.find(s => s.path.includes('/associates'));
      if (!associatesService) {
        return c.json({ error: 'Associates service not configured' }, 503);
      }
      return await RedirectToService.handle(c, associatesService.target, '/associates', associatesService.timeout);
    });
  }

  configUnitiesRoute(app: Hono) {
    app.all('/unities/*', async (c: Context) => {
      const unitiesService = serviceConfig.find(s => s.path.includes('/unities'));
      if (!unitiesService) {
        return c.json({ error: 'Unities service not configured' }, 503);
      }
      return await RedirectToService.handle(c, unitiesService.target, '/unities', unitiesService.timeout);
    });
  }

  configMeetingsRoute(app: Hono) {
    app.all('/meetings/*', async (c: Context) => {
      const meetingsService = serviceConfig.find(s => s.path.includes('/meetings'));
      if (!meetingsService) {
        return c.json({ error: 'Meetings service not configured' }, 503);
      }
      return await RedirectToService.handle(c, meetingsService.target, '/meetings', meetingsService.timeout);
    });
  }
}