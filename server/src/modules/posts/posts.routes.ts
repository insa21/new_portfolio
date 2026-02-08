import { Router } from 'express';
import { postsController } from './posts.controller.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { authMiddleware, editorOrAdmin, adminOnly } from '../../middlewares/index.js';
import { createPostSchema, updatePostSchema, queryPostsSchema, createCategorySchema, updateCategorySchema } from './posts.schema.js';

const router = Router();

// Posts
router.get('/', validateQuery(queryPostsSchema), postsController.findAll.bind(postsController));
router.get('/id/:id', postsController.findById.bind(postsController)); // Get by ID for admin edit
router.get('/:slug', postsController.findBySlug.bind(postsController)); // Get by slug for public
router.post('/', authMiddleware, editorOrAdmin, validateBody(createPostSchema), postsController.create.bind(postsController));
router.put('/:id', authMiddleware, editorOrAdmin, validateBody(updatePostSchema), postsController.update.bind(postsController));
router.delete('/:id', authMiddleware, adminOnly, postsController.delete.bind(postsController));

export default router;

// Categories router
export const categoriesRouter = Router();

categoriesRouter.get('/', postsController.findAllCategories.bind(postsController));
categoriesRouter.post('/', authMiddleware, adminOnly, validateBody(createCategorySchema), postsController.createCategory.bind(postsController));
categoriesRouter.put('/:id', authMiddleware, adminOnly, validateBody(updateCategorySchema), postsController.updateCategory.bind(postsController));
categoriesRouter.delete('/:id', authMiddleware, adminOnly, postsController.deleteCategory.bind(postsController));
