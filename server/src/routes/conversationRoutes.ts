import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', ConversationController.list);
router.post('/', ConversationController.create);
router.get('/:id', ConversationController.getById);
router.patch('/:id', ConversationController.update);
router.delete('/:id', ConversationController.delete);

// Message endpoints
router.post('/:id/messages', ConversationController.sendMessage);
router.post('/:id/messages/stream', ConversationController.streamMessage);
router.post('/:id/messages/:messageId/regenerate', ConversationController.regenerate);

export default router;
