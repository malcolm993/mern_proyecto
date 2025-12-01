// src/controllers/reservationController.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import Reservation from "../models/reservation";
import Event from "../models/event";
import { CreateReservationRequest, ReservationResponse, UserReservationsResponse,PopulatedReservation } from "../types/reservation.type";

// Crear nueva reserva
export const createReservation: RequestHandler<unknown, unknown, CreateReservationRequest> = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    if (!eventId) {
      throw createHttpError(400, 'ID de evento es requerido');
    }

    // Validar que el evento existe
    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    // Validar que el evento está activo
    if (event.status !== 'activo') {
      throw createHttpError(400, `No se puede reservar un evento con estado: ${event.status}`);
    }

    // Validar que el evento no ha comenzado
    const now = new Date();
    if (new Date(event.startDateTime) <= now) {
      throw createHttpError(400, 'No se puede reservar un evento que ya ha comenzado');
    }

    // Validar que no está lleno
    if (event.currentParticipants >= event.maxParticipants) {
      throw createHttpError(400, 'El evento ha alcanzado el máximo de participantes');
    }

    // Validar límite de 3 reservas activas por usuario
    const activeReservationsCount = await Reservation.countDocuments({
      user: userId,
      status: 'active'
    });

    if (activeReservationsCount >= 3) {
      throw createHttpError(400, 'Límite de 3 reservas activas alcanzado');
    }

    // Validar que no tiene ya una reserva activa para este evento
    const existingReservation = await Reservation.findOne({
      user: userId,
      event: eventId,
      status: 'active'
    });

    if (existingReservation) {
      throw createHttpError(400, 'Ya tienes una reserva activa para este evento');
    }

    // Crear la reserva
    const reservation = await Reservation.create({
      user: userId,
      event: eventId,
      status: 'active'
    });

    // Incrementar currentParticipants en el evento
    event.currentParticipants += 1;
    
    // Actualizar estado si se llenó
    if (event.currentParticipants >= event.maxParticipants) {
      event.status = 'agotado';
    }

    await event.save();

    const response: ReservationResponse = {
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        reservation: {
          _id: reservation._id.toString(),
          user: reservation.user.toString(),
          event: reservation.event.toString(),
          status: reservation.status,
          createdAt: reservation.createdAt
        },
        event: {
          currentParticipants: event.currentParticipants,
          maxParticipants: event.maxParticipants,
          status: event.status
        }
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// Cancelar reserva
export const cancelReservation: RequestHandler = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    if (!mongoose.isValidObjectId(reservationId)) {
      throw createHttpError(400, 'ID de reserva no válido');
    }

    // Buscar reserva
    const reservation = await Reservation.findById(reservationId).populate('event');
    if (!reservation) {
      throw createHttpError(404, 'Reserva no encontrada');
    }

    // Validar que el usuario es el dueño de la reserva
    if (reservation.user.toString() !== userId) {
      throw createHttpError(403, 'No tienes permisos para cancelar esta reserva');
    }

    // Validar que la reserva está activa
    if (reservation.status !== 'active') {
      throw createHttpError(400, `No se puede cancelar una reserva con estado: ${reservation.status}`);
    }

    // Validar que el evento no ha comenzado
    const event = await Event.findById(reservation.event);
    if (event && new Date(event.startDateTime) <= new Date()) {
      throw createHttpError(400, 'No se puede cancelar una reserva de un evento que ya ha comenzado');
    }

    // Cancelar reserva
    reservation.status = 'cancelled';
    await reservation.save();

    // Decrementar currentParticipants en el evento
    if (event) {
      event.currentParticipants = Math.max(0, event.currentParticipants - 1);
      
      // Reactivar evento si estaba agotado
      if (event.status === 'agotado' && event.currentParticipants < event.maxParticipants) {
        event.status = 'activo';
      }
      
      await event.save();
    }

    res.status(200).json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: {
        reservation: {
          _id: reservation._id.toString(),
          status: reservation.status
        },
        event: event ? {
          currentParticipants: event.currentParticipants,
          maxParticipants: event.maxParticipants,
          status: event.status
        } : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener reservas del usuario actual
export const getUserReservations: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const reservations = await Reservation.find({ user: userId })
      .populate('event', 'title startDateTime endDateTime location status')
      .sort({ createdAt: -1 }) as unknown as PopulatedReservation[];

    const response: UserReservationsResponse = {
      success: true,
      data: {
        reservations: reservations.map(reservation => ({
          _id: reservation._id.toString(),
          status: reservation.status,
          createdAt: reservation.createdAt,
          eventDetails: {
            _id: reservation._id.toString(),
            title: reservation.event.title,
            startDateTime: reservation.event.startDateTime,
            endDateTime: reservation.event.endDateTime,
            location: reservation.event.location,
            status: reservation.event.status
          }
        }))
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};


// Obtener estadísticas de reservas del usuario
export const getReservationStats: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const stats = await Reservation.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const activeCount = stats.find(s => s._id === 'active')?.count || 0;
    const cancelledCount = stats.find(s => s._id === 'cancelled')?.count || 0;
    const completedCount = stats.find(s => s._id === 'completed')?.count || 0;

    res.status(200).json({
      success: true,
      data: {
        active: activeCount,
        cancelled: cancelledCount,
        completed: completedCount,
        total: activeCount + cancelledCount + completedCount
      }
    });
  } catch (error) {
    next(error);
  }
};