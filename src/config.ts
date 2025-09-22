export interface ServiceRoute {
  path: string
  target: string
  methods?: string[]
  timeout?: number
}

export const serviceConfig: ServiceRoute[] = [
  {
    path: '/associates/*',
    target: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/unities/*',
    target: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/meetings/*',
    target: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    timeout: 5000
  },
  {
    path: '/',
    target: 'http://localhost:3000',
    methods: ['GET'],
    timeout: 5000
  }
]

export const gatewayConfig = {
  port: process.env.PORT || 3000,
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  logLevel: process.env.LOG_LEVEL || 'info'
}