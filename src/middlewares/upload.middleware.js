import multer from 'multer';

// Use memory storage so we can upload the buffer directly to Supabase
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadMiddleware = upload.single('image');
