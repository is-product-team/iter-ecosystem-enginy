import { getIO } from './index.js';
import { ROLES } from '@iter/shared';

/**
 * Broadcasts a new issue to all administrators and the center coordinator.
 */
export const emitNewIssue = (issue: any) => {
  const io = getIO();
  
  // Emit to all admins
  io.to(`role:${ROLES.ADMIN}`).emit('new_issue', issue);
  
  // Emit to the specific center coordinator room
  if (issue.centerId) {
    io.to(`center:${issue.centerId}`).emit('new_issue', issue);
  }
};

/**
 * Broadcasts a new message in an issue to all participants in that issue's room.
 */
export const emitIssueMessage = (issueId: number, message: any) => {
  const io = getIO();
  io.to(`issue:${issueId}`).emit('issue_message', message);
};

/**
 * Broadcasts a status change of an issue.
 */
export const emitIssueStatusChanged = (issueId: number, data: { status: string, issue: any }) => {
  const io = getIO();
  
  // Notify the issue room
  io.to(`issue:${issueId}`).emit('issue_status_changed', data);
  
  // Also notify admins/coordinators for list updates
  io.to(`role:${ROLES.ADMIN}`).emit('issue_updated', data);
  if (data.issue.centerId) {
    io.to(`center:${data.issue.centerId}`).emit('issue_updated', data);
  }
};
