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
import fs from 'fs';
import path from 'path';

// Asegurar carpeta de uploads al arranque
const uploadDir = path.resolve(process.cwd(), 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = env.CORS_ORIGIN;

app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.error(`[CORS] Rejected origin: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
      callback(new Error('CORS Policy: Origin not allowed'));
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

// Logger global de peticiones para depuración
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

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
