import multer from 'multer';

// Use memory storage so we can upload the buffer directly to Supabase
const storage = multer.memoryStorage();

// File filter: only accept images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (to accommodate videos)
    files: 7, // Max 7 files per upload
  },
});

// Accept multiple files under the field name 'media'
export const uploadMiddleware = upload.array('media', 7);
