import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { gatewayConfig, serviceConfig } from './config.js'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: gatewayConfig.corsOrigins
}))
app.use('*', logger())

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceConfig.map(s => ({ path: s.path, target: s.target }))
  })
})

// Proxy function with timeout and error handling
async function proxyRequest(c: any, targetUrl: string, timeout: number = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const url = new URL(c.req.url)
    const targetPath = url.pathname
    const queryString = url.search

    const proxyUrl = `${targetUrl}${targetPath}${queryString}`

    const headers: Record<string, string> = {}
    const requestHeaders = c.req.header()

    for (const [key, value] of Object.entries(requestHeaders)) {
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    }

    const body = ['GET', 'HEAD'].includes(c.req.method) 
      ? undefined
      : await c.req.arrayBuffer()

    const response = await fetch(proxyUrl, {
      method: c.req.method,
      headers,
      body,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    const responseBody = await response.arrayBuffer()

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        responseHeaders[key] = value
      }
    })

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request timeout for ${targetUrl}`)
      return c.json({ 
        error: 'Request timeout',
        message: 'Service did not respond within the timeout period'
      }, 504)
    }

    console.error('Proxy error:', error)
    return c.json({ 
      error: 'Service unavailable',
      message: 'Failed to connect to target service',
      timestamp: new Date().toISOString()
    }, 503)
  }
}

// Dynamic route handling
app.all('*', async (c) => {
  const path = c.req.path

  for (const service of serviceConfig) {
    const servicePath = service.path.replace('/*', '')

    if (path.startsWith(servicePath)) {
      if (service.methods && !service.methods.includes(c.req.method)) {
        return c.json({ 
          error: 'Method not allowed',
          allowedMethods: service.methods 
        }, 405)
      }

      return proxyRequest(c, service.target, service.timeout)
    }
  }

  return c.json({ 
    error: 'Route not found',
    path: path,
    availableRoutes: serviceConfig.map(s => s.path),
    timestamp: new Date().toISOString()
  }, 404)
})

console.log(`🚀 API Gateway starting on port ${gatewayConfig.port}`)
console.log('📋 Available routes:')
serviceConfig.forEach(service => {
  console.log(`  ${service.path} -> ${service.target}`)
})

export default {
  port: gatewayConfig.port,
  fetch: app.fetch
}
