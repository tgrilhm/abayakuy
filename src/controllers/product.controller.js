import prisma from '../config/prisma.js';
import { uploadFiles, deleteFile } from '../services/upload.service.js';

// ─── Enum mappings ───────────────────────────────────────────────────────────
// Maps the display string sent from the frontend to the Prisma enum key.

const KATEGORI_MAP = {
  'Outer Abaya':   'Outer_Abaya',
  'Instant Abaya': 'Instant_Abaya',
  'Luxe Kaftan':   'Luxe_Kaftan',
  'Luxe Chiffon':  'Luxe_Chiffon',
  'Velvet Abaya':  'Velvet_Abaya',
};

const UKURAN_MAP = {
  'L':         'L',
  'XL':        'XL',
  '2XL':       'XXL',
  '3XL':       'XXXL',
  '4XL':       'XXXXL',
  'Free Size': 'Free_Size',
};

const BAHAN_MAP = {
  'Premium Harrer': 'Premium_Harrer',
  'Tiktok':         'Tiktok',
  'Harrer Suudi':   'Harrer_Suudi',
  'Kursa':          'Kursa',
  'Siffon':         'Siffon',
  'Harrer':         'Harrer',
  'Velvet Bludru':  'Velvet_Bludru',
  'Crepe':          'Crepe',
  'Satin':          'Satin',
};

const WARNA_MAP = {
  'Hitam':        'Hitam',
  'Krem':         'Krem',
  'Coffe':        'Coffe',
  'Mint':         'Mint',
  'Biru':         'Biru',
  'Abu-abu':      'Abu_abu',
  'Merah':        'Merah',
  'Coklat':       'Coklat',
  'Putih':        'Putih',
  'Kuning':       'Kuning',
  'Ungu':         'Ungu',
  'Hijau':        'Hijau',
  'Hijau Botol':  'Hijau_Botol',
  'Broken White': 'Broken_White',
  'Emerald':      'Emerald',
};

// Reverse map: Prisma enum key → display string (for query filtering)
const KATEGORI_REVERSE = Object.fromEntries(
  Object.entries(KATEGORI_MAP).map(([k, v]) => [v, k])
);

function toKategoriEnum(value) {
  if (!value) return null;
  return KATEGORI_MAP[value] || null;
}

function toBahanEnum(value) {
  if (!value) return null;
  return BAHAN_MAP[value] || null;
}

function toWarnaEnum(value) {
  if (!value) return null;
  return WARNA_MAP[value] || null;
}

function parseWarnaInput(raw) {
  if (!raw) return [];
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    arr = raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((v) => WARNA_MAP[v]).filter(Boolean);
}

function toUkuranEnum(values) {
  if (!Array.isArray(values)) return [];
  return values.map((v) => UKURAN_MAP[v]).filter(Boolean);
}

function parseUkuranInput(raw) {
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    arr = raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return toUkuranEnum(arr);
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export const createProduct = async (req, res, next) => {
  try {
    const { kode, nama, brand, bahan, ukuran, warna, harga, kategori, deskripsi } = req.body;

    if (!kode || !brand || !bahan || !ukuran || !warna || !harga) {
      return res.status(400).json({
        error: 'Required fields missing: kode, brand, bahan, ukuran, warna, harga',
      });
    }

    const parsedUkuran = parseUkuranInput(ukuran);
    const mediaResults = await uploadFiles(req.files);

    const product = await prisma.product.create({
      data: {
        kode,
        nama: nama || null,
        brand,
        bahan: toBahanEnum(bahan),
        ukuran: parsedUkuran,
        warna: parseWarnaInput(warna),
        harga: parseFloat(harga),
        kategori: toKategoriEnum(kategori),
        deskripsi: deskripsi || null,
        media: {
          create: mediaResults.map((m, index) => ({
            url: m.url,
            type: m.type,
            order: index,
          })),
        },
      },
      include: { media: { orderBy: { order: 'asc' } } },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { limit = 20, kategori } = req.query;
    const pageNum = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageName = req.query.pageName; // 'trending' | 'sale' | undefined
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let where = {};
    if (kategori) {
      const enumKey = KATEGORI_MAP[kategori] || kategori;
      where = { ...where, kategori: enumKey };
    }
    if (pageName === 'trending') where = { ...where, isTrending: true };
    if (pageName === 'sale')     where = { ...where, isSale: true };
    // Always filter out hidden products on public storefront
    where = { ...where, isVisible: true };

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

// GET /api/products/hero — returns the single hero-featured product (public)
export const getHeroProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { isHeroFeatured: true },
      include: { media: { orderBy: { order: 'asc' } } },
    });
    // Return null gracefully if none is set
    res.status(200).json(product ?? null);
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
    const { kode, nama, brand, bahan, ukuran, warna, harga, kategori, deskripsi, deletedMedia } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle media deletions
    if (deletedMedia) {
      let mediaToDelete;
      try { mediaToDelete = JSON.parse(deletedMedia); } catch { mediaToDelete = []; }

      if (mediaToDelete.length > 0) {
        const mediaRecords = await prisma.media.findMany({
          where: { id: { in: mediaToDelete }, product_id: id },
        });
        for (const record of mediaRecords) await deleteFile(record.url);
        await prisma.media.deleteMany({ where: { id: { in: mediaToDelete }, product_id: id } });
      }
    }

    const mediaResults = await uploadFiles(req.files);
    const currentMaxOrder =
      existingProduct.media.length > 0
        ? Math.max(...existingProduct.media.map((m) => m.order))
        : -1;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        kode:      kode      !== undefined ? kode                    : existingProduct.kode,
        nama:      nama      !== undefined ? nama || null            : existingProduct.nama,
        brand:     brand     !== undefined ? brand                   : existingProduct.brand,
        bahan:     bahan     !== undefined ? toBahanEnum(bahan)       : existingProduct.bahan,
        ukuran:    ukuran    !== undefined ? parseUkuranInput(ukuran): existingProduct.ukuran,
        warna:     warna     !== undefined ? parseWarnaInput(warna)  : existingProduct.warna,
        harga:     harga     !== undefined ? parseFloat(harga)       : existingProduct.harga,
        kategori:  kategori  !== undefined ? toKategoriEnum(kategori): existingProduct.kategori,
        deskripsi: deskripsi !== undefined ? deskripsi || null       : existingProduct.deskripsi,
        media: {
          create: mediaResults.map((m, index) => ({
            url: m.url,
            type: m.type,
            order: currentMaxOrder + 1 + index,
          })),
        },
      },
      include: { media: { orderBy: { order: 'asc' } } },
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

    for (const mediaItem of existingProduct.media) await deleteFile(mediaItem.url);
    await prisma.product.delete({ where: { id } });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/products/:id/pages — toggle page flags and visibility
export const updateProductPages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isTrending, isSale, isHeroFeatured, isVisible } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    // If setting isHeroFeatured = true, unset it on all other products first
    if (isHeroFeatured === true) {
      await prisma.product.updateMany({
        where: { isHeroFeatured: true, id: { not: id } },
        data: { isHeroFeatured: false },
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isTrending:     isTrending     !== undefined ? Boolean(isTrending)     : existing.isTrending,
        isSale:         isSale         !== undefined ? Boolean(isSale)         : existing.isSale,
        isHeroFeatured: isHeroFeatured !== undefined ? Boolean(isHeroFeatured) : existing.isHeroFeatured,
        isVisible:      isVisible      !== undefined ? Boolean(isVisible)      : existing.isVisible,
      },
      include: { media: { orderBy: { order: 'asc' } } },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
