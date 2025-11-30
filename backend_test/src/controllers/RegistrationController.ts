import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import modelEvent from "../models/event";

// aumentar reserva evento

export const joinEvent: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }

    const event = await modelEvent.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    if (event.status !== 'activo') {
      return res.status(400).json({
        success: false,
        error: 'No se puede unir al evento. El evento no está activo.'
      });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'No se puede unir al evento. El evento ha alcanzado el número máximo de participantes.'
      });
    }
    event.currentParticipants += 1;
    if (event.currentParticipants === event.maxParticipants) {
      event.status = 'agotado';
    }
    await event.save();
    res.status(200).json({
      success: true,
      message: 'Te has unido al evento exitosamente.',
      event: event
    });
  } catch (error) {
    next(error);
  }
}

export const leaveEvent: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }
    const event = await modelEvent.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }
    if (event.currentParticipants <= 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay participantes para abandonar el evento.'
      });
    }
    event.currentParticipants -= 1;
    if (event.status === 'agotado') {
      event.status = 'activo';
    }

    const now = new Date();
    if (new Date(event.startDateTime) <= now) {
      return res.status(400).json({
        success: false,
        error: 'No se puede abandonar el evento. El evento ya ha comenzado.'
      });
    }


    await event.save();
    res.status(200).json({
      success: true,
      message: 'Has abandonado el evento exitosamente.',
      data: {
        event: event,
        participants: {
          anotados: event.currentParticipants,
          maximo: event.maxParticipants
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export const getEventParticipants: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no válido');
    }
    const event = await modelEvent.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }
    res.status(200).json({
      success: true,
      data: {
        event: {
          _id: event._id,
          title: event.title,
          status: event.status,
        },
        participants: {
          anotados: event.currentParticipants,
          maximo: event.maxParticipants,
          disponibles: event.maxParticipants - event.currentParticipants
        }
      }
    });
  } catch (error) {
    next(error);
  } 
}