import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// --- ROBUST ENV LOADING (Copied from seed.ts) ---
const rootEnvPath = path.resolve(process.cwd(), '../../.env');
const localEnvPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config({ path: localEnvPath });
}

// Manual variable expansion for DATABASE_URL (e.g., ${POSTGRES_USER})
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  // Replace ${VAR} with process.env.VAR
  url = url.replace(/\${(\w+)}/g, (_, v) => process.env[v] || '');
  
  // Local host detection: if "@db" is in URL and we are NOT in a container, use localhost
  const isDocker = fs.existsSync('/.dockerenv');
  if (!isDocker && url.includes('@db')) {
    console.log('🔄  Detectado entorno local (Host), cambiando "db" por "localhost" en DATABASE_URL...');
    url = url.replace('@db', '@localhost');
  }
  
  process.env.DATABASE_URL = url;
}
// -----------------------------------------------

console.log('🧹 Limpiando base de datos...');
try {
  // Execute prisma db push --force-reset
  // We use inherit to see the output in real-time
  execSync('npx prisma db push --force-reset --accept-data-loss', { 
    stdio: 'inherit',
    env: process.env 
  });
  console.log('✅ Base de datos limpia con éxito.');
} catch (error) {
  console.error('❌ Error al limpiar la base de datos:', error);
  process.exit(1);
}
