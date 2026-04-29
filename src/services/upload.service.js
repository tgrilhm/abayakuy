import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

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
 * If it's an image, convert it to WebP and optimize.
 * @param {object} file - Multer file object
 * @returns {{ url: string, type: string }} - Public URL path and file type
 */
export const uploadFile = async (file) => {
  await ensureDir();

  const fileName = file.filename || path.basename(file.path || '');
  if (!fileName) {
    throw new Error('Uploaded file is missing a filename');
  }

  const filePath = path.join(UPLOAD_DIR, fileName);
  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

  if (type === 'image') {
    const webpName = `${path.parse(fileName).name}.webp`;
    const webpPath = path.join(UPLOAD_DIR, webpName);

    try {
      // Convert to WebP with sharp
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(webpPath);

      // Delete the original (non-webp) file to save space
      await fs.unlink(filePath);

      return {
        url: `/uploads/${webpName}`,
        type: 'image',
      };
    } catch (error) {
      console.error('Image optimization failed, falling back to original:', error.message);
      // If optimization fails, fall back to the original file
      return {
        url: `/uploads/${fileName}`,
        type: 'image',
      };
    }
  }

  // Videos are returned as-is
  return {
    url: `/uploads/${fileName}`,
    type,
  };
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
