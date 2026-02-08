import { Request, Response, NextFunction } from 'express';
import { postsService } from './posts.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';

export class PostsController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await postsService.findAll(req.query as never);
      sendPaginated(res, result.posts, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postsService.findBySlug(req.params.slug as string, true);
      sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await postsService.findById(req.params.id as string);
      sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await postsService.create(req.body, req.user!.id);
      sendSuccess(res, post, 'Post berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await postsService.update(req.params.id as string, req.body);
      sendSuccess(res, post, 'Post berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await postsService.delete(req.params.id as string);
      sendSuccess(res, null, 'Post berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }

  // Categories
  async findAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await postsService.findAllCategories();
      sendSuccess(res, categories);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await postsService.createCategory(req.body);
      sendSuccess(res, category, 'Category berhasil dibuat.', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await postsService.updateCategory(req.params.id as string, req.body);
      sendSuccess(res, category, 'Category berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await postsService.deleteCategory(req.params.id as string);
      sendSuccess(res, null, 'Category berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }
}

export const postsController = new PostsController();
