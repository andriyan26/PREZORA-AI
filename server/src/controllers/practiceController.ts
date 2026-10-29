import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AIService } from '../services/ai/aiService';
import { successResponse, errorResponse } from '../utils/response';

const createSessionSchema = z.object({
  title: z.string().min(2, 'Judul sesi wajib diisi'),
  practiceType: z.string().default('custom'),
  topic: z.string().min(2, 'Topik presentasi wajib diisi'),
  audienceType: z.string().default('mentor_ramah'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
  targetDurationSeconds: z.number().min(30).max(3600).default(300),
  language: z.string().default('id'),
  interactionMode: z.enum(['practice', 'interactive', 'qa']).default('practice')
});

export class PracticeController {
  public static async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { type, status } = req.query;

      const where: any = { userId };
      if (type && typeof type === 'string' && type !== 'all') {
        where.practiceType = type;
      }
      if (status && typeof status === 'string' && status !== 'all') {
        where.status = status;
      }

      const sessions = await prisma.practiceSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          evaluations: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { overallScore: true, summary: true }
          },
          _count: {
            select: { transcripts: true, questions: true }
          }
        }
      });

      return successResponse(res, sessions);
    } catch (err) {
      next(err);
    }
  }

  public static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const validated = createSessionSchema.parse(req.body);

      const session = await prisma.practiceSession.create({
        data: {
          userId,
          ...validated,
          status: 'draft'
        }
      });

      return successResponse(res, session, 'Sesi latihan berhasil disiapkan', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async getSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const session = await prisma.practiceSession.findFirst({
        where: { id, userId },
        include: {
          transcripts: {
            orderBy: { sequenceNumber: 'asc' }
          },
          questions: {
            orderBy: { sequenceNumber: 'asc' }
          },
          evaluations: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!session) {
        return errorResponse(res, 'Sesi latihan tidak ditemukan', 404);
      }

      return successResponse(res, session);
    } catch (err) {
      next(err);
    }
  }

  public static async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const existing = await prisma.practiceSession.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return errorResponse(res, 'Sesi latihan tidak ditemukan', 404);
      }

      const updated = await prisma.practiceSession.update({
        where: { id },
        data: {
          status: 'in_progress',
          startedAt: new Date()
        }
      });

      return successResponse(res, updated, 'Sesi latihan dimulai');
    } catch (err) {
      next(err);
    }
  }

  public static async addTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { speaker, content } = req.body;

      if (!content || !content.trim()) {
        return errorResponse(res, 'Konten transkrip tidak boleh kosong', 400);
      }

      const session = await prisma.practiceSession.findFirst({
        where: { id, userId }
      });

      if (!session) {
        return errorResponse(res, 'Sesi latihan tidak ditemukan', 404);
      }

      const count = await prisma.practiceTranscript.count({ where: { sessionId: id } });

      const transcript = await prisma.practiceTranscript.create({
        data: {
          sessionId: id,
          speaker: speaker || 'user',
          content: content.trim(),
          sequenceNumber: count + 1,
          startedAt: new Date()
        }
      });

      return successResponse(res, transcript, 'Transkrip ditambahkan', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async generateAudienceQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const session = await prisma.practiceSession.findFirst({
        where: { id, userId },
        include: {
          transcripts: true,
          questions: true
        }
      });

      if (!session) {
        return errorResponse(res, 'Sesi latihan tidak ditemukan', 404);
      }

      const questionText = await AIService.generateAudienceQuestion({
        topic: session.topic,
        audienceType: session.audienceType,
        difficulty: session.difficulty,
        transcripts: session.transcripts.map(t => t.content),
        existingQuestionsCount: session.questions.length
      });

      const question = await prisma.practiceQuestion.create({
        data: {
          sessionId: id,
          question: questionText,
          sequenceNumber: session.questions.length + 1
        }
      });

      // Also record as assistant transcript for flow
      await prisma.practiceTranscript.create({
        data: {
          sessionId: id,
          speaker: 'assistant',
          content: `[Pertanyaan Audiens]: ${questionText}`,
          sequenceNumber: session.transcripts.length + 1
        }
      });

      return successResponse(res, question, 'Pertanyaan audiens diajukan');
    } catch (err) {
      next(err);
    }
  }

  public static async answerQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, questionId } = req.params;
      const { answer } = req.body;

      const question = await prisma.practiceQuestion.findFirst({
        where: { id: questionId, sessionId: id, session: { userId } }
      });

      if (!question) {
        return errorResponse(res, 'Pertanyaan tidak ditemukan', 404);
      }

      const updated = await prisma.practiceQuestion.update({
        where: { id: questionId },
        data: {
          userAnswer: answer,
          answeredAt: new Date(),
          feedback: 'Jawaban telah dicatat dan akan dievaluasi pada laporan performa akhir.'
        }
      });

      // Also record as transcript
      const count = await prisma.practiceTranscript.count({ where: { sessionId: id } });
      await prisma.practiceTranscript.create({
        data: {
          sessionId: id,
          speaker: 'user',
          content: `[Jawaban]: ${answer}`,
          sequenceNumber: count + 1
        }
      });

      return successResponse(res, updated, 'Jawaban berhasil disimpan');
    } catch (err) {
      next(err);
    }
  }

  public static async finishSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { actualDurationSeconds } = req.body;

      const session = await prisma.practiceSession.findFirst({
        where: { id, userId }
      });

      if (!session) {
        return errorResponse(res, 'Sesi latihan tidak ditemukan', 404);
      }

      const duration = actualDurationSeconds !== undefined
        ? actualDurationSeconds
        : (session.startedAt ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000) : 120);

      const updated = await prisma.practiceSession.update({
        where: { id },
        data: {
          status: 'completed',
          actualDurationSeconds: Math.max(10, duration),
          completedAt: new Date()
        }
      });

      return successResponse(res, updated, 'Sesi latihan selesai! Anda dapat melihat evaluasi sekarang.');
    } catch (err) {
      next(err);
    }
  }

  public static async evaluateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const session = await prisma.practiceSession.findFirst({
        where: { id, userId },
        include: {
          transcripts: { orderBy: { sequenceNumber: 'asc' } },
          questions: { orderBy: { sequenceNumber: 'asc' } }
        }
      });

      if (!session) {
        return errorResponse(res, 'Sesi latihan tidak ditemukan', 404);
      }

      const qaData = session.questions.map(q => ({
        question: q.question,
        answer: q.userAnswer || undefined
      }));

      const evalResult = await AIService.evaluatePresentation({
        topic: session.topic,
        audienceType: session.audienceType,
        targetDuration: session.targetDurationSeconds,
        actualDuration: session.actualDurationSeconds || session.targetDurationSeconds,
        transcripts: session.transcripts,
        qaSession: qaData
      });

      // Upsert or create evaluation
      const savedEval = await prisma.practiceEvaluation.create({
        data: {
          sessionId: id,
          overallScore: evalResult.overallScore,
          summary: evalResult.summary,
          evaluationJson: JSON.stringify(evalResult.criteria),
          strengthsJson: JSON.stringify(evalResult.strengths),
          improvementsJson: JSON.stringify(evalResult.improvements),
          nextPracticeJson: JSON.stringify(evalResult.nextPractice),
          evaluationVersion: 1
        }
      });

      return successResponse(res, {
        evaluation: savedEval,
        parsed: evalResult
      }, 'Evaluasi berhasil dihasilkan');
    } catch (err) {
      next(err);
    }
  }

  public static async getEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const evaluation = await prisma.practiceEvaluation.findFirst({
        where: { sessionId: id, session: { userId } },
        orderBy: { createdAt: 'desc' }
      });

      if (!evaluation) {
        return errorResponse(res, 'Evaluasi untuk sesi ini belum tersedia', 404);
      }

      const parsed = {
        id: evaluation.id,
        sessionId: evaluation.sessionId,
        overallScore: evaluation.overallScore,
        summary: evaluation.summary,
        criteria: JSON.parse(evaluation.evaluationJson || '[]'),
        strengths: JSON.parse(evaluation.strengthsJson || '[]'),
        improvements: JSON.parse(evaluation.improvementsJson || '[]'),
        nextPractice: JSON.parse(evaluation.nextPracticeJson || '[]'),
        createdAt: evaluation.createdAt
      };

      return successResponse(res, parsed);
    } catch (err) {
      next(err);
    }
  }

  public static async retrySession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const original = await prisma.practiceSession.findFirst({
        where: { id, userId }
      });

      if (!original) {
        return errorResponse(res, 'Sesi latihan asli tidak ditemukan', 404);
      }

      const newSession = await prisma.practiceSession.create({
        data: {
          userId,
          title: `Latihan Ulang: ${original.title}`,
          practiceType: original.practiceType,
          topic: original.topic,
          audienceType: original.audienceType,
          difficulty: original.difficulty,
          targetDurationSeconds: original.targetDurationSeconds,
          language: original.language,
          interactionMode: original.interactionMode,
          status: 'draft'
        }
      });

      return successResponse(res, newSession, 'Sesi latihan ulang telah dibuat', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async generateQAStandaloneQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic, audiencePersona = 'dosen_penguji', difficulty = 'intermediate', questionIndex = 0 } = req.body;
      if (!topic || !topic.trim()) {
        return errorResponse(res, 'Topik wajib diisi', 400);
      }

      const question = await AIService.generateAudienceQuestion({
        topic: topic.trim(),
        audienceType: audiencePersona,
        difficulty,
        transcripts: [],
        existingQuestionsCount: typeof questionIndex === 'number' ? questionIndex : Math.floor(Math.random() * 5)
      });

      return successResponse(res, { question }, 'Pertanyaan simulasi berhasil dibuat');
    } catch (err) {
      next(err);
    }
  }

  public static async evaluateQAStandaloneAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic, audiencePersona = 'dosen_penguji', question, userAnswer } = req.body;
      if (!question || !userAnswer) {
        return errorResponse(res, 'Pertanyaan dan jawaban wajib diisi', 400);
      }

      const result = await AIService.evaluateQAAnswer({
        topic: topic || 'Presentasi Umum',
        audiencePersona,
        question,
        userAnswer
      });

      return successResponse(res, result, 'Evaluasi jawaban berhasil dibuat');
    } catch (err) {
      next(err);
    }
  }
}
