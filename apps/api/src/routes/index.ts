import express from 'express';
const router = express.Router();

// Importar archivos de rutas individuales
import authRoutes from './auth.routes.js';
import tallerRoutes from './taller.routes.js';
import centroRoutes from './centro.routes.js';
import peticioRoutes from './peticio.routes.js'; 
import assignacioRoutes from './assignacio.routes.js';
import alumneRoutes from './alumne.routes.js';
import professorRoutes from './professor.routes.js';
import calendarRoutes from './calendar.routes.js';
import faseRoutes from './fase.routes.js';
import statsRoutes from './stats.routes.js';
import sectorRoutes from './sector.routes.js';
import assistenciaRoutes from './assistencia.routes.js';
import notificacioRoutes from './notificacio.routes.js';
import evaluationRoutes from './evaluation.routes.js'; 
import questionariRoutes from './questionari.routes.js';
import uploadRoutes from './upload.routes.js';

// --- Definir las rutas base ---

// Rutas de Autenticación (Login, Registro)
router.use('/auth', authRoutes);

// Rutas de Maestros
router.use('/workshops', tallerRoutes);
router.use('/centers', centroRoutes);
router.use('/sectors', sectorRoutes);

// Rutas del Flujo de Negocio (Solicitudes y Asignaciones)
router.use('/requests', peticioRoutes);
router.use('/assignments', assignacioRoutes);
router.use('/notifications', notificacioRoutes);
router.use('/evaluation', evaluationRoutes); 

// Rutas de Alumnos y Profesores
router.use('/students', alumneRoutes);
router.use('/teachers', professorRoutes);
router.use('/attendance', assistenciaRoutes);

// Rutas de Calendario
router.use('/calendar', calendarRoutes);
router.use('/phases', faseRoutes);

// Rutas de Estadísticas
router.use('/stats', statsRoutes);

// Rutas de Evaluación y Cuestionarios
router.use('/questionnaires', questionariRoutes);

// Rutas de Carga de Archivos
router.use('/upload', uploadRoutes);

// Health Check (Para ver si la API respira)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

export default router;