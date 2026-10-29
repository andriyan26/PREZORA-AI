import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/prezora_ai',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'prezora_super_secret_access_jwt_key_2026_xyz',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'prezora_super_secret_refresh_jwt_key_2026_xyz',
  jwtAccessExpiresIn: '1h',
  jwtRefreshExpiresIn: '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  ai: {
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
    baseUrl: process.env.AI_BASE_URL || ''
  },
  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
    maxFileSize: 15 * 1024 * 1024 // 15MB
  }
};
