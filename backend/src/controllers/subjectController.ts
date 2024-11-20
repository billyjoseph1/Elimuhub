import { Request, Response, RequestHandler } from 'express';
import prisma from '../models';

export const createSubject: RequestHandler = async (req: Request, res: Response) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        res.status(400).json({ error: 'Name and userId are required' });
        return;
    }
    try {
        const subject = await prisma.subject.create({
            data: { name, userId: parseInt(userId, 10) },
        });
        res.json(subject);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
};

export const getSubjects: RequestHandler = async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
    }
    
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
        res.status(400).json({ error: 'Invalid userId' });
        return;
    }

    try {
        const subjects = await prisma.subject.findMany({
            where: { userId: parsedUserId },
        });
        res.json(subjects);
        return;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
        return;
    }
};