export interface ServiceRoute {
  path: string
  target: string
  methods?: string[]
  timeout?: number
}

export interface GatewayConfig {
  port: string | number
  corsOrigins: string[]
  logLevel: string
}

export interface HealthCheckResponse {
  status: string
  timestamp: string
  version: string
  services: Array<{
    path: string
    target: string
  }>
}