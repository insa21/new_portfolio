import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/database.js';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      sendError(res, 'Akses ditolak. Token tidak ditemukan.', 401);
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      sendError(res, 'User tidak ditemukan.', 401);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Token tidak valid atau sudah kadaluarsa.', 401);
  }
};

// Optional auth - doesn't require auth but attaches user if token is valid
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Token invalid, but continue without user
    next();
  }
};
