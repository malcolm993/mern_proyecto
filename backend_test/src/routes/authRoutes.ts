// src/routes/auth.ts
import express from 'express';
import * as AuthController from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Registro público
router.post('/register', AuthController.register);

// Login público  
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;