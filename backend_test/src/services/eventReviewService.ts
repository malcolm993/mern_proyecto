import createHttpError from "http-errors";
import Event from "../models/event";
import EventReview from "../models/eventReview";
import mongoose from "mongoose";
import {
  ensureEventCreator,
  ensureUserCompletedReservationForEvent
} from "./eventPermissionService";

export const validateReviewCreation = async (
  eventId: string,
  userId: string,
  rating: number,
  comment?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento invÃ¡lido');
  }
  const event = await Event.findById(eventId);

  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }

  if (event.status !== 'finalizado') {
    throw createHttpError(400, 'Solo se pueden calificar eventos finalizados');
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw createHttpError(400, 'La valoraciÃ³n debe estar entre 1 y 5');
  }

  if (comment && comment.trim().length > 100) {
    throw createHttpError(400, 'El comentario no puede superar los 100 caracteres');
  }

  await ensureUserCompletedReservationForEvent(
    eventId,
    userId,
    'No tienes una reserva completada para este evento'
  );

  const existingReview = await EventReview.findOne({
    event: eventId,
    user: userId
  });

  if (existingReview) {
    throw createHttpError(400, 'Ya realizaste una valoraciÃ³n para este evento');
  }

  return event;
};

export const createEventReviewService = async (
  eventId: string,
  userId: string,
  rating: number,
  comment?: string
) => {
  await validateReviewCreation(eventId, userId, rating, comment);

  const reviewData: {
    event: string;
    user: string;
    rating: number;
    comment?: string;
  } = {
    event: eventId,
    user: userId,
    rating,
  }

  const trimmedComment = comment?.trim();
  if (trimmedComment) {
    reviewData.comment = trimmedComment;
  }
  let review;
  try {
    review = await EventReview.create(reviewData);
  } catch (error: any) {
    if (error.code === 11000) {
      throw createHttpError(400, 'Ya realizaste una valoraciÃ³n para este evento');
    }
    throw error;
  }

  const updatedEvent = await recalculateEventRating(eventId);

  return { review, event: updatedEvent };
};

export const recalculateEventRating = async (eventId: string) => {
  const stats = await EventReview.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  const averageRating = stats[0]?.averageRating ?? 0;
  const ratingCount = stats[0]?.ratingCount ?? 0;

  return Event.findByIdAndUpdate(
    eventId,
    { averageRating, ratingCount },
    { new: true }
  );
};

export const getEventReviewsService = async (
  eventId: string,
  userId: string,
  userRole?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento invÃ¡lido');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }

  if (event.status !== 'finalizado') {
    throw createHttpError(400, 'Solo se pueden ver reseñas de eventos finalizados');
  }

  if (userRole === 'admin') {
    ensureEventCreator(event, userId, 'Solo el organizador que creó el evento puede ver estas reseñas');
  } else {
    await ensureUserCompletedReservationForEvent(
      eventId,
      userId,
      'No tienes una reserva completada para este evento'
    );
  }

  const reviews = await EventReview.find({ event: eventId }).populate('user', 'name email').sort({ createdAt: -1 });
  return reviews;
};
export const getUserEventReviewService = async (eventId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento invÃ¡lido');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }
  if (!userId) {
    throw createHttpError(400, 'ID de usuario no proporcionado');
  }
  const review = await EventReview.findOne({ event: eventId, user: userId }).populate('user', 'name email');
  return review;
};

export const getAllReviewsByUserService = async (userId: string) => {
  const reviews = await EventReview.find({ user: userId })
    .populate('event', 'title startDateTime endDateTime status averageRating').sort({ createdAt: -1 });
  return reviews;
}

export const deleteEventReviewService = async (eventId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento invÃ¡lido');
  }
  if (!userId) {
    throw createHttpError(400, 'ID de usuario no proporcionado');
  }
  const review = await EventReview.findOneAndDelete({ event: eventId, user: userId });
  if (!review) {
    throw createHttpError(404, 'ValoraciÃ³n no encontrada');
  }
  const updatedEvent = await recalculateEventRating(eventId);
  return { review, event: updatedEvent };
};
