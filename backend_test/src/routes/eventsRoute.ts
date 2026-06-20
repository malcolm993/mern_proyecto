import express from 'express';
import * as EventController from '../controllers/eventsController';
import * as AgendaController from '../controllers/AgendaController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Rutas públicas estáticas
router.get("/", EventController.getPublicEvents);

// Rutas autenticadas estáticas — ANTES de cualquier /:eventId
router.get("/my-events", authenticateToken, requireAdmin, EventController.getMyEvents);
router.get("/admin", authenticateToken, requireAdmin, EventController.getFilteredEvents);

// Rutas públicas dinámicas — al final para no capturar las estáticas
router.get("/:eventId/agenda", AgendaController.getPublicEventAgenda);
router.get("/:eventId", EventController.getPublicEventById);

// Middleware global para el resto de rutas autenticadas
router.use(authenticateToken);

router.post("/", requireAdmin, EventController.createEvent);
router.post("/:eventId/agenda", requireAdmin, AgendaController.createAgendaItem);
router.patch("/:eventId", requireAdmin, EventController.updateEvent);
router.delete("/:eventId", requireAdmin, EventController.deleteEvent);

export default router;