import express from 'express';
import * as EventController from '../controllers/eventsController';
import * as AgendaController from '../controllers/AgendaController';
import { authenticateToken , requireAdmin } from '../middleware/auth';

const router= express.Router();
router.get("/", EventController.getPublicEvents);
router.get("/:eventId/agenda", AgendaController.getPublicEventAgenda);
router.get("/:eventId", EventController.getPublicEventById);


router.use(authenticateToken);

router.get("/admin", requireAdmin, EventController.getFilteredEvents);

router.post("/:eventId/agenda", requireAdmin, AgendaController.createAgendaItem);

router.patch("/:eventId", requireAdmin, EventController.updateEvent);

router.delete("/:eventId", requireAdmin ,EventController.deleteEvent);

router.post("/", requireAdmin , EventController.createEvent);

export default router;
