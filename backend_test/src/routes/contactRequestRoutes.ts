import express from 'express';
import * as ContactRequestController from '../controllers/ContactRequestController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/',requireRole('user'), ContactRequestController.createContactRequest);
router.get('/received',requireRole('user'), ContactRequestController.getReceivedRequests);
router.get('/sent', requireRole('user'), ContactRequestController.getSentRequests);
router.patch('/:id/accept', requireRole('user'), ContactRequestController.acceptRequest);
router.patch('/:id/reject', requireRole('user'), ContactRequestController.rejectRequest);

export default router;
