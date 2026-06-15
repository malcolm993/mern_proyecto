import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import AgendaItem from "../models/agendaItem";
import Event from "../models/event";

export const getEventAgenda: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no vÃ¡lido');
    }

    const agenda = await AgendaItem.find({ event: eventId }).sort({ order: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: agenda
    });
  } catch (error) {
    next(error);
  }
};

export const createAgendaItem: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { title, description, speaker, startTime, endTime, order = 0 } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no vÃ¡lido');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    if (!title?.trim()) {
      throw createHttpError(400, 'El tÃ­tulo de agenda es requerido');
    }
    if (!startTime || !endTime) {
      throw createHttpError(400, 'La hora de inicio y fin son requeridas');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw createHttpError(400, 'Fechas de agenda no vÃ¡lidas');
    }
    if (end <= start) {
      throw createHttpError(400, 'La hora de fin debe ser posterior a la hora de inicio');
    }

    const agendaItem = await AgendaItem.create({
      event: eventId,
      title: title.trim(),
      description: description?.trim(),
      speaker: speaker?.trim(),
      startTime: start,
      endTime: end,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Actividad de agenda creada exitosamente',
      data: agendaItem
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgendaItem: RequestHandler<{ agendaItemId: string }> = async (req, res, next) => {
  try {
    const { agendaItemId } = req.params;

    if (!mongoose.isValidObjectId(agendaItemId)) {
      throw createHttpError(400, 'ID de agenda no vÃ¡lido');
    }

    const updateData = { ...req.body };
    if (updateData.title !== undefined) updateData.title = updateData.title.trim();
    if (updateData.description !== undefined) updateData.description = updateData.description.trim();
    if (updateData.speaker !== undefined) updateData.speaker = updateData.speaker.trim();

    const agendaItem = await AgendaItem.findById(agendaItemId);
    if (!agendaItem) {
      throw createHttpError(404, 'Actividad de agenda no encontrada');
    }

    const start = updateData.startTime ? new Date(updateData.startTime) : agendaItem.startTime;
    const end = updateData.endTime ? new Date(updateData.endTime) : agendaItem.endTime;
    if (end <= start) {
      throw createHttpError(400, 'La hora de fin debe ser posterior a la hora de inicio');
    }
    updateData.startTime = start;
    updateData.endTime = end;

    const updatedAgendaItem = await AgendaItem.findByIdAndUpdate(
      agendaItemId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Actividad de agenda actualizada exitosamente',
      data: updatedAgendaItem
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAgendaItem: RequestHandler<{ agendaItemId: string }> = async (req, res, next) => {
  try {
    const { agendaItemId } = req.params;

    if (!mongoose.isValidObjectId(agendaItemId)) {
      throw createHttpError(400, 'ID de agenda no vÃ¡lido');
    }

    const agendaItem = await AgendaItem.findByIdAndDelete(agendaItemId);
    if (!agendaItem) {
      throw createHttpError(404, 'Actividad de agenda no encontrada');
    }

    res.status(200).json({
      success: true,
      message: 'Actividad de agenda eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicEventAgenda: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.isValidObjectId(eventId)) {
      throw createHttpError(400, 'ID de evento no valido');
    }

    const event = await Event.findOne({ _id: eventId, status: 'activo' });
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado o no disponible');
    }

    const agenda = await AgendaItem.find({ event: eventId }).sort({ order: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      data: agenda
    });
  } catch (error) {
    next(error);
  }
};
