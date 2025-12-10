import express from 'express';
import * as EventController from '../controllers/eventsController';
import { authenticateToken , requireAdmin } from '../middleware/auth';

const router= express.Router();
router.get("/", EventController.getFilteredEvents)



router.get("/:eventId", EventController.getEventById);

router.use(authenticateToken);

router.patch("/:eventId", requireAdmin, EventController.updateEvent);

router.delete("/:eventId", requireAdmin ,EventController.deleteEvent);

router.post("/", requireAdmin , EventController.createEvent);

export default router;