import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase.js';

// Detect if we are running on Vercel
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;

/**
 * Upload a single file. 
 * On Vercel: Uploads to Supabase.
 * On VPS: Saves to local disk.
 */
export const uploadFile = async (file) => {
  const type = file.mimetype.startsWith('video/') ? 'video' : 'image';

  if (isVercel) {
    if (!supabase) throw new Error('Supabase is not configured for Vercel deployment.');
    
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(`Supabase Upload Error: ${error.message}`);

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, type };
  } else {
    // VPS / Local Storage logic
    const relativeUrl = `/uploads/${file.filename}`;
    return { url: relativeUrl, type };
  }
};

/**
 * Upload multiple files.
 */
export const uploadFiles = async (files) => {
  if (!files || files.length === 0) return [];
  
  if (isVercel) {
    // Vercel uses memoryStorage, so files have buffers
    const results = await Promise.all(files.map((file) => uploadFile(file)));
    return results;
  } else {
    // VPS uses diskStorage, so files are already on disk
    return files.map((file) => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    }));
  }
};

/**
 * Delete a file.
 */
export const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    if (isVercel || fileUrl.startsWith('http')) {
      if (!supabase) return;
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/products/');
      if (pathParts.length < 2) return;
      const filePath = pathParts[1];
      await supabase.storage.from('products').remove([filePath]);
    } else {
      // Local file deletion
      const fileName = fileUrl.replace('/uploads/', '');
      const filePath = path.join(process.cwd(), 'public/uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error('Delete error:', error.message);
  }
};
