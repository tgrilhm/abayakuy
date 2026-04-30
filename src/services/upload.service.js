import path from 'path';
import fs from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const VIDEO_PROCESSING_MODE = (process.env.VIDEO_PROCESSING_MODE || 'passthrough').toLowerCase();
const MAX_VIDEO_UPLOAD_MB = Math.max(1, parseInt(process.env.MAX_VIDEO_UPLOAD_MB || '150', 10));
const SUPPORTED_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

// Ensure upload directory exists
async function ensureDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

const removeUploadedFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch {}
};

const validateVideoFile = async (file, filePath) => {
  if (!SUPPORTED_VIDEO_MIME_TYPES.has(file.mimetype)) {
    await removeUploadedFile(filePath);
    throw new Error('Unsupported video format. Please upload MP4, WebM, or MOV files.');
  }

  const fileSizeMb = (file.size ?? 0) / (1024 * 1024);
  if (fileSizeMb > MAX_VIDEO_UPLOAD_MB) {
    await removeUploadedFile(filePath);
    throw new Error(`Video too large. Please keep videos under ${MAX_VIDEO_UPLOAD_MB}MB.`);
  }
};

/**
 * Upload files immediately and return raw paths with processing status.
 * Both images and videos are deferred to the background queue.
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
  const shouldQueueProcessing =
    type === 'image' || (type === 'video' && VIDEO_PROCESSING_MODE === 'transcode');

  if (type === 'video') {
    await validateVideoFile(file, filePath);
  }

  return {
    url: `/uploads/${fileName}`,
    type,
    status: shouldQueueProcessing ? 'processing' : 'ready',
    path: filePath,
    fileName,
    originalName: file.originalname,
    size: file.size ?? null,
    mimetype: file.mimetype ?? null,
    shouldQueueProcessing,
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
