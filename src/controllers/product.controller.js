import prisma from '../config/prisma.js';
import { uploadFiles, deleteFile } from '../services/upload.service.js';

export const createProduct = async (req, res, next) => {
  try {
    const { kode, brand, bahan, ukuran, warna, harga } = req.body;

    if (!kode || !brand || !bahan || !ukuran || !warna || !harga) {
      return res.status(400).json({ error: 'All fields are required (kode, brand, bahan, ukuran, warna, harga)' });
    }

    // Parse ukuran — accept JSON array string or comma-separated
    let parsedUkuran;
    try {
      parsedUkuran = JSON.parse(ukuran);
    } catch {
      parsedUkuran = ukuran.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Upload media files
    const mediaResults = await uploadFiles(req.files);

    const product = await prisma.product.create({
      data: {
        kode,
        brand,
        bahan,
        ukuran: parsedUkuran,
        warna,
        harga: parseFloat(harga),
        media: {
          create: mediaResults.map((m, index) => ({
            url: m.url,
            type: m.type,
            order: index,
          })),
        },
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
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
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
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
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
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
    const { kode, brand, bahan, ukuran, warna, harga, deletedMedia } = req.body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Parse ukuran if provided
    let parsedUkuran;
    if (ukuran) {
      try {
        parsedUkuran = JSON.parse(ukuran);
      } catch {
        parsedUkuran = ukuran.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Handle media deletions
    if (deletedMedia) {
      let mediaToDelete;
      try {
        mediaToDelete = JSON.parse(deletedMedia);
      } catch {
        mediaToDelete = [];
      }

      if (mediaToDelete.length > 0) {
        // Find the media records to get their URLs for storage cleanup
        const mediaRecords = await prisma.media.findMany({
          where: {
            id: { in: mediaToDelete },
            product_id: id,
          },
        });

        // Delete files from Supabase Storage
        for (const record of mediaRecords) {
          await deleteFile(record.url);
        }

        // Delete media records from database
        await prisma.media.deleteMany({
          where: {
            id: { in: mediaToDelete },
            product_id: id,
          },
        });
      }
    }

    // Upload new media files
    const mediaResults = await uploadFiles(req.files);

    // Get current max order for this product's media
    const currentMaxOrder = existingProduct.media.length > 0
      ? Math.max(...existingProduct.media.map(m => m.order))
      : -1;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        kode: kode || existingProduct.kode,
        brand: brand || existingProduct.brand,
        bahan: bahan || existingProduct.bahan,
        ukuran: parsedUkuran || existingProduct.ukuran,
        warna: warna || existingProduct.warna,
        harga: harga ? parseFloat(harga) : existingProduct.harga,
        media: {
          create: mediaResults.map((m, index) => ({
            url: m.url,
            type: m.type,
            order: currentMaxOrder + 1 + index,
          })),
        },
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
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
      include: { media: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete all media files from Supabase Storage
    for (const mediaItem of existingProduct.media) {
      await deleteFile(mediaItem.url);
    }

    // Cascade delete will also remove media records
    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
