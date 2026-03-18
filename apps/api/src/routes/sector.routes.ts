import express from 'express';
import * as sectorController from '../controllers/sector.controller.js';

const router = express.Router();

router.get('/', sectorController.getSectors);

export default router;
