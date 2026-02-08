import { Router } from 'express';
import { servicesController } from './services.controller.js';
import { validateBody } from '../../middlewares/validate.js';
import { authMiddleware, adminOnly } from '../../middlewares/index.js';
import { createServiceSchema, updateServiceSchema } from './services.schema.js';

const router = Router();

router.get('/', servicesController.findAll.bind(servicesController));
router.get('/:id', servicesController.findById.bind(servicesController));
router.post('/', authMiddleware, adminOnly, validateBody(createServiceSchema), servicesController.create.bind(servicesController));
router.put('/:id', authMiddleware, adminOnly, validateBody(updateServiceSchema), servicesController.update.bind(servicesController));
router.delete('/:id', authMiddleware, adminOnly, servicesController.delete.bind(servicesController));
router.post('/reorder', authMiddleware, adminOnly, servicesController.reorder.bind(servicesController));

export default router;
