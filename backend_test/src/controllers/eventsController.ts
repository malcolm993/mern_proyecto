import { RequestHandler } from "express";
import modelEvent from "../models/event";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import {CreateEventRequest, UpdateEventRequest, EventsFilter} from "../types/event.types"
import reservation from "../models/reservation";

// obtener todos los eventos

/*
export const getEvents: RequestHandler = async (req, res, next) => {
  try {
    const events = await modelEvent.find();
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};
*/


// crear un nuevo evento
export const createEvent: RequestHandler<unknown, unknown, CreateEventRequest> = async (req, res, next) => {
  try {
    //Destructuring más limpio
    const {
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      maxParticipants,
      interestCategory,
    } = req.body;

    if (!title || !description || !location || !startDateTime || !endDateTime || !maxParticipants || !interestCategory) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos'
      });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'La fecha de inicio debe ser anterior a la fecha de finalización'
      });
    }
    

    // Crear evento (puedes usar shorthand)
    const newEvent = await modelEvent.create({
      title,
      description,
      location,
      startDateTime,
      endDateTime,
      maxParticipants,
      interestCategory,
      status: 'activo', // Asignar estado por defecto
      currentParticipants: 0  // Inicializar en 0
    });



    res.status(201).json({
      success: true,
      data: newEvent
    });

  } catch (error) {
    next(error);
  }
};

// obtener un evento por id
export const getEvent: RequestHandler = async (req, res, next) => {

  try {

    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }
    const event = await modelEvent.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};


interface UpdateEventParams {
  eventId: string;
};

// update de evento
export const updateEvent: RequestHandler<UpdateEventParams, unknown, UpdateEventRequest> = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }

    const updateData = req.body;

    // Verificar que hay al menos un campo para actualizar
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    if (updateData.startDateTime && updateData.endDateTime) {
      const start = new Date(updateData.startDateTime);
      const end = new Date(updateData.endDateTime);
      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'La fecha de inicio debe ser anterior a la fecha de finalización'
        });
      }
    }

    if (updateData.startDateTime || updateData.endDateTime) {
      const event = await modelEvent.findById(eventId);
      if (event) {
        const startDate = updateData.startDateTime ? new Date(updateData.startDateTime) : event.startDateTime;
        const endDate = updateData.endDateTime ? new Date(updateData.endDateTime) : event.endDateTime;
        if (startDate >= endDate) {
          return res.status(400).json({
            success: false,
            error: 'La fecha de inicio debe ser anterior a la fecha de finalización'
          });
        }
      }
    }

    if ( updateData.currentParticipants !== undefined) {
      return res.status(400).json({
        success: false,
        error: 'No se puede actualizar currentParticipants directamente'
      });
    }

    // Actualizar SOLO los campos proporcionados
    const updatedEvent = await modelEvent.findByIdAndUpdate(
      eventId,
      updateData,  // ✅ Solo los campos que vienen en el body
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedEvent) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    res.status(200).json({
      success: true,
      data: updatedEvent
    });

  } catch (error) {
    next(error);
  }
};
// delete de evento
export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }
    const deletedEvent = await modelEvent.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      throw createHttpError(404, 'Evento no encontrado');
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};


export const getFilteredEvents: RequestHandler<unknown, unknown, unknown, EventsFilter> = async (req, res, next) => {
  try {

    
    const page = parseInt(req.query.page||'1');
    const limit = parseInt(req.query.limit||'6');
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.interestCategory) {
      filter.interestCategory = req.query.interestCategory;
    };

    if (req.query.status) {
      filter.status = req.query.status;
    };

    if (req.query.dateFrom || req.query.dateTo) {
      filter.startDateTime = {};
      if (req.query.dateFrom) {
        filter.startDateTime.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filter.startDateTime.$lte = new Date(req.query.dateTo);
      }
    };

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if(req.query.myReservation === "true" && req.user){
      const myReservation = await reservation.find({
        user: req.user.userId,
        status: 'active'
      }).select('event');

      const eventIds = myReservation.map(r => r.event);
      filter._id = { $in: eventIds}
    }



    const now = new Date();
    await modelEvent.updateMany(
      {
        ...filter,
        endDateTime: {$lt:now},
        status: {$in: ['activo', 'agotado']}
      },
      {status:'finalizado'}
    )

    const [events, totalEvents] = await Promise.all([
      modelEvent.find(filter).skip(skip).limit(limit).sort({ startDateTime: 1 }),
      modelEvent.countDocuments(filter)]);

      const totalPages = Math.ceil(totalEvents / limit);
    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  }catch (error) {
    next(error);
  }
};