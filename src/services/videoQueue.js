import { Queue, Worker } from 'bullmq';
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// The queue
export const videoQueue = new Queue('video-processing', { 
  connection: redis.options 
});

// The worker logic
const processVideoJob = async (job) => {
  const { rawFilePath, mediaId } = job.data;
  const fileName = path.basename(rawFilePath);
  const tempOptimizedPath = path.join(UPLOAD_DIR, `optimizing-${fileName}`);

  console.log(`[QUEUE-WORKER]: Starting optimization for ${fileName}`);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(rawFilePath)
        .outputOptions([
          '-c:v libx264',
          '-profile:v main',
          '-level 3.1',
          '-pix_fmt yuv420p',
          '-crf 28',
          '-preset fast',
          '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
          '-c:a aac',
          '-b:a 128k',
          '-movflags +faststart'
        ])
        .toFormat('mp4')
        .on('error', (err) => reject(err))
        .on('end', () => resolve())
        .save(tempOptimizedPath);
    });

    // Replace original with optimized version
    await fs.rename(tempOptimizedPath, rawFilePath);

    // Update DB status
    await prisma.media.update({
      where: { id: mediaId },
      data: { status: 'ready' }
    });

    console.log(`[QUEUE-WORKER]: Successfully optimized ${fileName}`);
  } catch (err) {
    console.error(`[QUEUE-WORKER ERROR]: Failed for ${fileName}:`, err.message);
    
    // Cleanup temp file if it exists
    try { await fs.unlink(tempOptimizedPath); } catch {}

    await prisma.media.update({
      where: { id: mediaId },
      data: { status: 'failed' }
    });
    throw err;
  }
};

// The worker (runs in background)
export const videoWorker = new Worker('video-processing', processVideoJob, { 
  connection: redis.options,
  concurrency: 1 // Only process one video at a time to save VPS resources
});

videoWorker.on('completed', (job) => {
  console.log(`[QUEUE-WORKER]: Job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[QUEUE-WORKER]: Job ${job.id} failed:`, err.message);
});
