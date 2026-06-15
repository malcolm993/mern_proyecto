import { RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import ContactRequest from "../models/contactRequest";
import User from "../models/user";

const populateUsers = [
  { path: 'requester', select: 'name email company businessArea interests bio' },
  { path: 'receiver', select: 'name email company businessArea interests bio' }
];

export const createContactRequest: RequestHandler = async (req, res, next) => {
  try {
    const requester = req.user?.userId;
    const { receiverId, message } = req.body;

    if (!requester) {
      throw createHttpError(401, 'Usuario no autenticado');
    }
    if (!mongoose.isValidObjectId(receiverId)) {
      throw createHttpError(400, 'ID de destinatario no vÃ¡lido');
    }
    if (requester === receiverId) {
      throw createHttpError(400, 'No puedes enviarte una solicitud a ti mismo');
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      throw createHttpError(404, 'Usuario destinatario no encontrado');
    }

    const existing = await ContactRequest.findOne({
      requester,
      receiver: receiverId,
      status: 'pending'
    });
    if (existing) {
      throw createHttpError(409, 'Ya existe una solicitud pendiente para este usuario');
    }

    const contactRequest = await ContactRequest.create({
      requester,
      receiver: receiverId,
      message: message?.trim(),
      status: 'pending'
    });

    const populated = await contactRequest.populate(populateUsers);

    res.status(201).json({
      success: true,
      message: 'Solicitud de contacto enviada',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedRequests: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const requests = await ContactRequest.find({ receiver: userId })
      .populate(populateUsers)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getSentRequests: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }

    const requests = await ContactRequest.find({ requester: userId })
      .populate(populateUsers)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = (status: 'accepted' | 'rejected'): RequestHandler<{ id: string }> => async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw createHttpError(401, 'Usuario no autenticado');
    }
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError(400, 'ID de solicitud no vÃ¡lido');
    }

    const contactRequest = await ContactRequest.findById(id);
    if (!contactRequest) {
      throw createHttpError(404, 'Solicitud no encontrada');
    }
    if (contactRequest.receiver.toString() !== userId) {
      throw createHttpError(403, 'Solo el destinatario puede responder la solicitud');
    }
    if (contactRequest.status !== 'pending') {
      throw createHttpError(400, `No se puede modificar una solicitud con estado ${contactRequest.status}`);
    }

    contactRequest.status = status;
    await contactRequest.save();
    const populated = await contactRequest.populate(populateUsers);

    res.status(200).json({
      success: true,
      message: status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = updateRequestStatus('accepted');
export const rejectRequest = updateRequestStatus('rejected');
