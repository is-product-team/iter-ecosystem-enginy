import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'iter_db';

if (!uri || uri.includes('<db_password>')) {
  console.warn('⚠️ MONGODB_URI no configurada: Debes poner tu contraseña en apps/api/.env');
}

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null }> {
  if (client && db) {
    return { client, db };
  }

  if (!uri || uri.includes('<db_password>')) {
    console.warn('⚠️ MONGODB_URI no configurada o inválida. Saltando conexión MongoDB...');
    return { client: null, db: null };
  }

  try {
    // Configuración recomendada para MongoDB Atlas Stable API
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 5000, // 5 segundos para conectar
      serverSelectionTimeoutMS: 5000 // 5 segundos para seleccionar servidor
    });

    await client.connect();
    db = client.db(dbName);
    console.log('✅ Conectado a MongoDB Atlas (Stable API v1)');
    return { client, db };
  } catch (error: any) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
    throw new Error(`MongoDB No Respon: ${error.message}. Verifica les credencials a .env o la connexió a internet.`);
  }
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

export { db };
