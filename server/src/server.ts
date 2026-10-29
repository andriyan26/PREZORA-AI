import app from './app';
import { config } from './config';
import { prisma } from './config/prisma';

const PORT = config.port || 5000;

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ MySQL Database successfully connected via Prisma ORM.');

    app.listen(PORT, () => {
      console.log(`🚀 PREZORA AI Server running on http://localhost:${PORT}`);
      console.log(`📡 API Endpoints base: http://localhost:${PORT}/api/v1`);
      console.log(`🤖 AI Provider: ${config.ai.provider} (Model: ${config.ai.model})`);
    });
  } catch (err: any) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

bootstrap();
