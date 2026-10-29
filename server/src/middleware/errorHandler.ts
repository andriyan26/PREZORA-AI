import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/response';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Details]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return errorResponse(res, 'Validasi formulir gagal', 400, formattedErrors);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Ukuran file terlalu besar. Maksimum 15 MB.', 400);
    }
    return errorResponse(res, `Gagal mengunggah file: ${err.message}`, 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isPublic ? err.message : (statusCode === 500 ? 'Terjadi kesalahan internal pada server' : err.message);

  return errorResponse(res, message, statusCode);
};
