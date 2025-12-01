// src/routes/reservations.ts
import express from 'express';
import * as ReservationController from '../controllers/ReservationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear nueva reserva
router.post('/', ReservationController.createReservation);

// Cancelar reserva
router.delete('/:reservationId', ReservationController.cancelReservation);

// Obtener reservas del usuario actual
router.get('/my-reservations', ReservationController.getUserReservations);

router.get('/stats', ReservationController.getReservationStats);

export default router;