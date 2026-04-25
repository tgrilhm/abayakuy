import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';

const router = Router();

// Protect all product routes
router.use(requireAuth);

router.post('/', uploadMiddleware, createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', uploadMiddleware, updateProduct);
router.delete('/:id', deleteProduct);

export default router;
