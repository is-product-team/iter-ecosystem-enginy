import dotenv from 'dotenv';
dotenv.config();

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import logger from './lib/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import prisma from './lib/prisma.js';
import { ReminderService } from './services/reminder.service.js';

import { env } from './config/env.js';

const app = express();
app.set('trust proxy', 1);

const defaultAllowedOrigins = [
  'https://projects.kore29.com',
  'https://projects.kore29.com/iter',
  'https://iter.kore29.com',
  'http://localhost:8002',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8000',
  'http://localhost:8081',
  'http://127.0.0.1:8002',
  'http://127.0.0.1:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:8081',
];

const allowedOrigins = env.CORS_ORIGIN.length > 0 
  ? env.CORS_ORIGIN 
  : defaultAllowedOrigins;

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Política CORS: Origen no permitido'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'ngrok-skip-browser-warning'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser());

const API_PREFIX = env.API_PREFIX;
app.use(`${API_PREFIX}/uploads`, express.static('uploads'));

app.use(`${API_PREFIX}/`, routes);

app.use(errorHandler);

const PORT = env.PORT;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 Servidor listo en el puerto: ${PORT}`);
  logger.info(`🌍 Entorno: ${env.NODE_ENV}`);
  
  // Conexión PostgreSQL (Opcional en el arranque)
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info(`🗄️  ESTADO BD: Conectado a PostgreSQL`);
  } catch (_e) {
    logger.error(`🗄️  ESTADO BD: Conexión a PostgreSQL fallida`);
  }

  // Start Background Services
  ReminderService.start();
});

process.on('SIGINT', async () => {
  logger.info('Apagando servidor...');
  ReminderService.stop();
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Servidor cerrado');
    process.exit(0);
  });
});
