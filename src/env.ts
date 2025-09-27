export interface RuntimeEnv {
  NODE_ENV: string;
  PORT: string;
  LOG_LEVEL: string;
  CORS_ORIGINS: string | string[];
  ASSOCIATES_SERVICE_URL: string;
  UNITIES_SERVICE_URL: string;
  MEETINGS_SERVICE_URL: string;
  LEGACY_AUTH_SERVICE: string;
  LEGACY_MEETING_SERVICE: string;
  LEGACY_ASSOCIATE_SERVICE: string;
  LEGACY_UNITY_SERVICE: string;
}

const parseCorsOrigins = (origins?: string): string | string[] => {
  if (!origins) {
    return '*';
  }

  const parsed = origins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (parsed.length === 0 || (parsed.length === 1 && parsed[0] === '*')) {
    return '*';
  }

  return parsed;
};

const buildEnv = (source: Record<string, string | undefined>): RuntimeEnv => {
  console.log('Building env from source:', source);

  const env = {
    NODE_ENV: source.NODE_ENV || 'development',
    PORT: source.PORT || '3000',
    LOG_LEVEL: source.LOG_LEVEL || 'info',
    CORS_ORIGINS: parseCorsOrigins(source.CORS_ORIGINS),
    ASSOCIATES_SERVICE_URL: source.ASSOCIATES_SERVICE_URL || 'http://localhost:3001',
    UNITIES_SERVICE_URL: source.UNITIES_SERVICE_URL || 'http://localhost:3001',
    MEETINGS_SERVICE_URL: source.MEETINGS_SERVICE_URL || 'http://localhost:3001',
    LEGACY_AUTH_SERVICE: source.LEGACY_AUTH_SERVICE || 'https://auth-ms.josecorte-dev.workers.dev',
    LEGACY_MEETING_SERVICE: source.LEGACY_MEETING_SERVICE || 'https://meeting-ms.josecorte-dev.workers.dev',
    LEGACY_ASSOCIATE_SERVICE: source.LEGACY_ASSOCIATE_SERVICE || 'https://associate-ms.josecorte-dev.workers.dev',
    LEGACY_UNITY_SERVICE: source.LEGACY_UNITY_SERVICE || 'http://unity-ms.josecorte-dev.workers.dev',
  };

  console.log('Built env:', env);
  return env;
};

let runtimeEnv: RuntimeEnv | null = null;
let loggedEnv = false;

const detectSource = (): Record<string, string | undefined> => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).__ENV_BINDINGS) {
    return (globalThis as any).__ENV_BINDINGS as Record<string, string | undefined>;
  }

  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    return process.env as Record<string, string | undefined>;
  }

  return {};
};

const maybeLogEnv = (env: RuntimeEnv) => {
  if (loggedEnv || env.NODE_ENV !== 'development') {
    return;
  }

  loggedEnv = true;
};

export const initEnv = (source: Record<string, string | undefined>): void => {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).__ENV_BINDINGS = source;
  }

  runtimeEnv = buildEnv(source);
  maybeLogEnv(runtimeEnv);
};

export const getEnv = (): RuntimeEnv => {
  if (!runtimeEnv) {
    runtimeEnv = buildEnv(detectSource());
    maybeLogEnv(runtimeEnv);
  }

  return runtimeEnv;
};
