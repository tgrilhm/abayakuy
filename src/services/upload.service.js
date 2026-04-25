import { supabase } from '../config/supabase.js';

export const uploadImage = async (file) => {
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
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};
