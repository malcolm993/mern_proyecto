import { RequestHandler } from "express";
import createHttpError from "http-errors";
import AgendaItem from "../models/agendaItem";
import Event from "../models/event";
import { updateEventStatuses } from "../services/eventStatusService";
import { getAuthenticatedUserId, validateObjectId } from "../services/requestValidationService";
import { ensureEventCreator } from "../services/eventPermissionService";

export const getEventAgenda: RequestHandler<{ eventId: string }> = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    validateObjectId(eventId, 'ID de evento');

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
    const userId = getAuthenticatedUserId(req.user?.userId);

    validateObjectId(eventId, 'ID de evento');
    await updateEventStatuses();

    const event = await Event.findById(eventId);
    if (!event) {
      throw createHttpError(404, 'Evento no encontrado');
    }

    ensureEventCreator(event, userId, 'No tienes permiso para agregar actividades a este evento');

    if (!title?.trim()) {
      throw createHttpError(400, 'El titulo de agenda es requerido');
    }
    if (!startTime || !endTime) {
      throw createHttpError(400, 'La hora de inicio y fin son requeridas');
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw createHttpError(400, 'Fechas de agenda no validas');
    }
    if (end <= start) {
      throw createHttpError(400, 'La hora de fin debe ser posterior a la hora de inicio');
    }

    if (start < event.startDateTime || end > event.endDateTime) {
      throw createHttpError(
        400,
        `Las actividades deben estar dentro del horario del evento (${event.startDateTime.toISOString()} - ${event.endDateTime.toISOString()})`
      );
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
    const userId = getAuthenticatedUserId(req.user?.userId);

    validateObjectId(agendaItemId, 'ID de agenda');

    const agendaItem = await AgendaItem.findById(agendaItemId);
    if (!agendaItem) {
      throw createHttpError(404, 'Actividad de agenda no encontrada');
    }

    await updateEventStatuses();

    const event = await Event.findById(agendaItem.event);
    if (!event) {
      throw createHttpError(404, 'Evento asociado no encontrado');
    }

    ensureEventCreator(event, userId, 'Solo el organizador que creo el evento puede editar su agenda');

    const updateData = { ...req.body };
    if (updateData.title !== undefined) updateData.title = updateData.title.trim();
    if (updateData.description !== undefined) updateData.description = updateData.description.trim();
    if (updateData.speaker !== undefined) updateData.speaker = updateData.speaker.trim();

    const start = updateData.startTime ? new Date(updateData.startTime) : agendaItem.startTime;
    const end = updateData.endTime ? new Date(updateData.endTime) : agendaItem.endTime;

    updateData.startTime = start;
    updateData.endTime = end;
    if (end.getTime() <= start.getTime()) {
      throw createHttpError(400, 'La hora de fin debe ser posterior a la hora de inicio');
    }

    if (start < event.startDateTime || end > event.endDateTime) {
      throw createHttpError(
        400,
        `Las actividades deben estar dentro del horario del evento (${event.startDateTime.toISOString()} - ${event.endDateTime.toISOString()})`
      );
    }

    const updatedAgendaItem = await AgendaItem.findByIdAndUpdate(
      agendaItemId,
      { $set: updateData },
      { new: true, runValidators: false }
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
    const userId = getAuthenticatedUserId(req.user?.userId);

    validateObjectId(agendaItemId, 'ID de agenda');

    const agendaItem = await AgendaItem.findById(agendaItemId);
    if (!agendaItem) {
      throw createHttpError(404, 'Actividad de agenda no encontrada');
    }

    const event = await Event.findById(agendaItem.event);
    if (!event) {
      throw createHttpError(404, 'Evento asociado no encontrado');
    }

    ensureEventCreator(event, userId, 'Solo el organizador que creo el evento puede eliminar su agenda');

    await AgendaItem.findByIdAndDelete(agendaItemId);

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
    validateObjectId(eventId, 'ID de evento');

    await updateEventStatuses();

    const event = await Event.findOne({
      _id: eventId,
      status: 'activo',
      startDateTime: { $gte: new Date() }
    });
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
