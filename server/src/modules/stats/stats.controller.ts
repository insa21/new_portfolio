import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';

export class StatsController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        projectsCount,
        postsCount,
        certificationsCount,
        experimentsCount,
        unreadContactsCount,
        settings,
      ] = await Promise.all([
        prisma.project.count(),
        prisma.blogPost.count({ where: { published: true } }),
        prisma.certification.count(),
        prisma.experiment.count(),
        prisma.contactSubmission.count({ where: { read: false } }),
        prisma.setting.findUnique({ where: { key: 'hero_stats' } }),
      ]);

      const stats = {
        projectsCount,
        postsCount,
        certificationsCount,
        experimentsCount,
        unreadContactsCount,
        heroStats: settings?.value || null,
      };

      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
