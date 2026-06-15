import express from 'express';
import * as ContactRequestController from '../controllers/ContactRequestController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/', ContactRequestController.createContactRequest);
router.get('/received', ContactRequestController.getReceivedRequests);
router.get('/sent', ContactRequestController.getSentRequests);
router.patch('/:id/accept', ContactRequestController.acceptRequest);
router.patch('/:id/reject', ContactRequestController.rejectRequest);

export default router;
