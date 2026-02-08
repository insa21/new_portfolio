import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middlewares/validate.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { registerSchema, loginSchema } from './auth.schema.js';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register.bind(authController));
router.post('/login', validateBody(loginSchema), authController.login.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;
