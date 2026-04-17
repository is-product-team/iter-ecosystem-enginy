import prisma from '../lib/prisma.js';
import { IssueInput, ISSUE_STATUSES } from '@iter/shared';

export class IssueService {
  /**
   * Creates a new issue and its initial message.
   */
  static async createIssue(data: IssueInput, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const issue = await tx.issue.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority || 'MEDIUM',
          category: data.category,
          centerId: data.centerId,
          creatorId: creatorId,
          assignmentId: data.assignmentId,
          sessionId: data.sessionId,
          status: 'OPEN',
        },
      });

      // Create the first message in the chat (the description)
      await tx.issueMessage.create({
        data: {
          issueId: issue.issueId,
          senderId: creatorId,
          content: data.description,
          isSystem: false,
        },
      });

      return issue;
    });
  }

  /**
   * Adds a message to an existing issue.
   */
  static async addMessage(issueId: number, content: string, senderId: number, isSystem = false) {
    return await prisma.issueMessage.create({
      data: {
        issueId,
        senderId,
        content,
        isSystem,
      },
      include: {
        sender: {
          select: {
            fullName: true,
            role: { select: { roleName: true } },
          },
        },
      },
    });
  }

  /**
   * Updates the status of an issue and injects a system message.
   */
  static async updateStatus(issueId: number, newStatus: any, adminId: number) {
    const issue = await prisma.issue.findUnique({ where: { issueId } });
    if (!issue) throw new Error('Issue not found');

    const oldStatus = issue.status;
    if (oldStatus === newStatus) return issue;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { issueId },
        data: { 
          status: newStatus,
          resolvedAt: newStatus === 'RESOLVED' ? new Date() : issue.resolvedAt
        },
      });

      await tx.issueMessage.create({
        data: {
          issueId,
          content: `Estat canviat de ${oldStatus} a ${newStatus}`,
          isSystem: true,
          senderId: adminId, // System messages can still be attributed to the admin who made the change
        },
      });

      return updated;
    });
  }

  /**
   * Updates the priority of an issue and injects a system message.
   */
  static async updatePriority(issueId: number, newPriority: any, adminId: number) {
    const issue = await prisma.issue.findUnique({ where: { issueId } });
    if (!issue) throw new Error('Issue not found');

    const oldPriority = issue.priority;
    if (oldPriority === newPriority) return issue;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { issueId },
        data: { priority: newPriority },
      });

      await tx.issueMessage.create({
        data: {
          issueId,
          content: `Prioritat canviada de ${oldPriority} a ${newPriority}`,
          isSystem: true,
          senderId: adminId,
        },
      });

      return updated;
    });
  }

  /**
   * Gets list of issues with filters.
   */
  static async getIssues(filters: { centerId?: number; creatorId?: number; status?: any }) {
    return await prisma.issue.findMany({
      where: filters,
      include: {
        center: { select: { name: true } },
        creator: { select: { fullName: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Gets full detail of an issue including message history.
   */
  static async getIssueById(issueId: number) {
    return await prisma.issue.findUnique({
      where: { issueId },
      include: {
        center: true,
        creator: { select: { fullName: true, role: true } },
        messages: {
          include: {
            sender: {
              select: {
                fullName: true,
                role: { select: { roleName: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
