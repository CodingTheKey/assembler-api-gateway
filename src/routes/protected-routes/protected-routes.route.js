import { RedirectToService } from '../../lib/redirect-to-service';
import { isLegacyRoute } from '../../middlewares/legacy-route-check.middleware';
export class ProtectedRoutes {
    constructor() {
        this.configRoute = this.configRoute.bind(this);
    }
    configRoute(app, routes) {
        this.configAssociatesRoute(app, routes);
        this.configUnitiesRoute(app, routes);
        this.configMeetingsRoute(app, routes);
    }
    configAssociatesRoute(app, routes) {
        app.all('/associates/*', async (c) => {
            // Skip if this is a legacy route
            if (isLegacyRoute(c)) {
                return c.notFound();
            }
            const associatesService = routes.find(s => s.path.includes('/associates'));
            if (!associatesService) {
                return c.json({ error: 'Associates service not configured' }, 503);
            }
            return await RedirectToService.handle(c, associatesService.target, '/associates', associatesService.timeout);
        });
    }
    configUnitiesRoute(app, routes) {
        app.all('/unities/*', async (c) => {
            const unitiesService = routes.find(s => s.path.includes('/unities'));
            if (!unitiesService) {
                return c.json({ error: 'Unities service not configured' }, 503);
            }
            return await RedirectToService.handle(c, unitiesService.target, '/unities', unitiesService.timeout);
        });
    }
    configMeetingsRoute(app, routes) {
        app.all('/meetings/*', async (c) => {
            const meetingsService = routes.find(s => s.path.includes('/meetings'));
            if (!meetingsService) {
                return c.json({ error: 'Meetings service not configured' }, 503);
            }
            return await RedirectToService.handle(c, meetingsService.target, '/meetings', meetingsService.timeout);
        });
    }
}
