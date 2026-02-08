import { Router } from 'express';
import { mediaController, mediaUpload } from './media.controller.js';
import { authMiddleware, editorOrAdmin, adminOnly } from '../../middlewares/index.js';

const router = Router();

router.get('/', authMiddleware, editorOrAdmin, mediaController.findAll.bind(mediaController));
router.get('/:id/download', authMiddleware, editorOrAdmin, mediaController.download.bind(mediaController));
router.post('/upload', authMiddleware, editorOrAdmin, mediaUpload, mediaController.upload.bind(mediaController));
router.post('/upload-by-url', authMiddleware, editorOrAdmin, mediaController.uploadByUrl.bind(mediaController));
router.delete('/:id', authMiddleware, adminOnly, mediaController.delete.bind(mediaController));

export default router;
