import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (!env.IS_PRODUCTION) {
    console.error('Error:', err);
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };

    if (prismaError.code === 'P2002') {
      const field = prismaError.meta?.target?.[0] || 'field';
      sendError(res, `${field} sudah digunakan.`, 409);
      return;
    }

    if (prismaError.code === 'P2025') {
      sendError(res, 'Data tidak ditemukan.', 404);
      return;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Token tidak valid.', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token sudah kadaluarsa.', 401);
    return;
  }

  // Default error
  sendError(
    res,
    env.IS_PRODUCTION ? 'Terjadi kesalahan server.' : err.message,
    500
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} tidak ditemukan.`, 404);
};
