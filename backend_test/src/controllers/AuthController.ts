// src/controllers/authController.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt, { SignOptions } from "jsonwebtoken";
import User, { User as UserDocument } from "../models/user";
import { RegisterRequest, LoginRequest, AuthResponse, JwtPayload } from "../types/auth.types";

const JWT_SECRET = (process.env.JWT_SECRET) as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?
  parseInt(process.env.JWT_EXPIRES_IN) : 604800;

if (!JWT_SECRET) {
  throw new Error("VARIABLE DE ENTORNO JWT_SECRET NO FUE INICALIZADA");
}

const serializeUser = (user: UserDocument) => ({
  _id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  ...(user.company ? { company: user.company } : {}),
  ...(user.businessArea ? { businessArea: user.businessArea } : {}),
  ...(user.interests ? { interests: user.interests } : {}),
  ...(user.bio ? { bio: user.bio } : {})
});

// Generar JWT Token
const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

// Registrar nuevo usuario
export const register: RequestHandler<unknown, unknown, RegisterRequest> = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      role = 'user',
      company,
      businessArea,
      interests = [],
      bio
    } = req.body;

    if (!email || !password || !name) {
      throw createHttpError(400, 'Email, password y nombre son requeridos');
    }

    if (password.length < 6) {
      throw createHttpError(400, 'La contraseña debe tener al menos 6 caracteres');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'El email ya está registrado');
    }

    const userData: Record<string, unknown> = {
      email,
      password,
      name,
      role,
      interests
    };

    if (company) userData.company = company;
    if (businessArea) userData.businessArea = businessArea;
    if (bio) userData.bio = bio;

    const user = new User(userData);
    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: serializeUser(user),
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

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Credenciales inválidas');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Credenciales inválidas');
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'Login exitoso',
      data: {
        user: serializeUser(user),
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

    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      throw createHttpError(404, 'Usuario no encontrado');
    }

    const response: AuthResponse = {
      success: true,
      message: 'Usuario actual obtenido',
      data: {
        user: serializeUser(user)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const { name, company, businessArea, interests, bio } = req.body;
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = String(name).trim();
    if (company !== undefined) updateData.company = String(company).trim();
    if (businessArea !== undefined) updateData.businessArea = String(businessArea).trim();
    if (bio !== undefined) updateData.bio = String(bio).trim();
    if (interests !== undefined) {
      if (!Array.isArray(interests)) {
        throw createHttpError(400, 'Los intereses deben enviarse como array');
      }
      updateData.interests = interests.map((interest) => String(interest).trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw createHttpError(404, 'Usuario no encontrado');
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado',
      data: {
        user: serializeUser(user)
      }
    });
  } catch (error) {
    next(error);
  }
};
