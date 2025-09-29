const parseCorsOrigins = (origins) => {
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
const buildEnv = (source) => {
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
let runtimeEnv = null;
let loggedEnv = false;
const detectSource = () => {
    if (typeof globalThis !== 'undefined' && globalThis.__ENV_BINDINGS) {
        return globalThis.__ENV_BINDINGS;
    }
    if (typeof process !== 'undefined' && typeof process.env === 'object') {
        return process.env;
    }
    return {};
};
const maybeLogEnv = (env) => {
    if (loggedEnv || env.NODE_ENV !== 'development') {
        return;
    }
    loggedEnv = true;
};
export const initEnv = (source) => {
    if (typeof globalThis !== 'undefined') {
        globalThis.__ENV_BINDINGS = source;
    }
    runtimeEnv = buildEnv(source);
    maybeLogEnv(runtimeEnv);
};
export const getEnv = () => {
    if (!runtimeEnv) {
        runtimeEnv = buildEnv(detectSource());
        maybeLogEnv(runtimeEnv);
    }
    return runtimeEnv;
};
