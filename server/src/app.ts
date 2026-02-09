import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

import { env } from './config/env.js';
import { logger, errorHandler, notFoundHandler, generalRateLimiter, authRateLimiter } from './middlewares/index.js';

// Import routes
import { authRoutes } from './modules/auth/index.js';
import { usersRoutes } from './modules/users/index.js';
import { projectsRoutes } from './modules/projects/index.js';
import { postsRoutes, categoriesRouter } from './modules/posts/index.js';
import { certificationsRoutes } from './modules/certifications/index.js';
import { servicesRoutes } from './modules/services/index.js';
import { experimentsRoutes } from './modules/experiments/index.js';
import { mediaRoutes } from './modules/media/index.js';
import { settingsRoutes } from './modules/settings/index.js';
import { contactRoutes } from './modules/contact/index.js';
import { statsRoutes } from './modules/stats/index.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - handle multiple origins from comma-separated env var
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true,
}));

// Apply rate limiters (using configurable middleware)
app.use('/api', generalRateLimiter); // Global limit
app.use('/api/auth', authRateLimiter); // Strict auth limit

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
app.use(logger);

// Static files (uploads)
app.use('/' + env.UPLOAD_DIR, express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRouter);
app.use('/api/certifications', certificationsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/experiments', experimentsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
