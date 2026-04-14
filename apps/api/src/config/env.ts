import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Cargar el .env desde la raíz (dos niveles arriba de src/config)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

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
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    if (process.env.NODE_ENV === 'test') {
      console.warn('⚠️ Environment validation failed during test execution. Some tests might skip or fail.');
      return process.env as any; // Return raw env during tests to avoid crash
    }
    console.error('❌ Error de validación en las variables de entorno:');
    console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();
