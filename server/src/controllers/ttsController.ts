import { Request, Response, NextFunction } from 'express';
import { TTSService } from '../services/tts/ttsService';
import { errorResponse, successResponse } from '../utils/response';

export class TTSController {
  /**
   * Stream MP3 audio buffer for natural Indonesian speech (POST or GET)
   */
  public static async speak(req: Request, res: Response, next: NextFunction) {
    try {
      const text = (req.body?.text || req.query?.text || '') as string;
      const persona = (req.body?.persona || req.query?.persona || 'default') as string;

      if (!text || !text.trim()) {
        return errorResponse(res, 'Teks suara tidak boleh kosong', 400);
      }

      const mp3Buffer = await TTSService.synthesizeIndonesianMp3(text, persona);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', mp3Buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
      return res.status(200).send(mp3Buffer);
    } catch (err: any) {
      console.warn('[TTS Service Fallback]:', err.message);
      return errorResponse(res, 'Layanan audio neural sedang sibuk, beralih ke mesin suara lokal.', 503);
    }
  }

  /**
   * Normalize text into natural Indonesian spoken sentences & phonetic script
   */
  public static async normalize(req: Request, res: Response, next: NextFunction) {
    try {
      const text = (req.body?.text || req.query?.text || '') as string;
      const persona = (req.body?.persona || req.query?.persona || 'default') as string;

      const normalized = TTSService.normalizeForIndonesianSpeech(text, persona);
      const chunks = TTSService.splitIntoBreathChunks(normalized, 170);

      return successResponse(res, {
        original: text,
        normalized,
        chunks,
      });
    } catch (err) {
      next(err);
    }
  }
}

