import { Router } from 'express';
import { experimentsController } from './experiments.controller.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { authMiddleware, editorOrAdmin, adminOnly } from '../../middlewares/index.js';
import { createExperimentSchema, updateExperimentSchema, queryExperimentsSchema } from './experiments.schema.js';

const router = Router();

router.get('/', validateQuery(queryExperimentsSchema), experimentsController.findAll.bind(experimentsController));
router.get('/:id', experimentsController.findById.bind(experimentsController));
router.post('/', authMiddleware, editorOrAdmin, validateBody(createExperimentSchema), experimentsController.create.bind(experimentsController));
router.put('/:id', authMiddleware, editorOrAdmin, validateBody(updateExperimentSchema), experimentsController.update.bind(experimentsController));
router.delete('/:id', authMiddleware, adminOnly, experimentsController.delete.bind(experimentsController));

export default router;
