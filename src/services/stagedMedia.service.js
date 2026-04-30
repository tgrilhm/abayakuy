import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../config/prisma.js';

const STAGED_MEDIA_TTL_HOURS = Math.max(1, parseInt(process.env.STAGED_MEDIA_TTL_HOURS || '24', 10));
const STAGED_MEDIA_CLEANUP_INTERVAL_MS = Math.max(
  5 * 60 * 1000,
  parseInt(process.env.STAGED_MEDIA_CLEANUP_INTERVAL_MS || String(60 * 60 * 1000), 10)
);
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const getExpiryDate = () => new Date(Date.now() + STAGED_MEDIA_TTL_HOURS * 60 * 60 * 1000);

const deleteByUrl = async (publicUrl) => {
  try {
    const fileName = path.basename(publicUrl);
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.unlink(filePath);
  } catch {}
};

export const createStagedMediaRecord = async ({ url, type, originalName, size, mimeType }) => {
  return prisma.stagedMedia.create({
    data: {
      token: crypto.randomUUID(),
      url,
      type,
      status: 'uploaded',
      originalName,
      size,
      mimeType: mimeType || null,
      expiresAt: getExpiryDate(),
    },
  });
};

export const deleteStagedMediaById = async (id) => {
  const record = await prisma.stagedMedia.findUnique({ where: { id } });
  if (!record) return null;

  await deleteByUrl(record.url);
  await prisma.stagedMedia.delete({ where: { id } });
  return record;
};

export const getStagedMediaByIds = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const records = await prisma.stagedMedia.findMany({
    where: {
      id: { in: ids },
      expiresAt: { gt: new Date() },
    },
    orderBy: { created_at: 'asc' },
  });

  if (records.length !== ids.length) {
    throw new Error('Some staged uploads were not found. Please re-upload the missing files.');
  }

  return ids
    .map((id) => records.find((record) => record.id === id))
    .filter(Boolean);
};

export const deleteStagedMediaByIds = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return;

  await prisma.stagedMedia.deleteMany({
    where: { id: { in: ids } },
  });
};

export const cleanupExpiredStagedMedia = async () => {
  const expired = await prisma.stagedMedia.findMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });

  if (expired.length === 0) return 0;

  await Promise.all(expired.map((record) => deleteByUrl(record.url)));
  await prisma.stagedMedia.deleteMany({
    where: {
      id: { in: expired.map((record) => record.id) },
    },
  });

  return expired.length;
};

let cleanupStarted = false;

export const startStagedMediaCleanup = () => {
  if (cleanupStarted) return;
  cleanupStarted = true;

  cleanupExpiredStagedMedia().catch((error) => {
    console.error('[STAGED MEDIA CLEANUP ERROR]:', error.message);
  });

  setInterval(() => {
    cleanupExpiredStagedMedia().catch((error) => {
      console.error('[STAGED MEDIA CLEANUP ERROR]:', error.message);
    });
  }, STAGED_MEDIA_CLEANUP_INTERVAL_MS);
};
