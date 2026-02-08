import { Request, Response, NextFunction } from 'express';
import { experimentsService } from './experiments.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';

export class ExperimentsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await experimentsService.findAll(req.query as never);
      sendPaginated(res, result.experiments, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const experiment = await experimentsService.findById(req.params.id as string);
      sendSuccess(res, experiment);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const experiment = await experimentsService.create(req.body);
      sendSuccess(res, experiment, 'Experiment berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const experiment = await experimentsService.update(req.params.id as string, req.body);
      sendSuccess(res, experiment, 'Experiment berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await experimentsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Experiment berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }
}

export const experimentsController = new ExperimentsController();
