import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  avatarUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  theme: z.enum(['light', 'dark']).optional(),
  preferredLanguage: z.string().min(2).max(10).optional()
});

const updatePreferencesSchema = z.object({
  responseStyle: z.string().optional(),
  responseLength: z.string().optional(),
  voiceEnabled: z.boolean().optional(),
  voiceSpeed: z.number().min(0.5).max(2.0).optional()
});

export class UserController {
  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          theme: true,
          preferredLanguage: true,
          createdAt: true,
          preferences: true
        }
      });
      return successResponse(res, user);
    } catch (err) {
      next(err);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = updateProfileSchema.parse(req.body);

      const updated = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          theme: true,
          preferredLanguage: true
        }
      });

      return successResponse(res, updated, 'Profil berhasil diperbarui');
    } catch (err) {
      next(err);
    }
  }

  public static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      let prefs = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      if (!prefs) {
        prefs = await prisma.userPreferences.create({
          data: { userId }
        });
      }

      return successResponse(res, prefs);
    } catch (err) {
      next(err);
    }
  }

  public static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = updatePreferencesSchema.parse(req.body);

      const prefs = await prisma.userPreferences.upsert({
        where: { userId },
        update: data,
        create: {
          userId,
          ...data
        }
      });

      return successResponse(res, prefs, 'Pengaturan preferensi disimpan');
    } catch (err) {
      next(err);
    }
  }

  public static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      await prisma.user.delete({
        where: { id: userId }
      });

      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Akun dan seluruh data Anda telah berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
