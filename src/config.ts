import { env } from './env';

export interface ServiceRoute {
  path: string
  target: string
  methods?: string[]
  timeout?: number
}

export const serviceConfig: ServiceRoute[] = [
  {
    path: '/associates/*',
    target: env.ASSOCIATES_SERVICE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/unities/*',
    target: env.UNITIES_SERVICE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/meetings/*',
    target: env.MEETINGS_SERVICE_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  }
]

export const gatewayConfig = {
  port: Number(env.PORT),
  corsOrigins: env.CORS_ORIGINS,
  logLevel: env.LOG_LEVEL
}