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
 * Background worker to optimize video without blocking the user.
 */
const optimizeVideoInBackground = async (originalPath, optimizedPath) => {
  console.log(`[BG-FFMPEG]: Starting background optimization for ${path.basename(originalPath)}`);
  
  ffmpeg(originalPath)
    .outputOptions([
      '-c:v libx264',
      '-profile:v main',
      '-level 3.1',
      '-pix_fmt yuv420p',
      '-crf 28',
      '-preset fast',
      '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-c:a aac',
      '-b:a 128k',
      '-movflags +faststart'
    ])
    .toFormat('mp4')
    .on('error', (err) => {
      console.error(`[BG-FFMPEG ERROR]: Optimization failed for ${path.basename(originalPath)}:`, err.message);
    })
    .on('end', async () => {
      try {
        // Replace original with optimized version
        await fs.rename(optimizedPath, originalPath);
        console.log(`[BG-FFMPEG]: Successfully replaced original with optimized version: ${path.basename(originalPath)}`);
      } catch (err) {
        console.error(`[BG-FFMPEG ERROR]: Failed to swap files:`, err.message);
      }
    })
    .save(optimizedPath);
};

/**
 * Convert a stored upload into the app's public media shape.
 * Images are processed immediately (fast).
 * Videos are saved immediately, but optimized in the background (instant response).
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

  // --- Image Handling (Fast, keep synchronous) ---
  if (type === 'image') {
    const webpName = `${path.parse(fileName).name}.webp`;
    const webpPath = path.join(UPLOAD_DIR, webpName);

    try {
      await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
      await fs.unlink(filePath);
      return { url: `/uploads/${webpName}`, type: 'image' };
    } catch (error) {
      console.error('Image optimization failed:', error.message);
      return { url: `/uploads/${fileName}`, type: 'image' };
    }
  }

  // --- Video Handling (Instant response, background processing) ---
  if (type === 'video') {
    // We return the original URL immediately
    const publicUrl = `/uploads/${fileName}`;
    const tempOptimizedPath = path.join(UPLOAD_DIR, `optimizing-${fileName}`);

    // Trigger the background worker WITHOUT 'await'
    optimizeVideoInBackground(filePath, tempOptimizedPath);

    return {
      url: publicUrl,
      type: 'video',
    };
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
