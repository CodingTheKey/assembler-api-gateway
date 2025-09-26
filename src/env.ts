// Environment configuration for both local development and AWS Lambda
import { config } from 'dotenv';

// Load .env file only in development (not in Lambda)
if (process.env.NODE_ENV !== 'production' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  config();
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

// Environment variables with fallbacks
export const env = {
  // Basic config
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // CORS
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS),

  // New services (assembleo-core)
  ASSOCIATES_SERVICE_URL: process.env.ASSOCIATES_SERVICE_URL || 'http://localhost:3001',
  UNITIES_SERVICE_URL: process.env.UNITIES_SERVICE_URL || 'http://localhost:3001',
  MEETINGS_SERVICE_URL: process.env.MEETINGS_SERVICE_URL || 'http://localhost:3001',

  // Legacy services (assembleo-backend)
  LEGACY_AUTH_SERVICE: process.env.LEGACY_AUTH_SERVICE || 'https://auth-ms.josecorte-dev.workers.dev',
  LEGACY_MEETING_SERVICE: process.env.LEGACY_MEETING_SERVICE || 'https://meeting-ms.josecorte-dev.workers.dev',
  LEGACY_ASSOCIATE_SERVICE: process.env.LEGACY_ASSOCIATE_SERVICE || 'https://associate-ms.josecorte-dev.workers.dev',
  LEGACY_UNITY_SERVICE: process.env.LEGACY_UNITY_SERVICE || 'http://unity-ms.josecorte-dev.workers.dev',

  // AWS Lambda detection
  IS_LAMBDA: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
};

// Debug logging for development
if (env.NODE_ENV === 'development') {
  console.log('🔧 Environment configuration loaded:');
  console.log('  NODE_ENV:', env.NODE_ENV);
  console.log('  IS_LAMBDA:', env.IS_LAMBDA);
  console.log('  PORT:', env.PORT);
  console.log('  LEGACY_UNITY_SERVICE:', env.LEGACY_UNITY_SERVICE);
  console.log('  LEGACY_AUTH_SERVICE:', env.LEGACY_AUTH_SERVICE);
  console.log('  LEGACY_MEETING_SERVICE:', env.LEGACY_MEETING_SERVICE);
  console.log('  LEGACY_ASSOCIATE_SERVICE:', env.LEGACY_ASSOCIATE_SERVICE);
}