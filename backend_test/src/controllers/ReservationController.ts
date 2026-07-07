import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import Reservation from "../models/reservation";
import Event from "../models/event";
import {
  CreateReservationRequest,
  ReservationResponse,
  UserReservationsResponse,
  EventReservationsResponse
} from "../types/reservation.type";
import { cancelUserReservation, createReservationForEvent } from "../services/reservationService";
import { getAuthenticatedUserId, validateObjectId } from "../services/requestValidationService";
import { ensureEventCreator } from "../services/eventPermissionService";

export const createReservation: RequestHandler<unknown, unknown, CreateReservationRequest> = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = getAuthenticatedUserId(req.user?.userId);

    if (!eventId) {
      throw createHttpError(400, 'ID de evento es requerido');
    }

    const { reservation, event } = await createReservationForEvent(userId, eventId);

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

export const cancelReservation: RequestHandler<{ reservationId: string }> = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const userId = getAuthenticatedUserId(req.user?.userId);

    validateObjectId(reservationId, 'ID de reserva');

    const { reservation, event } = await cancelUserReservation(reservationId, userId);

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

export const getUserReservations: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req.user?.userId);

    const reservations = await Reservation.find({ user: userId })
      .populate('event', 'title startDateTime endDateTime location status interestCategory')
      .sort({ createdAt: -1 });

    const response: UserReservationsResponse = {
      success: true,
      data: {
        reservations: reservations.map(reservation => {
          if (!reservation.event || typeof reservation.event === 'string') {
            throw createHttpError(500, 'Error al cargar detalles del evento');
          }

          const event = reservation.event as any;

          return {
            _id: reservation._id.toString(),
            user: reservation.user.toString(),
            event: event._id.toString(),
            status: reservation.status,
            createdAt: reservation.createdAt.toISOString(),
            eventDetails: {
              _id: event._id.toString(),
              title: event.title || '',
              startDateTime: event.startDateTime?.toISOString() || '',
              endDateTime: event.endDateTime?.toISOString() || '',
              location: event.location || '',
              status: event.status || '',
              interestCategory: event.interestCategory || ''
            }
          };
        })
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getReservationStats: RequestHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUserId(req.user?.userId);

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

export const getEventReservations: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = getAuthenticatedUserId(req.user?.userId);

    validateObjectId(eventId, 'ID de evento');

    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    ensureEventCreator(event, userId, 'No tienes permiso para ver los inscriptos de este evento');

    const reservations = await Reservation.find({ event: eventId })
      .populate('user', 'name email company businessArea')
      .sort({ createdAt: 1 });

    const response: EventReservationsResponse = {
      success: true,
      data: {
        event: {
          _id: event._id.toString(),
          title: event.title,
          startDateTime: event.startDateTime.toISOString(),
          maxParticipants: event.maxParticipants,
          currentParticipants: event.currentParticipants
        },
        reservations: reservations.map((reservation) => {
          const participant = reservation.user as any;
          return {
            reservationId: reservation._id.toString(),
            status: reservation.status,
            registeredAt: reservation.createdAt.toISOString(),
            participant: {
              _id: participant._id.toString(),
              name: participant.name || '',
              email: participant.email || '',
              company: participant.company || undefined,
              businessArea: participant.businessArea || undefined
            }
          };
        })
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const exportEventReservationsCSV: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = getAuthenticatedUserId(req.user?.userId);

    validateObjectId(eventId, 'ID de evento');

    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    ensureEventCreator(event, userId, 'No tienes permiso para exportar los inscriptos de este evento');

    const reservations = await Reservation.find({ event: eventId, status: 'active' })
      .populate('user', 'name email company businessArea')
      .sort({ createdAt: 1 });

    const headers = ['Nombre', 'Email', 'Empresa', 'Rubro', 'Fecha de inscripcion'];

    const escapeCsvField = (value: string): string => {
      const stringValue = value ?? '';
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = reservations.map((reservation) => {
      const participant = reservation.user as any;
      return [
        escapeCsvField(participant.name || ''),
        escapeCsvField(participant.email || ''),
        escapeCsvField(participant.company || ''),
        escapeCsvField(participant.businessArea || ''),
        escapeCsvField(reservation.createdAt.toISOString())
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const bom = '\uFEFF';
    const fileName = `inscriptos_${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(bom + csvContent);
  } catch (error) {
    next(error);
  }
};
