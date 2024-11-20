// controllers/scoreController.ts

import { Request, Response, RequestHandler } from 'express';
import prisma from '../models';

export const createScore: RequestHandler = async (req: Request, res: Response) => {
    console.log('Received score creation request:', req.body);
    
    const { value, assignmentName, date, subjectId, userId } = req.body;
    
    try {
        // Validate all required fields
        if (!value || !assignmentName || !date || !subjectId || !userId) {
            console.error('Missing required fields:', { value, assignmentName, date, subjectId, userId });
            res.status(400).json({ 
                error: 'Missing required fields',
                details: 'All fields (value, assignmentName, date, subjectId, userId) are required'
            });
            return;
        }

        // Create the score with proper type conversion
        const score = await prisma.score.create({
            data: {
                value: parseFloat(value),
                assignmentName,
                date: new Date(date),
                subjectId: Number(subjectId),
                userId: Number(userId)
            },
            include: {
                subject: true
            }
        });

        console.log('Score created successfully:', score);
        res.json(score);
    } catch (error: any) {
        console.error('Error creating score:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        
        res.status(400).json({ 
            error: 'Failed to create score', 
            details: error.message,
            code: error.code
        });
    }
};

export const getScores: RequestHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const scores = await prisma.score.findMany({
            where: { userId: parseInt(userId) },
            include: { subject: true },
        });
        res.json(scores);
    } catch (error: any) {
        console.error('Error fetching scores:', error);
        res.status(400).json({ 
            error: 'Failed to fetch scores', 
            details: error.message 
        });
    }
};