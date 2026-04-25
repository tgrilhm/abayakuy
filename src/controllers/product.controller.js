import prisma from '../config/prisma.js';
import { uploadImage } from '../services/upload.service.js';

export const createProduct = async (req, res, next) => {
  try {
    const { code, name, brand, size, price } = req.body;

    if (!code || !name || !brand || !size || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let image_url = '';
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    const product = await prisma.product.create({
      data: {
        code,
        name,
        brand,
        size,
        price: parseFloat(price),
        image_url,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, brand, size, price } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let image_url = existingProduct.image_url;
    if (req.file) {
      image_url = await uploadImage(req.file);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        code: code || existingProduct.code,
        name: name || existingProduct.name,
        brand: brand || existingProduct.brand,
        size: size || existingProduct.size,
        price: price ? parseFloat(price) : existingProduct.price,
        image_url,
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
