import createHttpError from "http-errors";
import mongoose from "mongoose";

export const getAuthenticatedUserId = (userId?: string) => {
  if (!userId) {
    throw createHttpError(401, 'Usuario no autenticado');
  }

  return userId;
};

export const validateObjectId = (id: string, label = 'ID') => {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(400, `${label} no valido`);
  }
};
