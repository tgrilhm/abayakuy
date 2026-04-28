import fs from 'fs';
import path from 'path';

/**
 * Process a single uploaded file.
 * @param {object} file - Multer file object
 * @returns {{ url: string, type: string }} - Local URL and file type
 */
export const uploadFile = async (file) => {
  // Determine type based on mimetype
  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
  
  // Create the URL path (relative to the server)
  // Example: /uploads/media-123.jpg
  const relativeUrl = `/uploads/${file.filename}`;

  return {
    url: relativeUrl,
    type,
  };
};

/**
 * Process multiple uploaded files.
 * @param {object[]} files - Array of Multer file objects
 * @returns {Array<{ url: string, type: string }>} - Array of local URLs and types
 */
export const uploadFiles = async (files) => {
  if (!files || files.length === 0) return [];
  return files.map((file) => ({
    url: `/uploads/${file.filename}`,
    type: file.mimetype.startsWith('video/') ? 'video' : 'image',
  }));
};

/**
 * Delete a file from the local filesystem.
 * @param {string} localUrl - The relative URL of the file to delete
 */
export const deleteFile = async (localUrl) => {
  try {
    if (!localUrl || !localUrl.startsWith('/uploads/')) return;

    const fileName = localUrl.replace('/uploads/', '');
    const filePath = path.join(process.cwd(), 'public/uploads', fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Failed to delete file from local storage:', error.message);
  }
};
