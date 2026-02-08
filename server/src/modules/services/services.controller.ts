import { Request, Response, NextFunction } from 'express';
import { servicesService } from './services.service.js';
import { sendSuccess } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';

export class ServicesController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const activeOnly = req.query.active === 'true';
      const services = await servicesService.findAll(activeOnly);
      sendSuccess(res, services);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await servicesService.findById(req.params.id as string);
      sendSuccess(res, service);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await servicesService.create(req.body);
      sendSuccess(res, service, 'Service berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const service = await servicesService.update(req.params.id as string, req.body);
      sendSuccess(res, service, 'Service berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await servicesService.delete(req.params.id as string);
      sendSuccess(res, null, 'Service berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await servicesService.reorder(req.body.ids);
      sendSuccess(res, null, 'Urutan service berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }
}

export const servicesController = new ServicesController();
