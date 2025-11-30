import express from 'express';
import * as RegistrationController from '../controllers/RegistrationController';  

const router= express.Router();
router.post("/join/:eventId", RegistrationController.joinEvent);
router.post("/leave/:eventId", RegistrationController.leaveEvent);
router.get("/:eventId/participants", RegistrationController.getEventParticipants);
export default router;