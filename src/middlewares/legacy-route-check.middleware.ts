import { Context, Next } from 'hono';

// List of exact legacy route patterns that should be handled by legacy routes
const LEGACY_ROUTE_PATTERNS = [
  // Auth
  '/auth/login',

  // Meetings
  '/meetings/count',
  '/meetings', // GET for listing (exact match)

  // Associates
  '/associate/download-pdf',
  '/associate/deactivate',

  // Unity
  '/file',

  // Health
  '/legacy-health'
];

// Dynamic patterns that need special handling
const LEGACY_DYNAMIC_PATTERNS = [
  {
    pattern: /^\/meetings\/[^\/]+\/start$/,
    description: 'Meeting start route: /meetings/:id/start'
  },
  {
    pattern: /^\/associate\/download-pdf\/[^\/]+$/,
    description: 'Associate PDF download: /associate/download-pdf/:id'
  },
  {
    pattern: /^\/file\/[^\/]+$/,
    description: 'File download: /file/:key'
  }
];

/**
 * Middleware that checks if the current request matches a legacy route pattern.
 * If it does, it sets a flag that can be used by protected routes to skip processing.
 */
export const legacyRouteCheckMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path.replace('/api', ''); // Remove /api prefix for checking
  const method = c.req.method;

  // Check exact patterns
  for (const legacyPath of LEGACY_ROUTE_PATTERNS) {
    if (path === legacyPath) {
      console.log(`🔄 Legacy route detected: ${method} ${path}`);
      c.set('isLegacyRoute', true);
      break;
    }
  }

  // Check dynamic patterns
  if (!c.get('isLegacyRoute')) {
    for (const { pattern, description } of LEGACY_DYNAMIC_PATTERNS) {
      if (pattern.test(path)) {
        console.log(`🔄 Legacy route detected: ${method} ${path} (${description})`);
        c.set('isLegacyRoute', true);
        break;
      }
    }
  }

  // Special case: GET /meetings (listing) vs POST /meetings (create)
  if (path === '/meetings' && method === 'GET') {
    console.log(`🔄 Legacy route detected: GET /meetings (listing)`);
    c.set('isLegacyRoute', true);
  }

  await next();
};

/**
 * Helper function to check if the current request is a legacy route
 */
export const isLegacyRoute = (c: Context): boolean => {
  return c.get('isLegacyRoute') === true;
};