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
 * If it's an image, convert it to WebP and optimize.
 * If it's a video, compress it using ffmpeg.
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
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(webpPath);
      await fs.unlink(filePath);
      return { url: `/uploads/${webpName}`, type: 'image' };
    } catch (error) {
      console.error('Image optimization failed:', error.message);
      return { url: `/uploads/${fileName}`, type: 'image' };
    }
  }

  if (type === 'video') {
    const mp4Name = `${path.parse(fileName).name}-optimized.mp4`;
    const mp4Path = path.join(UPLOAD_DIR, mp4Name);

    // We still return a promise, but we use 'ultrafast' preset to minimize wait time.
    // For a real production app, this should be a background job (BullMQ/Redis).
    return new Promise((resolve) => {
      ffmpeg(filePath)
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p',  // Standard pixel format for web compatibility
          '-crf 28',
          '-preset ultrafast',
          '-tune animation',
          '-c:a aac',
          '-b:a 96k',
          '-movflags +faststart'
        ])
        .save(mp4Path)
        .on('end', async () => {
          try {
            await fs.unlink(filePath);
            resolve({ url: `/uploads/${mp4Name}`, type: 'video' });
          } catch (err) {
            resolve({ url: `/uploads/${fileName}`, type: 'video' });
          }
        })
        .on('error', (err) => {
          console.error('Video optimization failed:', err.message);
          resolve({ url: `/uploads/${fileName}`, type: 'video' });
        });
    });
  }

  return { url: `/uploads/${fileName}`, type };
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
