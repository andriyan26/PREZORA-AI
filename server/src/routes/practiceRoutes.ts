import { Router } from 'express';
import { PracticeController } from '../controllers/practiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/sessions', PracticeController.listSessions);
router.post('/sessions', PracticeController.createSession);
router.get('/sessions/:id', PracticeController.getSession);
router.post('/sessions/:id/start', PracticeController.startSession);
router.post('/sessions/:id/transcripts', PracticeController.addTranscript);
router.post('/sessions/:id/audience-question', PracticeController.generateAudienceQuestion);
router.patch('/sessions/:id/questions/:questionId', PracticeController.answerQuestion);
router.post('/sessions/:id/finish', PracticeController.finishSession);
router.get('/sessions/:id/evaluation', PracticeController.getEvaluation);
router.post('/sessions/:id/evaluate', PracticeController.evaluateSession);
router.post('/sessions/:id/retry', PracticeController.retrySession);
router.post('/qa/question', PracticeController.generateQAStandaloneQuestion);
router.post('/qa/evaluate', PracticeController.evaluateQAStandaloneAnswer);

export default router;
