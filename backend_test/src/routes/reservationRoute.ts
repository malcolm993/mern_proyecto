// backend/src/routes/reservations.ts
import express from 'express';
import * as ReservationController from '../controllers/ReservationController';
import { authenticateToken, requireAdmin, requireRole } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear nueva reserva
router.post('/',requireRole('user'), ReservationController.createReservation);

// Cancelar reserva
router.delete('/:reservationId', requireRole('user'), ReservationController.cancelReservation);

// Obtener reservas del usuario actual
router.get('/my-reservations',requireRole('user'), ReservationController.getUserReservations);

router.get('/stats', requireAdmin , ReservationController.getReservationStats);

// Listado de inscriptos de un evento (solo organizador creador)
router.get('/event/:eventId', requireAdmin, ReservationController.getEventReservations);

// Exportación CSV del listado de inscriptos (solo organizador creador)
router.get('/event/:eventId/export', requireAdmin, ReservationController.exportEventReservationsCSV);

export default router;