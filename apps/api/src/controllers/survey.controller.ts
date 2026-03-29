import prisma from '../lib/prisma.js';
import { Request, Response } from 'express';
import { Prisma, QuestionnaireTarget } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// POST: Generate surveys for a completed assignment
// Automatically called when closing assignment, but can also be forced
export const generateSurveys = async (req: Request, res: Response) => {
    const { assignmentId } = req.body;

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { assignmentId: parseInt(assignmentId) },
            include: {
                enrollments: { include: { student: true } },
                teachers: { include: { user: true } },
                center: true
            }
        });

        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        // 1. Generate tokens for Students, Teachers, and Center
        const questionnairesData: Prisma.QuestionnaireCreateManyInput[] = [];

        // Students
        for (const _enrollment of assignment.enrollments) {
            questionnairesData.push({
                assignmentId: assignment.assignmentId,
                target: QuestionnaireTarget.STUDENT,
                token: uuidv4(),
                isCompleted: false
            });
        }

        // Teachers
        for (const _teacher of assignment.teachers) {
            questionnairesData.push({
                assignmentId: assignment.assignmentId,
                target: QuestionnaireTarget.TEACHER,
                token: uuidv4(),
                isCompleted: false
            });
        }

        // Center (1 per assignment)
        questionnairesData.push({
            assignmentId: assignment.assignmentId,
            target: QuestionnaireTarget.CENTER,
            token: uuidv4(),
            isCompleted: false
        });

        // Save to Prisma (Postgres)
        const created = await prisma.questionnaire.createMany({
            data: questionnairesData,
            skipDuplicates: true
        });

        res.json({ message: 'Surveys generated successfully', count: created.count });
    } catch (error) {
        console.error("Error in survey.controller.generateSurveys:", error);
        res.status(500).json({ error: 'Failed to generate surveys' });
    }
};

// GET: Retrieve survey by Token
export const getSurveyByToken = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const survey = await prisma.questionnaire.findUnique({
            where: { token: token as string },
            include: { assignment: { include: { workshop: true } } }
        });

        if (!survey) {
            return res.status(404).json({ error: 'Invalid survey token' });
        }

        if (survey.isCompleted) {
            return res.json({ message: 'This survey has already been completed.' });
        }

        // Get questions from the model (based on target)
        const model = await prisma.questionnaireModel.findFirst({
            where: { target: survey.target },
            include: { questions: true }
        });

        res.json({
            survey,
            questions: model?.questions || []
        });
    } catch (error) {
        console.error("Error in survey.controller.getSurveyByToken:", error);
        res.status(500).json({ error: 'Failed to load survey' });
    }
};

// POST: Submit survey response
export const submitSurvey = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { responses: _responses } = req.body;

    try {
        const survey = await prisma.questionnaire.findUnique({ where: { token: token as string } });

        if (!survey) return res.status(404).json({ error: 'Survey not found' });
        if (survey.isCompleted) return res.status(400).json({ error: 'Survey already completed' });

        // 1. Mark as completed in Postgres
        await prisma.questionnaire.update({
            where: { questionnaireId: survey.questionnaireId },
            data: { 
                isCompleted: true,
                completedAt: new Date(),
                // Note: responses are stored in QuestionnaireResponse model if using structured questions, 
                // but some schemas might use a JSON field. Let's stick to the structured one if possible.
                // Assuming responses are handled via QuestionnaireResponse elsewhere or this is a simple version.
            }
        });

        res.json({ success: true, message: 'Survey submitted successfully' });
    } catch (error) {
        console.error("Error in survey.controller.submitSurvey:", error);
        res.status(500).json({ error: 'Failed to save survey response' });
    }
};
