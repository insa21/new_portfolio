import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Start server
    app.listen(env.PORT, () => {
      console.log(`
🚀 Server running on http://localhost:${env.PORT}
📖 API Documentation: http://localhost:${env.PORT}/api
🌍 Environment: ${env.NODE_ENV}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
