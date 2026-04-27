import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateProductPages,
  deleteProduct,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

// Public routes — storefront can read without a token
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes — admin only
router.post('/', requireAuth, uploadMiddleware, createProduct);
router.put('/:id', requireAuth, uploadMiddleware, updateProduct);
router.patch('/:id/pages', requireAuth, updateProductPages);
router.delete('/:id', requireAuth, deleteProduct);

export default router;
