import multer from 'multer';
import path from 'path';
import fs from 'fs';

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;

let storage;

if (isVercel) {
  // Use memory storage for Vercel serverless functions
  storage = multer.memoryStorage();
} else {
  // Use disk storage for VPS
  const uploadDir = 'public/uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });
}

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
    // Vercel has a 4.5MB payload limit for the entire request.
    // We adjust the limit based on the platform.
    fileSize: isVercel ? 4 * 1024 * 1024 : 100 * 1024 * 1024,
    files: isVercel ? 2 : 10,
  },
});

export const uploadMiddleware = upload.array('media', isVercel ? 2 : 10);
