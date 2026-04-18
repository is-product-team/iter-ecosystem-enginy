import { Request, Response } from 'express';
import { IssueService } from '../services/issue.service.js';
import { IssueSchema, IssueMessageSchema, ROLES } from '@iter/shared';

export const createIssue = async (req: Request, res: Response) => {
  const { userId, centerId: userCenterId } = req.user!;
  
  // Auto-assign centerId from user if missing or invalid (e.g., 0)
  if ((!req.body.centerId || req.body.centerId === 0) && userCenterId) {
    req.body.centerId = userCenterId;
  }
  
  const result = IssueSchema.safeParse(req.body);
  if (!result.success) {
    console.error('❌ [API] Validation failed for new issue:', JSON.stringify(result.error.format(), null, 2));
    return res.status(400).json({ error: 'Falten camps o són invàlids', details: result.error.format() });
  }

  try {
    const issue = await IssueService.createIssue(result.data, userId);
    res.status(201).json(issue);
  } catch (error) {
    console.error('❌ [API] Error creating issue in service:', error);
    res.status(500).json({ error: 'Error al crear la incidència' });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  const { userId, role, centerId } = req.user!;
  
  const filters: any = {};
  
  // Scoping logic
  if (role === ROLES.COORDINATOR) {
    filters.centerId = centerId;
  } else if (role === ROLES.TEACHER) {
    filters.creatorId = userId;
  }

  try {
    const issues = await IssueService.getIssues(filters);
    res.json(issues);
  } catch (error) {
    console.error('❌ [API] Error fetching issues:', error);
    res.status(500).json({ error: 'Error al obtenir les incidències' });
  }
};

export const getIssueById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, centerId, userId } = req.user!;

  try {
    const issue = await IssueService.getIssueById(Number(id));
    if (!issue) return res.status(404).json({ error: 'Incidència no trobada' });

    // Security check
    if (role === ROLES.COORDINATOR && issue.centerId !== centerId) {
      return res.status(403).json({ error: 'No tens permís per veure esta incidència' });
    }
    if (role === ROLES.TEACHER && issue.creatorId !== userId) {
      return res.status(403).json({ error: 'No tens permís per veure esta incidència' });
    }

    res.json(issue);
  } catch (error) {
    console.error('❌ [API] Error fetching issue by ID:', error);
    res.status(500).json({ error: 'Error al obtenir la incidència' });
  }
};

export const addMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = IssueMessageSchema.safeParse({ ...req.body, issueId: Number(id) });
  
  if (!result.success) {
    console.error('❌ [API] Validation failed for new message:', JSON.stringify(result.error.format(), null, 2));
    return res.status(400).json({ error: 'Missatge invàlid', details: result.error.format() });
  }

  const { userId } = req.user!;
  try {
    const message = await IssueService.addMessage(Number(id), result.data.content, userId, result.data.isSystem);
    res.status(201).json(message);
  } catch (error) {
    console.error('❌ [API] Error adding message:', error);
    res.status(500).json({ error: 'Error al enviar el missatge' });
  }
};

export const updateIssueStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const { role, userId } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Només els administradors poden canviar l\'estat' });
  }

  try {
    const updated = await IssueService.updateStatus(Number(id), status, userId);
    res.json(updated);
  } catch (error) {
    console.error('❌ [API] Error updating status:', error);
    res.status(500).json({ error: 'Error al actualizar l\'estat' });
  }
};

export const updateIssuePriority = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { priority } = req.body;
  const { role, userId } = req.user!;

  if (role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Només els administradors poden canviar la prioritat' });
  }

  try {
    const updated = await IssueService.updatePriority(Number(id), priority, userId);
    res.json(updated);
  } catch (error) {
    console.error('❌ [API] Error updating priority:', error);
    res.status(500).json({ error: 'Error al actualizar la prioritat' });
  }
};
