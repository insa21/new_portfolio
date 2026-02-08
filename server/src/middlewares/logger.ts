import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;

    const statusColor =
      status >= 500 ? '\x1b[31m' : // Red
        status >= 400 ? '\x1b[33m' : // Yellow
          status >= 300 ? '\x1b[36m' : // Cyan
            '\x1b[32m'; // Green

    const reset = '\x1b[0m';

    if (!env.IS_PRODUCTION) {
      console.log(
        `${timestamp} | ${statusColor}${status}${reset} | ${method.padEnd(7)} | ${url} | ${duration}ms`
      );
    }
  });

  next();
};
