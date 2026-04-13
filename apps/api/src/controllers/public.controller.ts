import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

/**
 * Public Controller
 * Handles student interactions that don't require authentication (Surveys)
 */

export const verifyStudentForSurvey = async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Find student by email
        const student = await prisma.student.findUnique({
            where: { email: String(email).toLowerCase().trim() },
            include: {
                enrollments: {
                    where: {
                        assignment: {
                            status: 'COMPLETED'
                        },
                        selfConsultation: null // Only pending surveys
                    },
                    include: {
                        assignment: {
                            include: {
                                workshop: true
                            }
                        }
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ 
                error: 'STUDENT_NOT_FOUND',
                message: "No trobem cap alumne amb aquest correu electrónico." 
            });
        }

        if (student.enrollments.length === 0) {
            return res.status(404).json({ 
                error: 'NO_PENDING_SURVEYS',
                message: "No tens cap enquesta pendent per a tallers finalitzats." 
            });
        }

        // Return the first pending enrollment for the survey
        const enrollment = student.enrollments[0];
        res.json({
            studentId: student.studentId,
            fullName: `${student.fullName} ${student.lastName}`,
            enrollmentId: enrollment.enrollmentId,
            workshopTitle: enrollment.assignment.workshop.title,
            assignmentId: enrollment.assignmentId
        });

    } catch (error) {
        console.error('Error verifying student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const submitPublicSurvey = async (req: Request, res: Response) => {
    const { enrollmentId, ...surveyData } = req.body;

    if (!enrollmentId) {
        return res.status(400).json({ error: 'EnrollmentId is required' });
    }

    try {
        // Verify enrollment exists and doesn't have a survey yet
        const enrollment = await prisma.enrollment.findUnique({
            where: { enrollmentId: parseInt(enrollmentId) },
            include: { selfConsultation: true }
        });

        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
        if (enrollment.selfConsultation) return res.status(400).json({ error: 'Survey already submitted' });

        // Save survey
        const result = await prisma.studentSelfConsultation.create({
            data: {
                enrollmentId: enrollment.enrollmentId,
                taskPunctuality: surveyData.taskPunctuality || 10,
                respectForMaterial: surveyData.respectForMaterial || 10,
                learningInterest: surveyData.learningInterest || 10,
                resolutionAutonomy: surveyData.resolutionAutonomy || 10,
                experienceRating: surveyData.experienceRating || 10,
                teacherRating: surveyData.teacherRating || 10,
                vocationalImpact: surveyData.vocationalImpact || 'SI',
                personalImprovements: surveyData.personalImprovements,
                keyLearnings: surveyData.keyLearnings,
            }
        });

        res.json({ success: true, data: result });

    } catch (error) {
        console.error('Error submitting public survey:', error);
        res.status(500).json({ error: 'Failed to submit survey' });
    }
};
