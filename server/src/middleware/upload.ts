import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

if (!fs.existsSync(config.storage.uploadDir)) {
  fs.mkdirSync(config.storage.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.pptx') || file.originalname.endsWith('.txt')) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Harap unggah PDF, PPTX, atau TXT.'));
  }
};

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: config.storage.maxFileSize
  },
  fileFilter
});
