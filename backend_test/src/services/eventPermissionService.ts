import createHttpError from "http-errors";

type EventLike = {
  createdBy: {
    toString: () => string;
  };
  status: string;
  currentParticipants: number;
};

export const ensureEventCreator = (
  event: Pick<EventLike, 'createdBy'>,
  userId: string,
  message = 'No tienes permiso para modificar este evento'
) => {
  if (event.createdBy.toString() !== userId) {
    throw createHttpError(403, message);
  }
};

export const ensureEventIsActive = (
  event: Pick<EventLike, 'status'>,
  message = 'Solo eventos activos pueden modificarse'
) => {
  if (event.status !== 'activo') {
    throw createHttpError(400, message);
  }
};

export const ensureEventHasNoParticipants = (
  event: Pick<EventLike, 'currentParticipants'>,
  message = 'No se puede modificar un evento con participantes inscritos'
) => {
  if (event.currentParticipants > 0) {
    throw createHttpError(400, message);
  }
};
