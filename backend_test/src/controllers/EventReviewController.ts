import {RequestHandler} from 'express';
import createHttpError from 'http-errors';
import { CreateEventReviewRequest } from '../types/eventReview.types';
import { createEventReviewService, deleteEventReviewService, getAllReviewsByUserService, getEventReviewsService, getUserEventReviewService } from '../services/eventReviewService';


export const createEventReview: RequestHandler<{eventId: string}, unknown,CreateEventReviewRequest> = async (req, res, next) => {
  // Implementation for creating an event review
  try{
    const { eventId } = req.params;
    const {rating, comment } = req.body;
    const userId = req.user?.userId;

    if(!userId){
      return next(createHttpError(401, 'Usuario no autenticado'));
    }
    const result = await createEventReviewService(eventId, userId, rating, comment);
    res.status(201).json({
      success: true,
      message: 'ValoraciÃ³n del evento creada exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getEventReviews: RequestHandler<{eventId: string}> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const reviews = await getEventReviewsService(eventId, userId, req.user?.role);
    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEventReview: RequestHandler<{eventId: string}> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const review = await getUserEventReviewService(eventId, userId);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const getEventReviewsByUser: RequestHandler = async (req, res, next) => {
  try {
    const  userId  = req.user?.userId;
    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }
    const review = await getAllReviewsByUserService(userId);
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEventReview: RequestHandler<{eventId: string}> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }
    const result = await deleteEventReviewService(eventId, userId);
    res.status(200).json({
      success: true,
      message: 'Reseña eliminada exitosamente',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
