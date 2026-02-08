import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { authMiddleware, adminOnly } from '../../middlewares/index.js';

const router = Router();

// Contact settings (dedicated endpoints)
router.get('/contact', settingsController.getContactSettings.bind(settingsController));
router.put('/contact', authMiddleware, adminOnly, settingsController.updateContactSettings.bind(settingsController));

// Home settings (dedicated endpoints)
router.get('/home', settingsController.getHomeSettings.bind(settingsController));
router.put('/home', authMiddleware, adminOnly, settingsController.updateHomeSettings.bind(settingsController));

// About settings (dedicated endpoints)
router.get('/about', settingsController.getAboutSettings.bind(settingsController));
router.put('/about', authMiddleware, adminOnly, settingsController.updateAboutSettings.bind(settingsController));

// Branding settings (dedicated endpoints)
router.get('/branding', settingsController.getBrandingSettings.bind(settingsController));
router.put('/branding', authMiddleware, adminOnly, settingsController.updateBrandingSettings.bind(settingsController));

// Footer settings (dedicated endpoints)
router.get('/footer', settingsController.getFooterSettings.bind(settingsController));
router.put('/footer', authMiddleware, adminOnly, settingsController.updateFooterSettings.bind(settingsController));

// Generic settings
router.get('/', settingsController.findAll.bind(settingsController));
router.get('/:key', settingsController.findByKey.bind(settingsController));
router.put('/:key', authMiddleware, adminOnly, settingsController.update.bind(settingsController));

export default router;

