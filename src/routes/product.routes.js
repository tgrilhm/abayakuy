import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import {
  createProduct,
  getProducts,
  getProductById,
  getHeroProduct,
  updateProduct,
  updateProductPages,
  deleteProduct,
  getMediaStatus,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();
const VIDEO_MIME_TYPES = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

// Video Streaming Route (handles byte-range requests)
router.get('/stream/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
  const fileExt = path.extname(filePath).toLowerCase();
  const contentType = VIDEO_MIME_TYPES[fileExt] || 'application/octet-stream';
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// Public routes — storefront can read without a token
router.get('/hero', getHeroProduct);       // must be before /:id
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/media-status', getMediaStatus);

// Protected routes — admin only
router.post('/', requireAuth, uploadMiddleware, createProduct);
router.put('/:id', requireAuth, uploadMiddleware, updateProduct);
router.patch('/:id/pages', requireAuth, updateProductPages);
router.delete('/:id', requireAuth, deleteProduct);

export default router;
