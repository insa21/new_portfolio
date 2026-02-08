import { Request, Response, NextFunction } from 'express';
import { certificationsService } from './certifications.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';

export class CertificationsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await certificationsService.findAll(req.query as never);
      sendPaginated(res, result.certifications, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const certification = await certificationsService.findById(req.params.id as string);
      sendSuccess(res, certification);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const certification = await certificationsService.create(req.body);
      sendSuccess(res, certification, 'Certification berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const certification = await certificationsService.update(req.params.id as string, req.body);
      sendSuccess(res, certification, 'Certification berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await certificationsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Certification berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }
}

export const certificationsController = new CertificationsController();
