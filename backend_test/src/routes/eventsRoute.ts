import express from 'express';
import * as EventController from '../controllers/eventsController';


const router= express.Router();
router.get("/", EventController.getFilteredEvents)

router.post("/", EventController.createEvent);

router.get("/:eventId", EventController.getEvent);

router.patch("/:eventId", EventController.updateEvent);

router.delete("/:eventId", EventController.deleteEvent);

export default router;