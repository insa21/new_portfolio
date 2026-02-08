import { Request, Response, NextFunction } from 'express';
import { projectsService } from './projects.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';

export class ProjectsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectsService.findAll(req.query as never);
      sendPaginated(res, result.projects, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.findBySlug(req.params.slug as string);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.findById(req.params.id as string);
      sendSuccess(res, project);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.create(req.body);
      sendSuccess(res, project, 'Project berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectsService.update(req.params.id as string, req.body);
      sendSuccess(res, project, 'Project berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Project berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }
}

export const projectsController = new ProjectsController();
