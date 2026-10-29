import { Router } from 'express';
import { ScriptController } from '../controllers/scriptController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/outline', ScriptController.generateOutline);
router.post('/refine', ScriptController.refineScript);

export default router;
