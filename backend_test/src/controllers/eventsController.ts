// backend/src/controllers/eventController.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import Event from "../models/event";
import Reservation from "../models/reservation";
import {
  CreateEventRequest,
  UpdateEventRequest,
  EventsFilter,
  SingleEventResponse,
  EventsResponse
} from "../types/event.types";

// CREAR NUEVO EVENTO (con autenticación y validaciones completas)
export const createEvent: RequestHandler<unknown, unknown, CreateEventRequest> = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const {
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      maxParticipants,
      interestCategory,
    } = req.body;

    // Validaciones básicas
    if (!title?.trim()) {
      throw createHttpError(400, 'El título es requerido');
    }
    if (!description?.trim()) {
      throw createHttpError(400, 'La descripción es requerida');
    }
    if (!location?.trim()) {
      throw createHttpError(400, 'La ubicación es requerida');
    }
    if (!startDateTime) {
      throw createHttpError(400, 'La fecha de inicio es requerida');
    }
    if (!endDateTime) {
      throw createHttpError(400, 'La fecha de fin es requerida');
    }
    if (!maxParticipants || maxParticipants < 1 || maxParticipants > 10) {
      throw createHttpError(400, 'El número de participantes debe ser entre 1 y 10');
    }
    if (!interestCategory?.trim()) {
      throw createHttpError(400, 'La categoría es requerida');
    }

    // Validar fechas
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    const now = new Date();

    if (startDate <= now) {
      throw createHttpError(400, 'La fecha de inicio debe ser futura');
    }

    if (endDate <= startDate) {
      throw createHttpError(400, 'La fecha de fin debe ser posterior al inicio');
    }

    // Validar categoría
    const validCategories = ['tecnología', 'negocios', 'artes', 'deportes', 'educacion', 'networking'];
    if (!validCategories.includes(interestCategory)) {
      throw createHttpError(400, 'Categoría no válida');
    }

    // Crear evento con createdBy
    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startDateTime: startDate,
      endDateTime: endDate,
      maxParticipants,
      currentParticipants: 0,
      interestCategory: interestCategory.trim(),
      status: 'activo',
      createdBy: userId
    });

    const response: SingleEventResponse = {
      success: true,
      message: 'Evento creado exitosamente',
      data: newEvent
    };

    res.status(201).json(response);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return next(createHttpError(400, messages.join(', ')));
    }
    next(error);
  }
};

// OBTENER EVENTO POR ID
export const getEventById: RequestHandler = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }

    const event = await Event.findById(eventId);
    
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

     const serializedEvent = {
      ...event.toObject(),
      _id: event._id.toString(),
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      // Si createdBy es ObjectId, también serialízalo
      createdBy: event.createdBy.toString()
    };
    
    res.status(200).json({
      success: true,
      data: serializedEvent
    });
  } catch (error) {
    next(error);
  }
};

// ACTUALIZAR EVENTO (con validaciones de permisos)
export const updateEvent: RequestHandler<{ eventId: string }, unknown, UpdateEventRequest> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;
    const updateData = req.body;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }

    // Buscar evento
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }
    if (event.status !== 'activo') {
      throw createHttpError(400, 'Solo eventos activos pueden editarse');
    }

    if (event.currentParticipants > 0) {
      throw createHttpError(400, 'No se puede editar un evento con participantes inscritos');
    }

    // Validar fechas si se actualizan
    if (updateData.startDateTime || updateData.endDateTime) {
      const startDate = updateData.startDateTime ? new Date(updateData.startDateTime) : event.startDateTime;
      const endDate = updateData.endDateTime ? new Date(updateData.endDateTime) : event.endDateTime;
      const now = new Date();

      if (startDate <= now) {
        throw createHttpError(400, 'La fecha de inicio debe ser futura');
      }

      if (endDate <= startDate) {
        throw createHttpError(400, 'La fecha de fin debe ser posterior al inicio');
      }
    }

    // Validar que no se intente actualizar currentParticipants directamente
    if (updateData.currentParticipants !== undefined) {
      throw createHttpError(400, 'No se puede actualizar currentParticipants directamente');
    }

    // Actualizar solo los campos proporcionados
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: updatedEvent
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return next(createHttpError(400, messages.join(', ')));
    }
    next(error);
  }
};

// ELIMINAR EVENTO (con validaciones de permisos)
export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }

    // Buscar evento
    const event = await Event.findById(eventId);
    
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }
    if (event.status !== 'activo') {
      throw createHttpError(400, 'Solo eventos activos pueden eliminarse');
    }
   

    // Verificar que no tenga participantes inscritos
    if (event.currentParticipants > 0) {
      throw createHttpError(400, 'No puedes eliminar un evento con participantes inscritos');
    }


    // Eliminar evento
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// OBTENER EVENTOS CON FILTROS 
export const getFilteredEvents: RequestHandler<unknown, unknown, unknown, EventsFilter> = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '6');
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Filtros
    if (req.query.interestCategory) {
      filter.interestCategory = req.query.interestCategory;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      filter.startDateTime = {};
      if (req.query.dateFrom) {
        filter.startDateTime.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.startDateTime.$lte = new Date(req.query.dateTo);
      }
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { location: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filtrar eventos donde el usuario tiene reserva activa
    if (req.query.myReservation === "true" && req.user?.userId) {
      const myReservations = await Reservation.find({
        user: req.user.userId,
        status: 'active'
      }).select('event');

      const eventIds = myReservations.map(r => r.event);
      if (eventIds.length > 0) {
        filter._id = { $in: eventIds };
      } else {
        // Si no tiene reservas, devolver array vacío
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalEvents: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }
    }

    // Actualizar automáticamente eventos finalizados
    const now = new Date();
    await Event.updateMany(
      {
        ...filter,
        endDateTime: { $lt: now },
        status: { $in: ['activo', 'agotado'] }
      },
      { status: 'finalizado' }
    );

    const [events, totalEvents] = await Promise.all([
      Event.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ startDateTime: 1 }),
      Event.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    const response: EventsResponse = {
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// OBTENER EVENTOS DEL USUARIO ACTUAL
export const getMyEvents: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const events = await Event.find({ createdBy: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};
