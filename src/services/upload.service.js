import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Convert a stored upload into the app's public media shape.
 * Images are processed immediately (fast).
 * Videos are saved immediately and returned with 'processing' status if needed.
 * @param {object} file - Multer file object
 * @returns {{ url: string, type: string, status: string, path: string }}
 */
export const uploadFile = async (file) => {
  await ensureDir();

  const fileName = file.filename || path.basename(file.path || '');
  if (!fileName) {
    throw new Error('Uploaded file is missing a filename');
  }

  const filePath = path.join(UPLOAD_DIR, fileName);
  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

  // --- Image Handling (Fast, keep synchronous) ---
  if (type === 'image') {
    const webpName = `${path.parse(fileName).name}.webp`;
    const webpPath = path.join(UPLOAD_DIR, webpName);

    try {
      await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
      await fs.unlink(filePath);
      return { url: `/uploads/${webpName}`, type: 'image', status: 'ready', path: webpPath };
    } catch (error) {
      console.error('Image optimization failed:', error.message);
      return { url: `/uploads/${fileName}`, type: 'image', status: 'ready', path: filePath };
    }
  }

  // --- Video Handling ---
  if (type === 'video') {
    return {
      url: `/uploads/${fileName}`,
      type: 'video',
      status: 'processing',
      path: filePath
    };
  }

  return { url: `/uploads/${fileName}`, type, status: 'ready', path: filePath };
};

/**
 * Upload multiple files to local storage.
 * @param {object[]} files - Array of Multer file objects
 * @returns {Array<{ url: string, type: string }>} - Array of public URLs and types
 */
export const uploadFiles = async (files) => {
  if (!files || files.length === 0) return [];

  const results = await Promise.all(files.map((file) => uploadFile(file)));
  return results;
};

/**
 * Delete a file from local storage.
 * @param {string} publicUrl - The public URL path of the file to delete
 */
export const deleteFile = async (publicUrl) => {
  try {
    // Extract filename from URL (e.g., /uploads/filename.jpg -> filename.jpg)
    const fileName = path.basename(publicUrl);
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file from storage:', error.message);
  }
};
