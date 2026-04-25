import { supabase } from '../config/supabase.js';

/**
 * Upload a single file to Supabase Storage.
 * @param {object} file - Multer file object
 * @returns {{ url: string, type: string }} - Public URL and file type
 */
export const uploadFile = async (file) => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const fileExt = file.originalname.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('products')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  // Determine type based on mimetype
  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

  return {
    url: publicUrlData.publicUrl,
    type,
  };
};

/**
 * Upload multiple files to Supabase Storage.
 * @param {object[]} files - Array of Multer file objects
 * @returns {Array<{ url: string, type: string }>} - Array of public URLs and types
 */
export const uploadFiles = async (files) => {
  if (!files || files.length === 0) return [];

  const results = await Promise.all(files.map((file) => uploadFile(file)));
  return results;
};

/**
 * Delete a file from Supabase Storage by its public URL.
 * @param {string} publicUrl - The public URL of the file to delete
 */
export const deleteFile = async (publicUrl) => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    // Extract the file path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/products/<filename>
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/products/');
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];
    await supabase.storage.from('products').remove([filePath]);
  } catch (error) {
    console.error('Failed to delete file from storage:', error.message);
  }
};
