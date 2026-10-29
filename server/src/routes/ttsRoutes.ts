import { Router } from 'express';
import { TTSController } from '../controllers/ttsController';

const router = Router();

router.get('/speak', TTSController.speak);
router.post('/speak', TTSController.speak);
router.post('/normalize', TTSController.normalize);

export default router;

