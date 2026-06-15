import express from 'express';
import * as AgendaController from '../controllers/AgendaController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.patch("/:agendaItemId", requireAdmin, AgendaController.updateAgendaItem);
router.delete("/:agendaItemId", requireAdmin, AgendaController.deleteAgendaItem);

export default router;
