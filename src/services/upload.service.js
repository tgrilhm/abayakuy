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

    console.log(`[FFMPEG]: Starting optimization for ${fileName}`);

    return new Promise((resolve) => {
      ffmpeg(filePath)
        .outputOptions([
          '-c:v libx264',
          '-profile:v main',    // High compatibility profile
          '-level 3.1',         // Compatibility level for mobile
          '-pix_fmt yuv420p',
          '-crf 28',
          '-preset fast',
          '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart'
        ])
        .toFormat('mp4')
        .on('start', (commandLine) => {
          console.log('[FFMPEG]: Spawned with command: ' + commandLine);
        })
        .on('error', (err, stdout, stderr) => {
          console.error('[FFMPEG ERROR]:', err.message);
          console.error('[FFMPEG STDERR]:', stderr);
          resolve({ url: `/uploads/${fileName}`, type: 'video' }); // Fallback
        })
        .on('end', async () => {
          console.log(`[FFMPEG]: Finished optimization for ${mp4Name}`);
          try {
            await fs.unlink(filePath); // Delete original
            resolve({ url: `/uploads/${mp4Name}`, type: 'video' });
          } catch (err) {
            console.error('[FFMPEG]: Failed to delete original file:', err.message);
            resolve({ url: `/uploads/${mp4Name}`, type: 'video' });
          }
        })
        .save(mp4Path);
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
