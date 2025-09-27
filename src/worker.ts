import { createApp } from './index';
import { initEnv, RuntimeEnv } from './env';

let app: ReturnType<typeof createApp> | undefined;

const extractStringBindings = (bindings: Record<string, unknown>): Record<string, string | undefined> => {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(bindings)) {
    if (typeof value === 'string' || typeof value === 'undefined') {
      result[key] = value;
    }
  }

  return result;
};

export default {
  async fetch(request: Request, env: RuntimeEnv & Record<string, unknown>, ctx: ExecutionContext): Promise<Response> {
    if (!app) {
      initEnv(extractStringBindings(env));
      app = createApp();
    }

    return app.fetch(request, env, ctx);
  },
};
