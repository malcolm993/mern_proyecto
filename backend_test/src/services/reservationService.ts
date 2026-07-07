import createHttpError from "http-errors";
import Event from "../models/event";
import Reservation from "../models/reservation";

export const createReservationForEvent = async (userId: string, eventId: string) => {
  const event = await Event.findById(eventId);
  if (!event) {
    throw createHttpError(404, 'Evento no encontrado');
  }

  if (event.status !== 'activo') {
    throw createHttpError(400, `No se puede reservar un evento con estado: ${event.status}`);
  }

  if (new Date(event.startDateTime) <= new Date()) {
    throw createHttpError(400, 'No se puede reservar un evento que ya ha comenzado');
  }

  if (event.currentParticipants >= event.maxParticipants) {
    throw createHttpError(400, 'El evento ha alcanzado el máximo de participantes');
  }

  const activeReservationsCount = await Reservation.countDocuments({
    user: userId,
    status: 'active'
  });

  if (activeReservationsCount >= 3) {
    throw createHttpError(400, 'Límite de 3 reservas activas alcanzado');
  }

  const existingReservation = await Reservation.findOne({
    user: userId,
    event: eventId,
    status: 'active'
  });

  if (existingReservation) {
    throw createHttpError(400, 'Ya tienes una reserva activa para este evento');
  }

  const reservation = await Reservation.create({
    user: userId,
    event: eventId,
    status: 'active'
  });

  event.currentParticipants += 1;

  if (event.currentParticipants >= event.maxParticipants) {
    event.status = 'agotado';
  }

  await event.save();

  return { reservation, event };
};

export const cancelUserReservation = async (reservationId: string, userId: string) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw createHttpError(404, 'Reserva no encontrada');
  }

  if (reservation.user.toString() !== userId) {
    throw createHttpError(403, 'No tienes permisos para cancelar esta reserva');
  }

  if (reservation.status !== 'active') {
    throw createHttpError(400, `No se puede cancelar una reserva con estado: ${reservation.status}`);
  }

  const event = await Event.findById(reservation.event);
  if (event && new Date(event.startDateTime) <= new Date()) {
    throw createHttpError(400, 'No se puede cancelar una reserva de un evento que ya ha comenzado');
  }

  reservation.status = 'cancelled';
  await reservation.save();

  if (event) {
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);

    if (event.status === 'agotado' && event.currentParticipants < event.maxParticipants) {
      event.status = 'activo';
    }

    await event.save();
  }

  return { reservation, event };
};
