import fs from 'fs/promises';
import path from 'path';

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
 * Upload a single file to local storage.
 * @param {object} file - Multer file object
 * @returns {{ url: string, type: string }} - Public URL path and file type
 */
export const uploadFile = async (file) => {
  await ensureDir();

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Write file to disk
  await fs.writeFile(filePath, file.buffer);

  // Determine type based on mimetype
  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

  // Return relative URL for Nginx/Express to serve
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
