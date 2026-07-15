import createHttpError from "http-errors";
import Event from "../models/event";
import Reservation from "../models/reservation";
import EventReview from "../models/eventReview";
import mongoose from "mongoose";

export const validateReviewCreation = async (
  eventId: string,
  userId: string,
  rating: number,
  comment?: string
) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento inválido');
  }
  const event = await Event.findById(eventId);

  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }

  if (event.status !== 'finalizado') {
    throw createHttpError(400, 'Solo se pueden calificar eventos finalizados');
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw createHttpError(400, 'La valoración debe estar entre 1 y 5');
  }

  if (comment && comment.trim().length > 100) {
    throw createHttpError(400, 'El comentario no puede superar los 100 caracteres');
  }

  const reservation = await Reservation.findOne({
    event: eventId,
    user: userId,
    status: { $in: ['active', 'completed'] }
  });

  if (!reservation) {
    throw createHttpError(400, 'No tienes una reserva para este evento');
  }

  const existingReview = await EventReview.findOne({
    event: eventId,
    user: userId
  });

  if (existingReview) {
    throw createHttpError(400, 'Ya realizaste una valoración para este evento');
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
      throw createHttpError(400, 'Ya realizaste una valoración para este evento');
    }
    throw error;
  }

  // luego recalcular promedio
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

export const getEventReviewsService = async (eventId: string) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento inválido');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }

  const reviews = await EventReview.find({ event: eventId }).populate('user', 'name email').sort({ createdAt: -1 });
  return reviews;
};
export const getUserEventReviewService = async (eventId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento inválido');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }
  if (!userId) {
    throw createHttpError(400, 'ID de usuario no proporcionado');
  }
  const review = await EventReview.findOne({ event: eventId, user: userId }).populate('user', 'name email');
  const updatedEvent = await recalculateEventRating(eventId);
  return { review, event: updatedEvent };
};

export const getAllReviewsByUserService = async (userId: string) => {
  const reviews = await EventReview.find({ user: userId })
    .populate('event', 'title startDateTime endDateTime status averageRating').sort({ createdAt: -1 });
  return reviews;
}

export const deleteEventReviewService = async (eventId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw createHttpError(400, 'ID de evento inválido');
  }
  if (!userId) {
    throw createHttpError(400, 'ID de usuario no proporcionado');
  }
  const review = await EventReview.findOneAndDelete({ event: eventId, user: userId });
  if (!review) {
    throw createHttpError(404, 'Valoración no encontrada');
  }
  return review;
};
