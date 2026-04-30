import fs from 'fs';
import path from 'path';
import multer from 'multer';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const SUPPORTED_VIDEO_MIME_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Write uploads straight to disk to avoid large in-memory buffers.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;
    cb(null, fileName);
  },
});

// File filter: only accept images and videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/')) {
    if (SUPPORTED_VIDEO_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported video format. Please upload MP4, WebM, or MOV files.'), false);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10, // Max 10 files per upload
    fileSize: 500 * 1024 * 1024, // 500MB limit per file
  },
});

// Accept multiple files under the field name 'media'
export const uploadMiddleware = upload.array('media', 10);
