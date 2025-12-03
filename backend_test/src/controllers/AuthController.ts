// src/controllers/authController.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt, {SignOptions} from "jsonwebtoken";
import User from "../models/user";
import { RegisterRequest, LoginRequest, AuthResponse, JwtPayload } from "../types/auth.types";

const JWT_SECRET = (process.env.JWT_SECRET) as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ? 
  parseInt(process.env.JWT_EXPIRES_IN) : 604800;

if(!JWT_SECRET){
  throw new Error ("VARIABLE DE ENTORNO JWT_SECRET NO FUE INICALIZADA")
}
// Generar JWT Token
const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256' // ✅ Especificar algoritmo explícitamente
  };
  return jwt.sign(payload, JWT_SECRET, options);
};
// Registrar nuevo usuario
export const register: RequestHandler<unknown, unknown, RegisterRequest> = async (req, res, next) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Validaciones básicas
    if (!email || !password || !name) {
      throw createHttpError(400, 'Email, password y nombre son requeridos');
    }

    if (password.length < 6) {
      throw createHttpError(400, 'La contraseña debe tener al menos 6 caracteres');
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'El email ya está registrado');
    }

    // Crear usuario
    const user = await User.create({
      email,
      password, // Se hashea automáticamente en el pre-save hook
      name,
      role
    });

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Login de usuario
export const login: RequestHandler<unknown, unknown, LoginRequest> = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, 'Email y password son requeridos');
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Credenciales inválidas');
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Credenciales inválidas');
    }

    // Generar token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Obtener usuario actual
export const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    // 🔍 Buscar el usuario completo en la BD
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      throw createHttpError(404, 'Usuario no encontrado');
    }

    const response: AuthResponse = {
      success: true,
      message: 'Usuario actual obtenido',
      data: {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name, // ✅ Nombre obtenido de la BD
          role: user.role
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};