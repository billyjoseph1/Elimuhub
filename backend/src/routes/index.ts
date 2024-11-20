import express from 'express';
import { register, login } from '../controllers/userController';
import { createSubject, getSubjects } from '../controllers/subjectController';
import { createScore, getScores } from '../controllers/scoreController';
import { createGoal, getGoals } from '../controllers/goalController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/subjects', createSubject);
router.get('/subjects/:userId', getSubjects);

router.post('/scores', createScore);
router.get('/scores/:userId', getScores);

router.post('/goals', createGoal);
router.get('/goals/:userId', getGoals);

export default router;