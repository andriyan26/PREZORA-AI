import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { successResponse } from '../utils/response';

export class AnalyticsController {
  public static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const [conversationsCount, totalSessions, completedSessions] = await Promise.all([
        prisma.conversation.count({ where: { userId } }),
        prisma.practiceSession.count({ where: { userId } }),
        prisma.practiceSession.findMany({
          where: { userId, status: 'completed' },
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        })
      ]);

      const evaluationsWithScores = completedSessions
        .map(s => s.evaluations[0]?.overallScore)
        .filter((score): score is number => typeof score === 'number');

      const averageScore = evaluationsWithScores.length > 0
        ? Math.round(evaluationsWithScores.reduce((a, b) => a + b, 0) / evaluationsWithScores.length)
        : null;

      const totalPracticeSeconds = completedSessions.reduce((acc, curr) => acc + (curr.actualDurationSeconds || 0), 0);

      // Latest completed session recommendation
      let recommendation = 'Mulai sesi latihan presentasi pertamamu untuk mendapatkan evaluasi personal dari AI.';
      if (completedSessions.length > 0) {
        const latestSession = completedSessions[0];
        const latestEval = latestSession.evaluations[0];
        if (latestEval) {
          try {
            const nextList = JSON.parse(latestEval.nextPracticeJson || '[]');
            if (nextList.length > 0) {
              recommendation = nextList[0];
            } else {
              recommendation = `Performa pada "${latestSession.title}" mencapai skor ${latestEval.overallScore}. Coba tingkatkan latihan di mode Interactive Audience!`;
            }
          } catch (e) {
            recommendation = 'Latih kembali pembukaan dan alur presentasimu untuk hasil yang lebih optimal.';
          }
        }
      }

      // Recent activities
      const recentSessions = await prisma.practiceSession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          practiceType: true,
          status: true,
          createdAt: true,
          evaluations: {
            take: 1,
            select: { overallScore: true }
          }
        }
      });

      const recentConversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          mode: true,
          updatedAt: true
        }
      });

      return successResponse(res, {
        conversationsCount,
        totalSessions,
        completedSessionsCount: completedSessions.length,
        averageScore,
        totalPracticeMinutes: Math.round(totalPracticeSeconds / 60),
        recommendation,
        recentSessions,
        recentConversations
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const sessions = await prisma.practiceSession.findMany({
        where: { userId, status: 'completed' },
        orderBy: { createdAt: 'asc' },
        include: {
          evaluations: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      const scoreTimeline = sessions
        .filter(s => s.evaluations[0]?.overallScore !== undefined)
        .map(s => ({
          sessionId: s.id,
          title: s.title,
          date: s.completedAt || s.createdAt,
          score: s.evaluations[0].overallScore,
          practiceType: s.practiceType
        }));

      // Calculate criteria averages
      const criteriaTotals: Record<string, { total: number; count: number }> = {
        'Struktur': { total: 0, count: 0 },
        'Kejelasan': { total: 0, count: 0 },
        'Relevansi': { total: 0, count: 0 },
        'Alur Logika': { total: 0, count: 0 },
        'Diksi': { total: 0, count: 0 },
        'Tanya Jawab': { total: 0, count: 0 },
        'Waktu': { total: 0, count: 0 }
      };

      for (const session of sessions) {
        const ev = session.evaluations[0];
        if (!ev) continue;
        try {
          const list = JSON.parse(ev.evaluationJson || '[]');
          for (const item of list) {
            for (const key of Object.keys(criteriaTotals)) {
              if (item.name.toLowerCase().includes(key.toLowerCase())) {
                criteriaTotals[key].total += item.score;
                criteriaTotals[key].count += 1;
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }

      const criteriaAverages = Object.entries(criteriaTotals).map(([key, val]) => ({
        name: key,
        score: val.count > 0 ? Math.round(val.total / val.count) : 75
      }));

      return successResponse(res, {
        scoreTimeline,
        criteriaAverages,
        totalSessionsCount: sessions.length
      });
    } catch (err) {
      next(err);
    }
  }
}
