import prisma from '../config/prisma.js';
import { uploadFiles, deleteFile } from '../services/upload.service.js';

export const createProduct = async (req, res, next) => {
  try {
    const { kode, nama, brand, bahan, ukuran, warna, harga, kategori, deskripsi, stok } = req.body;

    if (!kode || !brand || !bahan || !ukuran || !warna || !harga) {
      return res.status(400).json({
        error: 'Required fields missing: kode, brand, bahan, ukuran, warna, harga',
      });
    }

    // Parse ukuran — accept JSON array string or comma-separated
    let parsedUkuran;
    try {
      parsedUkuran = JSON.parse(ukuran);
    } catch {
      parsedUkuran = ukuran.split(',').map((s) => s.trim()).filter(Boolean);
    }

    // Upload media files
    const mediaResults = await uploadFiles(req.files);

    const product = await prisma.product.create({
      data: {
        kode,
        nama: nama || null,
        brand,
        bahan,
        ukuran: parsedUkuran,
        warna,
        harga: parseFloat(harga),
        kategori: kategori || null,
        deskripsi: deskripsi || null,
        stok: stok ? parseInt(stok, 10) : null,
        media: {
          create: mediaResults.map((m, index) => ({
            url: m.url,
            type: m.type,
            order: index,
          })),
        },
      },
      include: {
        media: { orderBy: { order: 'asc' } },
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, kategori } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = kategori ? { kategori } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { created_at: 'desc' },
        include: { media: { orderBy: { order: 'asc' } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { media: { orderBy: { order: 'asc' } } },
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
    const { kode, nama, brand, bahan, ukuran, warna, harga, kategori, deskripsi, stok, deletedMedia } = req.body;

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
        parsedUkuran = ukuran.split(',').map((s) => s.trim()).filter(Boolean);
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
        const mediaRecords = await prisma.media.findMany({
          where: { id: { in: mediaToDelete }, product_id: id },
        });

        for (const record of mediaRecords) {
          await deleteFile(record.url);
        }

        await prisma.media.deleteMany({
          where: { id: { in: mediaToDelete }, product_id: id },
        });
      }
    }

    // Upload new media files
    const mediaResults = await uploadFiles(req.files);

    const currentMaxOrder =
      existingProduct.media.length > 0
        ? Math.max(...existingProduct.media.map((m) => m.order))
        : -1;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        kode: kode !== undefined ? kode : existingProduct.kode,
        nama: nama !== undefined ? nama || null : existingProduct.nama,
        brand: brand !== undefined ? brand : existingProduct.brand,
        bahan: bahan !== undefined ? bahan : existingProduct.bahan,
        ukuran: parsedUkuran || existingProduct.ukuran,
        warna: warna !== undefined ? warna : existingProduct.warna,
        harga: harga !== undefined ? parseFloat(harga) : existingProduct.harga,
        kategori: kategori !== undefined ? kategori || null : existingProduct.kategori,
        deskripsi: deskripsi !== undefined ? deskripsi || null : existingProduct.deskripsi,
        stok: stok !== undefined ? (stok ? parseInt(stok, 10) : null) : existingProduct.stok,
        media: {
          create: mediaResults.map((m, index) => ({
            url: m.url,
            type: m.type,
            order: currentMaxOrder + 1 + index,
          })),
        },
      },
      include: {
        media: { orderBy: { order: 'asc' } },
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

    for (const mediaItem of existingProduct.media) {
      await deleteFile(mediaItem.url);
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
