import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { AuthRequest } from '../../middlewares/auth.js';
import { env } from '../../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  // Always use secure in production (required for sameSite: 'none')
  secure: env.IS_PRODUCTION,
  // Use 'none' for cross-domain cookie support (frontend and backend on different domains)
  // 'none' allows cookies to be sent in third-party contexts but requires secure: true
  sameSite: env.IS_PRODUCTION ? ('none' as const) : ('lax' as const),
  path: '/',
  // Don't set domain - let browser default to the origin domain
  // This ensures cookies work correctly in cross-domain scenarios
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, result, 'Registrasi berhasil.', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', result.tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, result, 'Login berhasil.');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await authService.logout(req.user.id);
      }

      // Clear cookies
      res.clearCookie('accessToken', COOKIE_OPTIONS);
      res.clearCookie('refreshToken', COOKIE_OPTIONS);

      sendSuccess(res, null, 'Logout berhasil.');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        sendError(res, 'Refresh token tidak ditemukan.', 401);
        return;
      }

      const tokens = await authService.refresh(refreshToken);

      // Set new cookies
      res.cookie('accessToken', tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendSuccess(res, { accessToken: tokens.accessToken }, 'Token berhasil diperbarui.');
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        sendError(res, 'Tidak terautentikasi.', 401);
        return;
      }

      const user = await authService.getProfile(req.user.id);
      sendSuccess(res, user, 'Profil berhasil diambil.');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
