import { RequestHandler } from "express";
import modelEvent from "../models/event";
import createHttpError from "http-errors";
import mongoose from "mongoose";


export const getEvents: RequestHandler = async (req, res, next) => {
  try {
    const events = await modelEvent.find();
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

interface CreateEventBody {
  title?: string;
  description?: string;
  location?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  maxParticipants?: number;
  interestCategory?: string;
  status?: string; // Opcional
}

export const createEvent: RequestHandler<unknown, unknown, CreateEventBody> = async (req, res, next) => {
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
      status = 'pre-activo'  // Valor por defecto
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
      status,
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

export const getEvent: RequestHandler = async (req, res, next) => {

  try {

    const { eventId } = req.params;
    if(!mongoose.isValidObjectId(eventId)){
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

interface UpdateEventBody {
  title?: string;
  description?: string;
  location?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  maxParticipants?: number;
  interestCategory?: string;
  status?: string;
  currentParticipants?: number;
};
interface UpdateEventParams {
  eventId: string;
};


export const updateEvent: RequestHandler<UpdateEventParams, unknown, UpdateEventBody> = async (req, res, next) => {
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

    if(updateData.startDateTime && updateData.endDateTime){
      const start = new Date(updateData.startDateTime);
      const end = new Date(updateData.endDateTime);
      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'La fecha de inicio debe ser anterior a la fecha de finalización'
        });
      }
    }

    if(updateData.startDateTime || updateData.endDateTime){
      const event = await modelEvent.findById(eventId);
      if(event){
        const startDate= updateData.startDateTime ? new Date(updateData.startDateTime) : event.startDateTime;
        const endDate= updateData.endDateTime ? new Date(updateData.endDateTime) : event.endDateTime;
        if (startDate >= endDate) {
          return res.status(400).json({
            success: false,
            error: 'La fecha de inicio debe ser anterior a la fecha de finalización'
          });
        }
      }
    }

    if(updateData.currentParticipants !== undefined ){
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

export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    if(!mongoose.isValidObjectId(eventId)){
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