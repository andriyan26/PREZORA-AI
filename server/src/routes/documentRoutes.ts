import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticate } from '../middleware/auth';
import { uploadDocument } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/', DocumentController.list);
router.post('/', uploadDocument.single('file'), DocumentController.upload);
router.get('/:id', DocumentController.getById);
router.delete('/:id', DocumentController.delete);
router.post('/:id/summarize', DocumentController.summarize);

export default router;
