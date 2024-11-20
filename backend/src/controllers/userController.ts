import { Request, Response } from 'express';
import prisma from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
        res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error: any) {
        res.status(400).json({ error: 'User registration failed', details: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string);
            res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
        } else {
            res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
    }
};