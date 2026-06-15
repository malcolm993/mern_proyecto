import express from 'express';
import * as UserController from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/suggestions', UserController.getSuggestions);

export default router;
