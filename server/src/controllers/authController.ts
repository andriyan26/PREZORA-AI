import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword']
});

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
});

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, password } = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return errorResponse(res, 'Email sudah terdaftar. Silakan gunakan email lain atau login.', 400);
      }

      const passwordHash = await hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          passwordHash,
          preferences: {
            create: {
              responseStyle: 'informative',
              responseLength: 'balanced',
              voiceEnabled: true,
              voiceSpeed: 1.0
            }
          }
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          theme: true,
          preferredLanguage: true,
          createdAt: true
        }
      });

      const accessToken = generateAccessToken({ userId: newUser.id, email: newUser.email });
      const refreshToken = generateRefreshToken({ userId: newUser.id, email: newUser.email });

      // Save hashed refresh token
      const refreshTokenHash = await hashPassword(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          userId: newUser.id,
          tokenHash: refreshTokenHash,
          expiresAt
        }
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return successResponse(res, {
        user: newUser,
        accessToken,
        refreshToken
      }, 'Pendaftaran akun berhasil!', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user || user.deletedAt) {
        return errorResponse(res, 'Email atau password salah.', 401);
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, 'Email atau password salah.', 401);
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      const refreshTokenHash = await hashPassword(refreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshTokenHash,
          expiresAt
        }
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return successResponse(res, {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          theme: user.theme,
          preferredLanguage: user.preferredLanguage,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      }, 'Login berhasil!');
    } catch (err) {
      next(err);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return errorResponse(res, 'Refresh token tidak ditemukan', 401);
      }

      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return errorResponse(res, 'Pengguna tidak ditemukan', 401);
      }

      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
      return successResponse(res, { accessToken: newAccessToken }, 'Token berhasil diperbarui');
    } catch (err) {
      return errorResponse(res, 'Refresh token tidak valid atau telah kedaluwarsa', 401);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('refreshToken');
      return successResponse(res, null, 'Logout berhasil');
    } catch (err) {
      next(err);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return errorResponse(res, 'Tidak terautentikasi', 401);
      }

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

      if (!user) {
        return errorResponse(res, 'Pengguna tidak ditemukan', 404);
      }

      return successResponse(res, user);
    } catch (err) {
      next(err);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body?.email?.toLowerCase();
      if (!email) {
        return errorResponse(res, 'Email wajib diisi', 400);
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return generic message for security
        return successResponse(res, null, 'Jika email terdaftar, instruksi reset password telah dikirim.');
      }

      // Generate a reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenHash = await hashPassword(resetCode);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      });

      // In real deployment, email sending is hooked here. In dev, return code for easy testing!
      return successResponse(res, { resetCode }, 'Instruksi reset password telah dibuat. Kode reset sementara: ' + resetCode);
    } catch (err) {
      next(err);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, resetCode, newPassword } = req.body;
      if (!email || !resetCode || !newPassword || newPassword.length < 8) {
        return errorResponse(res, 'Data tidak lengkap atau password kurang dari 8 karakter', 400);
      }

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        return errorResponse(res, 'Permintaan reset password tidak valid', 400);
      }

      const tokens = await prisma.passwordResetToken.findMany({
        where: {
          userId: user.id,
          usedAt: null,
          expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      });

      let validTokenId: string | null = null;
      for (const t of tokens) {
        const matches = await comparePassword(resetCode, t.tokenHash);
        if (matches) {
          validTokenId = t.id;
          break;
        }
      }

      if (!validTokenId) {
        return errorResponse(res, 'Kode reset salah atau telah kedaluwarsa', 400);
      }

      const passwordHash = await hashPassword(newPassword);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { passwordHash }
        }),
        prisma.passwordResetToken.update({
          where: { id: validTokenId },
          data: { usedAt: new Date() }
        })
      ]);

      return successResponse(res, null, 'Password berhasil diperbarui! Silakan login dengan password baru.');
    } catch (err) {
      next(err);
    }
  }
}
