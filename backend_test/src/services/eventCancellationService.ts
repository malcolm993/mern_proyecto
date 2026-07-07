// src/services/eventCancellationService.ts
import Event from "../models/event";
import Reservation from "../models/reservation";

export const cancelEventWithReservations = async (eventId: string) => {
  const event = await Event.findById(eventId);

  if (!event) {
    return null;
  }

  event.status = 'cancelado';
  await event.save();

  await Reservation.updateMany(
    {
      event: eventId,
      status: 'active'
    },
    {
      $set: { status: 'cancelled' }
    }
  );

  return event;
};