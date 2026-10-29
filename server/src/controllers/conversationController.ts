import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AIService, MessageContext } from '../services/ai/aiService';
import { DocumentService } from '../services/documents/documentService';
import { successResponse, errorResponse } from '../utils/response';

export class ConversationController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, role: true, createdAt: true }
          }
        }
      });

      return successResponse(res, conversations);
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { title, mode } = req.body;

      const conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title || 'Percakapan Baru',
          mode: mode || 'assistant'
        }
      });

      return successResponse(res, conversation, 'Percakapan dibuat', 201);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const conversation = await prisma.conversation.findFirst({
        where: { id, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation) {
        return errorResponse(res, 'Percakapan tidak ditemukan', 404);
      }

      return successResponse(res, conversation);
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { title } = req.body;

      const existing = await prisma.conversation.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return errorResponse(res, 'Percakapan tidak ditemukan', 404);
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: { title: title || existing.title }
      });

      return successResponse(res, updated, 'Judul percakapan diperbarui');
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const existing = await prisma.conversation.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        return errorResponse(res, 'Percakapan tidak ditemukan', 404);
      }

      await prisma.conversation.delete({ where: { id } });
      return successResponse(res, null, 'Percakapan berhasil dihapus');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Send a message and generate AI response
   */
  public static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { content, documentId } = req.body;

      if (!content || !content.trim()) {
        return errorResponse(res, 'Pesan tidak boleh kosong', 400);
      }

      const conversation = await prisma.conversation.findFirst({
        where: { id, userId }
      });

      if (!conversation) {
        return errorResponse(res, 'Percakapan tidak ditemukan', 404);
      }

      // Save user message
      const userMessage = await prisma.message.create({
        data: {
          conversationId: id,
          role: 'user',
          content: content.trim()
        }
      });

      // Update conversation title if it's the first message and still default
      const messageCount = await prisma.message.count({ where: { conversationId: id } });
      if (messageCount <= 2 && conversation.title === 'Percakapan Baru') {
        const autoTitle = content.trim().length > 35 
          ? content.trim().substring(0, 32) + '...'
          : content.trim();
        await prisma.conversation.update({
          where: { id },
          data: { title: autoTitle }
        });
      }

      // Fetch last 10 messages for context
      const history = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const messageContexts: MessageContext[] = history.reverse().map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      // Document retrieval context if provided
      let docContext = '';
      if (documentId) {
        docContext = await DocumentService.searchRelevantChunks(documentId, content.trim(), 3);
      }

      // Generate AI response
      const aiResponseText = await AIService.generateAssistantResponse({
        messages: messageContexts,
        documentContext: docContext
      });

      // Save assistant message
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId: id,
          role: 'assistant',
          content: aiResponseText,
          status: 'sent'
        }
      });

      // Update conversation updatedAt
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() }
      });

      return successResponse(res, {
        userMessage,
        assistantMessage
      }, 'Pesan terkirim');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Realtime streaming response using Server-Sent Events (SSE)
   */
  public static async streamMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { content, documentId } = req.body;

      if (!content || !content.trim()) {
        return errorResponse(res, 'Pesan tidak boleh kosong', 400);
      }

      const conversation = await prisma.conversation.findFirst({
        where: { id, userId }
      });

      if (!conversation) {
        return errorResponse(res, 'Percakapan tidak ditemukan', 404);
      }

      // Save user message
      await prisma.message.create({
        data: {
          conversationId: id,
          role: 'user',
          content: content.trim()
        }
      });

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      // Retrieve context
      const history = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const messageContexts: MessageContext[] = history.reverse().map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      let docContext = '';
      if (documentId) {
        docContext = await DocumentService.searchRelevantChunks(documentId, content.trim(), 3);
      }

      const fullResponse = await AIService.generateAssistantResponse({
        messages: messageContexts,
        documentContext: docContext
      });

      // Stream words smoothly to the client
      const words = fullResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        res.write(`data: ${JSON.stringify({ text: chunk, done: false })}\n\n`);
        await new Promise(r => setTimeout(r, 20));
      }

      // Save assistant message to database
      const assistantMessage = await prisma.message.create({
        data: {
          conversationId: id,
          role: 'assistant',
          content: fullResponse,
          status: 'sent'
        }
      });

      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() }
      });

      res.write(`data: ${JSON.stringify({ text: '', done: true, messageId: assistantMessage.id })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Gagal menghasilkan jawaban', done: true })}\n\n`);
      res.end();
    }
  }

  /**
   * Regenerate last assistant response
   */
  public static async regenerate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id, messageId } = req.params;

      const conversation = await prisma.conversation.findFirst({
        where: { id, userId }
      });

      if (!conversation) {
        return errorResponse(res, 'Percakapan tidak ditemukan', 404);
      }

      const targetMsg = await prisma.message.findFirst({
        where: { id: messageId, conversationId: id }
      });

      if (!targetMsg || targetMsg.role !== 'assistant') {
        return errorResponse(res, 'Pesan asisten untuk regenerasi tidak ditemukan', 404);
      }

      // Find the user message immediately preceding targetMsg
      const previousMessages = await prisma.message.findMany({
        where: {
          conversationId: id,
          createdAt: { lt: targetMsg.createdAt }
        },
        orderBy: { createdAt: 'desc' },
        take: 8
      });

      const messageContexts: MessageContext[] = previousMessages.reverse().map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const newResponseText = await AIService.generateAssistantResponse({
        messages: messageContexts
      });

      const updatedAssistantMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newResponseText,
          status: 'sent'
        }
      });

      return successResponse(res, updatedAssistantMessage, 'Jawaban berhasil di-generate ulang');
    } catch (err) {
      next(err);
    }
  }
}
