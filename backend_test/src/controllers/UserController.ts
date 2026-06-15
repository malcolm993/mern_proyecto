import { RequestHandler } from "express";
import createHttpError from "http-errors";
import User from "../models/user";

export const getSuggestions: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const currentUser = await User.findById(userId).select('businessArea interests');
    if (!currentUser) {
      throw createHttpError(404, 'Usuario no encontrado');
    }

    const filters = [];
    if (currentUser.businessArea) {
      filters.push({ businessArea: currentUser.businessArea });
    }
    if (currentUser.interests.length > 0) {
      filters.push({ interests: { $in: currentUser.interests } });
    }

    if (filters.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const suggestions = await User.find({
      _id: { $ne: userId },
      role: 'user',
      $or: filters
    })
      .select('name email role company businessArea interests bio')
      .limit(20)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};
