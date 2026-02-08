import { Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';

export class UsersController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await usersService.findAll(req.query as never);
      sendPaginated(res, result.users, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.findById(req.params.id as string);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body);
      sendSuccess(res, user, 'User berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.params.id as string, req.body);
      sendSuccess(res, user, 'User berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await usersService.delete(req.params.id as string);
      sendSuccess(res, null, 'User berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
