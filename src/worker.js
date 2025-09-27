import { createApp } from './index';
import { initEnv } from './env';
let app;
const extractStringBindings = (bindings) => {
    const result = {};
    for (const [key, value] of Object.entries(bindings)) {
        if (typeof value === 'string' || typeof value === 'undefined') {
            result[key] = value;
        }
    }
    return result;
};
export default {
    async fetch(request, env, ctx) {
        if (!app) {
            initEnv(extractStringBindings(env));
            app = createApp();
        }
        return app.fetch(request, env, ctx);
    },
};
