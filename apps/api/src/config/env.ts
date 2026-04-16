import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Prioritize system environment variables.
 * Only load .env if critical variables are missing or if we are in development.
 */
const criticalVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingCritical = criticalVars.some(v => !process.env[v]);

if (missingCritical || process.env.NODE_ENV === 'development') {
  // Try several locations for .env to be robust across different deployment structures
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(__dirname, '../../../../.env'),
    path.resolve(__dirname, '../../../../../.env'),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  CORS_ORIGIN: z.string().default('*').transform((s) => s.split(',').map(o => o.trim())),
  API_PREFIX: z.string().default(''),
  // Variables auxiliares para reconstrucción si DATABASE_URL no está
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  // AI Config
  GOOGLE_AI_API_KEY: z.string().optional(),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // In production, we might want to be more descriptive but not always exit 
    // if the system can still function or if the error is non-critical.
    // However, DATABASE_URL and JWT_SECRET are critical.
    
    const errors = parsed.error.flatten().fieldErrors;
    const isCriticalError = errors.DATABASE_URL || errors.JWT_SECRET;

    if (process.env.NODE_ENV === 'test') {
      console.warn('⚠️ Environment validation failed during test execution.');
      return process.env as any;
    }

    if (isCriticalError) {
      console.error('❌ CRITICAL Error de validación en las variables de entorno:');
      console.error(JSON.stringify(errors, null, 2));
      // Only exit on critical errors in production
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    } else {
      console.warn('⚠️ Advertencia: Algunas variables de entorno no críticas fallaron la validación:');
      console.warn(JSON.stringify(errors, null, 2));
    }
  }

  return parsed.data || process.env as any;
}

export const env = validateEnv();
