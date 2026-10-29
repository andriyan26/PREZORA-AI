import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AIService } from '../services/ai/aiService';
import { successResponse, errorResponse } from '../utils/response';

const outlineSchema = z.object({
  topic: z.string().min(2, 'Topik presentasi wajib diisi'),
  audience: z.string().default('Umum'),
  durationMinutes: z.number().min(1).max(120).default(10),
  goal: z.string().optional(),
  tone: z.string().default('Profesional & Inspiratif')
});

const refineSchema = z.object({
  originalScript: z.string().min(10, 'Naskah asli minimal 10 karakter'),
  instruction: z.string().default('Perjelas kalimat dan buat lebih memukau'),
  targetTone: z.string().default('Formal & Percaya Diri')
});

export class ScriptController {
  public static async generateOutline(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic, audience, durationMinutes, goal, tone } = outlineSchema.parse(req.body);

      const prompt = `Buatkan outline struktur presentasi lengkap untuk:
- Topik: "${topic}"
- Audiens Sasaran: ${audience}
- Durasi: ${durationMinutes} menit
- Tujuan: ${goal || 'Menyampaikan informasi penting dan meyakinkan audiens'}
- Gaya Bahasa/Tone: ${tone}

Format output dalam Markdown rapi:
1. **Judul & Pembukaan (Hook 30 Detik)**
2. **Slide-by-Slide Outline (Slide 1 hingga Slide ${Math.max(4, Math.round(durationMinutes * 0.8))})**:
   - Judul Slide
   - Poin Kunci Pembicaraan (Bullet points)
   - Waktu Estimasi per slide
   - Catatan Pembicara (Speaker Notes)
3. **Penutup & Call-to-Action (CTA)**
4. **Prediksi 3 Pertanyaan yang Mungkin Diajukan Audiens**`;

      const result = await AIService.generateAssistantResponse({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'Kamu adalah Presentation Strategist and Speechwriter ahli PREZORA AI.'
      });

      return successResponse(res, { outline: result }, 'Outline presentasi berhasil dibuat');
    } catch (err) {
      next(err);
    }
  }

  public static async refineScript(req: Request, res: Response, next: NextFunction) {
    try {
      const { originalScript, instruction, targetTone } = refineSchema.parse(req.body);

      const prompt = `Perbaiki dan sempurnakan naskah presentasi berikut:
Gaya Bahasa yang Diinginkan: ${targetTone}
Instruksi Khusus: ${instruction}

Naskah Asli:
"""
${originalScript}
"""

Berikan output dalam Markdown:
1. **Naskah Hasil Penyempurnaan** (siap dibaca dengan intonasi natural)
2. **Daftar Poin Perubahan**: Jelaskan perbaikan apa saja yang dilakukan dan mengapa.
3. **Tips Penyampaian Suara**: Di mana harus memberi jeda, penekanan intonasi, dan kontak mata.`;

      const result = await AIService.generateAssistantResponse({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'Kamu adalah Speech Coach dan Script Editor profesional PREZORA AI.'
      });

      return successResponse(res, { refinedScript: result }, 'Naskah berhasil disempurnakan');
    } catch (err) {
      next(err);
    }
  }
}
