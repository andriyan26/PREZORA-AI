import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { prisma } from '../../config/prisma';

export class DocumentService {
  /**
   * Process uploaded document: extract text, chunk it, and save to database
   */
  public static async processDocument(documentId: string, filePath: string, originalFilename: string): Promise<string> {
    try {
      await prisma.uploadedDocument.update({
        where: { id: documentId },
        data: { processingStatus: 'processing' }
      });

      const ext = path.extname(originalFilename).toLowerCase();
      let extractedText = '';

      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text || '';
      } else if (ext === '.txt') {
        extractedText = fs.readFileSync(filePath, 'utf-8');
      } else if (ext === '.pptx' || ext === '.ppt') {
        // Simple text extraction for presentation files: extract readable text streams
        const buffer = fs.readFileSync(filePath);
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\r\n\t]/g, ' ');
      } else {
        extractedText = fs.readFileSync(filePath, 'utf-8');
      }

      // Clean text
      const cleanedText = extractedText
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!cleanedText || cleanedText.length < 5) {
        throw new Error('Tidak ada teks yang dapat diekstrak. File mungkin berupa gambar pindaian (scan) yang memerlukan OCR.');
      }

      // Chunk text into pieces of ~1000 characters
      const chunks = this.chunkText(cleanedText, 1000, 150);

      // Save chunks in transaction
      await prisma.$transaction([
        prisma.uploadedDocument.update({
          where: { id: documentId },
          data: {
            extractedText: cleanedText.substring(0, 50000), // store up to 50k chars in main table
            processingStatus: 'completed'
          }
        }),
        ...chunks.map((content, idx) =>
          prisma.documentChunk.create({
            data: {
              documentId,
              chunkIndex: idx,
              content,
              metadataJson: JSON.stringify({ charCount: content.length })
            }
          })
        )
      ]);

      return cleanedText;
    } catch (err: any) {
      await prisma.uploadedDocument.update({
        where: { id: documentId },
        data: {
          processingStatus: 'failed',
          errorMessage: err.message || 'Gagal memproses dokumen'
        }
      });
      throw err;
    }
  }

  /**
   * Split text into chunks with overlap
   */
  private static chunkText(text: string, chunkSize = 1000, overlap = 150): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      if (end < text.length) {
        // try to find a natural break near end
        const breakIndex = text.lastIndexOf('\n', end);
        if (breakIndex > start + chunkSize / 2) {
          end = breakIndex;
        }
      }
      chunks.push(text.substring(start, end).trim());
      start = end - overlap;
      if (start >= text.length) break;
    }

    return chunks.filter(c => c.length > 10);
  }

  /**
   * Simple keyword relevance search over document chunks
   */
  public static async searchRelevantChunks(documentId: string, query: string, limit = 3): Promise<string> {
    const chunks = await prisma.documentChunk.findMany({
      where: { documentId },
      take: 20
    });

    if (chunks.length === 0) return '';

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    if (queryWords.length === 0) {
      return chunks.slice(0, limit).map(c => c.content).join('\n---\n');
    }

    // Rank by keyword occurrences
    const scored = chunks.map(chunk => {
      const lower = chunk.content.toLowerCase();
      let score = 0;
      for (const word of queryWords) {
        const matches = (lower.match(new RegExp(word, 'g')) || []).length;
        score += matches;
      }
      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.chunk.content).join('\n---\n');
  }
}
