import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getProfile);
router.patch('/me', UserController.updateProfile);
router.get('/me/preferences', UserController.getPreferences);
router.patch('/me/preferences', UserController.updatePreferences);
router.delete('/me', UserController.deleteAccount);

export default router;
