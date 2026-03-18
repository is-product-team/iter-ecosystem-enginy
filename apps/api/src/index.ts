import dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import logger from './lib/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import prisma from './lib/prisma.js';

const app = express();
app.set('trust proxy', 1);

// ... (allowedOrigins logic remains same)
const defaultAllowedOrigins = [
  'https://projects.kore29.com',
  'https://projects.kore29.com/iter',
  'https://iter.kore29.com',
  'http://localhost:8002',
  'http://localhost:3000',
  'http://localhost:3001',
];

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : defaultAllowedOrigins;

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'ngrok-skip-browser-warning'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Prefix logic for production paths
const API_PREFIX = process.env.API_PREFIX || '';
app.use(`${API_PREFIX}/uploads`, express.static('uploads'));

// Rutas API servidas con prefijo si existe (ej: /iter/api)
app.use(`${API_PREFIX}/`, routes);

// Error Handler (Debe ir después de las rutas)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Servidor listo en puerto: ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Conexión PostgreSQL (Opcional en el arranque)
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info(`🗄️  DATABASE STATUS: Connected to PostgreSQL`);
  } catch (e) {
    logger.error(`🗄️  DATABASE STATUS: PostgreSQL Connection failed`);
  }
});

process.on('SIGINT', async () => {
  logger.info('Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
