// src/middleware/auth.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET as string;

// Extender la interfaz Request de Express
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createHttpError(401, 'Token de acceso requerido');
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Agregar usuario al request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createHttpError(401, 'Token inválido'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createHttpError(401, 'Token expirado'));
    } else {
      next(error);
    }
  }
};

// Middleware para requerir rol específico
export const requireRole = (role: 'admin' | 'user'): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      throw createHttpError(401, 'Autenticación requerida');
    }

    if (req.user.role !== role) {
      throw createHttpError(403, 'No tienes permisos para esta acción');
    }

    next();
  };
};

// Alias común para requerir admin
export const requireAdmin = requireRole('admin');