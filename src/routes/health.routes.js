import { Router } from 'express';
import fs from 'fs/promises';
import { constants as fsConstants } from 'fs';
import path from 'path';
import redis from '../config/redis.js';
import { getMediaQueueSnapshot } from '../services/videoQueue.js';

const router = Router();

router.get('/', async (_req, res) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');

  const [redisStatus, queueSnapshot, uploadsWritable] = await Promise.all([
    redis
      .ping()
      .then(() => 'ok')
      .catch((error) => `error:${error.message}`),
    getMediaQueueSnapshot().catch((error) => ({
      error: error.message,
    })),
    fs
      .access(uploadsDir, fsConstants.W_OK)
      .then(() => true)
      .catch(() => false),
  ]);

  res.status(200).json({
    status: 'ok',
    message: 'API is running smoothly',
    mediaProcessing: {
      redis: redisStatus,
      uploadsDir,
      uploadsWritable,
      queue: queueSnapshot,
    },
  });
});

export default router;
