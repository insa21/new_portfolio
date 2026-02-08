import { Router } from 'express';
import { contactController } from './contact.controller.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { authMiddleware, adminOnly } from '../../middlewares/index.js';
import { contactRateLimiter } from '../../middlewares/rate-limit.js';
import { createContactSchema, queryContactSchema } from './contact.schema.js';

const router = Router();

// Public route - submit contact dengan rate limiting (configurable via env)
router.post(
  '/',
  contactRateLimiter,
  validateBody(createContactSchema),
  contactController.submit.bind(contactController)
);

// Admin routes
router.get(
  '/unread-count',
  authMiddleware,
  adminOnly,
  contactController.getUnreadCount.bind(contactController)
);

router.get(
  '/',
  authMiddleware,
  adminOnly,
  validateQuery(queryContactSchema),
  contactController.findAll.bind(contactController)
);

router.get(
  '/:id',
  authMiddleware,
  adminOnly,
  contactController.findById.bind(contactController)
);

router.put(
  '/:id/read',
  authMiddleware,
  adminOnly,
  contactController.markAsRead.bind(contactController)
);

router.put(
  '/:id/unread',
  authMiddleware,
  adminOnly,
  contactController.markAsUnread.bind(contactController)
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  contactController.delete.bind(contactController)
);

export default router;
