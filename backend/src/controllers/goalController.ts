import { Request, Response } from 'express';
import prisma from '../models';

export const createGoal = async (req: Request, res: Response) => {
    const { description, targetScore, deadline, userId } = req.body;
    try {
        const goal = await prisma.goal.create({
            data: {
                description,
                targetScore: parseFloat(targetScore),
                deadline: new Date(deadline),
                userId: parseInt(userId)
            },
        });
        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create goal' });
    }
};

export const getGoals = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const goals = await prisma.goal.findMany({
            where: { userId: parseInt(userId) },
        });
        res.json(goals);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch goals' });
    }
};