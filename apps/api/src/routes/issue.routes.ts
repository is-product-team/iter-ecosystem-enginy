import { Router } from 'express';
import { 
  createIssue, 
  getIssues, 
  getIssueById, 
  addMessage, 
  updateIssueStatus, 
  updateIssuePriority 
} from '../controllers/issue.controller.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create and List
router.post('/', createIssue);
router.get('/', getIssues);

// Detail and Messages
router.get('/:id', getIssueById);
router.post('/:id/messages', addMessage);

// Admin only actions
router.patch('/:id/status', updateIssueStatus);
router.patch('/:id/priority', updateIssuePriority);

export default router;
