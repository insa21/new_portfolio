import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async handler wrapper that catches errors and passes them to Express error middleware.
 * Eliminates the need for try/catch blocks in async route handlers.
 * 
 * @example
 * // Instead of:
 * router.get('/', async (req, res, next) => {
 *   try {
 *     const data = await service.findAll();
 *     res.json(data);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // Use:
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await service.findAll();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
