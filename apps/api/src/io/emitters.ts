import { getIO } from './index.js';
import logger from '../lib/logger.js';

/**
 * Utility to broadcast phase changes to all connected clients
 */
export const emitPhaseChanged = (phase: { phaseId: number, name: string, isActive: boolean }) => {
  try {
    const io = getIO();
    
    logger.info(`📡 Socket.io: Broadcasting PHASE_CHANGED -> ${phase.name} (${phase.isActive ? 'ACTIVE' : 'INACTIVE'})`);
    
    // Broadcast to everyone (since phases are global state)
    io.emit('phase_changed', {
      phaseId: phase.phaseId,
      name: phase.name,
      isActive: phase.isActive,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error(`📡 Socket.io: Error emitting phase_changed: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
};
