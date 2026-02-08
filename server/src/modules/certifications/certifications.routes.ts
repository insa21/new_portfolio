import { Router } from 'express';
import { certificationsController } from './certifications.controller.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { authMiddleware, editorOrAdmin, adminOnly } from '../../middlewares/index.js';
import { createCertificationSchema, updateCertificationSchema, queryCertificationsSchema } from './certifications.schema.js';

const router = Router();

router.get('/', validateQuery(queryCertificationsSchema), certificationsController.findAll.bind(certificationsController));
router.get('/:id', certificationsController.findById.bind(certificationsController));
router.post('/', authMiddleware, editorOrAdmin, validateBody(createCertificationSchema), certificationsController.create.bind(certificationsController));
router.put('/:id', authMiddleware, editorOrAdmin, validateBody(updateCertificationSchema), certificationsController.update.bind(certificationsController));
router.delete('/:id', authMiddleware, adminOnly, certificationsController.delete.bind(certificationsController));

export default router;
