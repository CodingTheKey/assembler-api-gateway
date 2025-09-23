export interface ServiceRoute {
  path: string
  target: string
  methods?: string[]
  timeout?: number
}

export const serviceConfig: ServiceRoute[] = [
  {
    path: '/associates/*',
    target: process.env.ASSOCIATES_SERVICE_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/unities/*',
    target: process.env.UNITIES_SERVICE_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/meetings/*',
    target: process.env.MEETINGS_SERVICE_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    timeout: 5000
  },
  {
    path: '/file/:key',
    target: process.env.FILE_SERVICE_URL || 'http://localhost:3001',
    methods: ['GET'],
    timeout: 5000
  }
]

export const gatewayConfig = {
  port: process.env.PORT || 3000,
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  logLevel: process.env.LOG_LEVEL || 'info'
}