import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  INTERNAL_API_URL: z.string().url().optional(),
});

function validateEnv() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  };

  const parsed = envSchema.safeParse(envVars);

  if (!parsed.success) {
    if (typeof window === 'undefined') {
      console.error('❌ Error de validación en las variables de entorno del Web (Server-side):');
      console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
      // En producción podrías querer lanzar un error o salir, 
      // pero en Next.js a veces es mejor dejar que falle el build.
    }
  }

  return parsed.success ? parsed.data : (envVars as z.infer<typeof envSchema>);
}

export const env = validateEnv();
