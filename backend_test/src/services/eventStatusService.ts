import Event from "../models/event";
import Reservation from "../models/reservation";

export const updateEventStatuses = async () => {
  const now = new Date();

  // 1. Buscar eventos que ya terminaron y todavía no fueron finalizados
  const expiredEvents = await Event.find({
    endDateTime: { $lt: now },
    status: { $in: ['activo', 'agotado'] }
  }).select('_id');

  const expiredEventIds = expiredEvents.map(event => event._id);

  if (expiredEventIds.length > 0) {
    // 2. Pasar eventos vencidos a finalizado
    await Event.updateMany(
      {
        _id: { $in: expiredEventIds }
      },
      {
        $set: { status: 'finalizado' }
      }
    );

    // 3. Pasar reservas activas de esos eventos a completed
    await Reservation.updateMany(
      {
        event: { $in: expiredEventIds },
        status: 'active'
      },
      {
        $set: { status: 'completed' }
      }
    );
  }

  // 4. Eventos activos que se quedaron sin cupo
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

  // 5. Eventos agotados que recuperaron cupo
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