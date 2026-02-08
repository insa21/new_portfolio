import { Request, Response, NextFunction } from 'express';
import { contactService } from './contact.service.js';
import { sendSuccess, sendPaginated } from '../../utils/response.js';

export class ContactController {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const submission = await contactService.create(req.body, ipAddress);
      sendSuccess(res, { id: submission.id }, 'Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactService.findAll(req.query as never);
      sendPaginated(res, result.submissions, result.total, result.page, result.limit);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await contactService.findById(req.params.id as string);
      sendSuccess(res, submission);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await contactService.markAsRead(req.params.id as string);
      sendSuccess(res, submission, 'Pesan ditandai sebagai sudah dibaca.');
    } catch (error) {
      next(error);
    }
  }

  async markAsUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const submission = await contactService.markAsUnread(req.params.id as string);
      sendSuccess(res, submission, 'Pesan ditandai sebagai belum dibaca.');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await contactService.delete(req.params.id as string);
      sendSuccess(res, null, 'Pesan berhasil dihapus.');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await contactService.getUnreadCount();
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const contactController = new ContactController();
