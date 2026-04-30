import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { singleUploadMiddleware } from '../middlewares/upload.middleware.js';
import { deleteStagedUpload, stageUpload } from '../controllers/upload.controller.js';

const router = Router();

router.post('/stage', requireAuth, singleUploadMiddleware, stageUpload);
router.delete('/stage/:id', requireAuth, deleteStagedUpload);

export default router;
