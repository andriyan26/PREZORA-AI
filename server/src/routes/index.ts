import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import conversationRoutes from './conversationRoutes';
import practiceRoutes from './practiceRoutes';
import documentRoutes from './documentRoutes';
import analyticsRoutes from './analyticsRoutes';
import scriptRoutes from './scriptRoutes';
import ttsRoutes from './ttsRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/conversations', conversationRoutes);
apiRouter.use('/practice', practiceRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/scripts', scriptRoutes);
apiRouter.use('/tts', ttsRoutes);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'PREZORA AI REST API v1.0',
    db: 'connected'
  });
});

export default apiRouter;
