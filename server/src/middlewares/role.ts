import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { sendError } from '../utils/response.js';
import { UserRole } from '@prisma/client';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Akses ditolak. Login terlebih dahulu.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Akses ditolak. Anda tidak memiliki izin.', 403);
      return;
    }

    next();
  };
};

// Shorthand middlewares
export const adminOnly = roleMiddleware(UserRole.ADMIN);
export const editorOrAdmin = roleMiddleware(UserRole.ADMIN, UserRole.EDITOR);
