import Event from "../models/event";

export const updateEventStatuses = async () => {
  const now = new Date();

  // 1. Eventos que ya terminaron
  await Event.updateMany(
    {
      endDateTime: { $lt: now },
      status: { $in: ['activo', 'agotado'] }
    },
    {
      $set: { status: 'finalizado' }
    }
  );

  // 2. Eventos activos que se quedaron sin cupo
  await Event.updateMany(
    {
      endDateTime: { $gte: now },
      status: 'activo',
      $expr: {
        $gte: ['$currentParticipants', '$maxParticipants']
      }
    },
    {
      $set: { status: 'agotado' }
    }
  );

  // 3. Eventos agotados que recuperaron cupo
  await Event.updateMany(
    {
      startDateTime: { $gt: now },
      endDateTime: { $gte: now },
      status: 'agotado',
      $expr: {
        $lt: ['$currentParticipants', '$maxParticipants']
      }
    },
    {
      $set: { status: 'activo' }
    }
  );
};