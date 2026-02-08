import { Router } from 'express';
import { usersController } from './users.controller.js';
import { validateBody, validateQuery } from '../../middlewares/validate.js';
import { authMiddleware, adminOnly } from '../../middlewares/index.js';
import { createUserSchema, updateUserSchema, queryUsersSchema } from './users.schema.js';

const router = Router();

// All routes require admin
router.use(authMiddleware);
router.use(adminOnly);

router.get('/', validateQuery(queryUsersSchema), usersController.findAll.bind(usersController));
router.get('/:id', usersController.findById.bind(usersController));
router.post('/', validateBody(createUserSchema), usersController.create.bind(usersController));
router.put('/:id', validateBody(updateUserSchema), usersController.update.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));

export default router;
