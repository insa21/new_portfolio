import { Router } from 'express';
import { projectsController } from './projects.controller.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { authMiddleware, editorOrAdmin, adminOnly } from '../../middlewares/index.js';
import { createProjectSchema, updateProjectSchema, queryProjectsSchema } from './projects.schema.js';

const router = Router();

// Public routes
router.get('/', validateQuery(queryProjectsSchema), projectsController.findAll.bind(projectsController));
router.get('/id/:id', projectsController.findById.bind(projectsController));
router.get('/:slug', projectsController.findBySlug.bind(projectsController));

// Protected routes
router.post('/', authMiddleware, editorOrAdmin, validateBody(createProjectSchema), projectsController.create.bind(projectsController));
router.put('/:id', authMiddleware, editorOrAdmin, validateBody(updateProjectSchema), projectsController.update.bind(projectsController));
router.delete('/:id', authMiddleware, adminOnly, projectsController.delete.bind(projectsController));

export default router;
