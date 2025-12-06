import express from 'express';
import * as EventController from '../controllers/eventsController';
import { authenticateToken } from '../middleware/auth';

const router= express.Router();
router.get("/", EventController.getFilteredEvents)



router.get("/:eventId", EventController.getEventById);

router.use(authenticateToken);

router.patch("/:eventId", EventController.updateEvent);

router.delete("/:eventId", EventController.deleteEvent);

router.post("/", EventController.createEvent);

export default router;