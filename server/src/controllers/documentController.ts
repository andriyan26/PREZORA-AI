import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { prisma } from '../config/prisma';
import { DocumentService } from '../services/documents/documentService';
import { AIService } from '../services/ai/aiService';
import { successResponse, errorResponse } from '../utils/response';

export class DocumentController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const documents = await prisma.uploadedDocument.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalFilename: true,
          mimeType: true,
          fileSize: true,
          processingStatus: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { chunks: true }
          }
        }
      });

      return successResponse(res, documents);
    } catch (err) {
      next(err);
    }
  }

  public static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        return errorResponse(res, 'File dokumen tidak ditemukan', 400);
      }

      const doc = await prisma.uploadedDocument.create({
        data: {
          userId,
          originalFilename: file.originalname,
          storageKey: file.filename,
          mimeType: file.mimetype,
          fileSize: file.size,
          processingStatus: 'processing'
        }
      });

      // Process in background or synchronously
      try {
        await DocumentService.processDocument(doc.id, file.path, file.originalname);
      } catch (procErr: any) {
        console.error('Document extraction error:', procErr);
      }

      const updated = await prisma.uploadedDocument.findUnique({
        where: { id: doc.id },
        include: { _count: { select: { chunks: true } } }
      });

      return successResponse(res, updated, 'Dokumen berhasil diunggah dan diproses', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const doc = await prisma.uploadedDocument.findFirst({
        where: { id, userId },
        include: {
          chunks: {
            take: 10,
            orderBy: { chunkIndex: 'asc' }
          }
        }
      });

      if (!doc) {
        return errorResponse(res, 'Dokumen tidak ditemukan', 404);
      }

      return successResponse(res, doc);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const doc = await prisma.uploadedDocument.findFirst({
        where: { id, userId }
      });

      if (!doc) {
        return errorResponse(res, 'Dokumen tidak ditemukan', 404);
      }

      // Remove physical file safely if exists
      try {
        const filePath = `./uploads/${doc.storageKey}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        // ignore
      }

      await prisma.uploadedDocument.delete({ where: { id } });
      return successResponse(res, null, 'Dokumen berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  public static async summarize(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const doc = await prisma.uploadedDocument.findFirst({
        where: { id, userId }
      });

      if (!doc || !doc.extractedText) {
        return errorResponse(res, 'Dokumen tidak ditemukan atau belum diekstrak', 404);
      }

      const summaryPrompt = `Buatlah ringkasan eksekutif dan rekomendasi 5 poin slide presentasi berdasarkan materi dokumen "${doc.originalFilename}" berikut:\n\n${doc.extractedText.substring(0, 5000)}`;

      const summary = await AIService.generateAssistantResponse({
        messages: [{ role: 'user', content: summaryPrompt }],
        systemPrompt: 'Kamu adalah analis dokumen dan konsultan presentasi PREZORA AI.'
      });

      return successResponse(res, { summary });
    } catch (err) {
      next(err);
    }
  }
}
