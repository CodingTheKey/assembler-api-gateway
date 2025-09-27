import { getEnv } from './env';
export const getServiceConfig = () => {
    const env = getEnv();
    return [
        {
            path: '/associates/*',
            target: env.ASSOCIATES_SERVICE_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            timeout: 5000,
        },
        {
            path: '/unities/*',
            target: env.UNITIES_SERVICE_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            timeout: 5000,
        },
        {
            path: '/meetings/*',
            target: env.MEETINGS_SERVICE_URL,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            timeout: 5000,
        },
    ];
};
export const getGatewayConfig = () => {
    const env = getEnv();
    return {
        port: Number(env.PORT),
        corsOrigins: env.CORS_ORIGINS,
        logLevel: env.LOG_LEVEL,
    };
};
