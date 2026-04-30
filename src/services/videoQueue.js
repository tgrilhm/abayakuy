import { Queue, Worker } from 'bullmq';
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// The queue
export const videoQueue = new Queue('media-processing', { 
  connection: redis.options 
});

// The worker logic
const processMediaJob = async (job) => {
  const { rawFilePath, mediaId } = job.data;
  const fileName = path.basename(rawFilePath);

  if (job.name === 'optimize-video') {
    const tempOptimizedPath = path.join(UPLOAD_DIR, `optimizing-${fileName}`);
    console.log(`[QUEUE-WORKER]: Starting video optimization for ${fileName}`);

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

      console.log(`[QUEUE-WORKER]: Successfully optimized video ${fileName}`);
    } catch (err) {
      console.error(`[QUEUE-WORKER ERROR]: Video failed for ${fileName}:`, err.message);
      try { await fs.unlink(tempOptimizedPath); } catch {}
      await prisma.media.update({ where: { id: mediaId }, data: { status: 'failed' } });
      throw err;
    }
  }

  if (job.name === 'optimize-image') {
    console.log(`[QUEUE-WORKER]: Starting image optimization for ${fileName}`);
    const webpName = `${path.parse(fileName).name}.webp`;
    const webpPath = path.join(UPLOAD_DIR, webpName);

    try {
      await sharp(rawFilePath).webp({ quality: 80 }).toFile(webpPath);
      
      // Delete the original raw file
      await fs.unlink(rawFilePath);

      // Update DB record with new URL and ready status
      await prisma.media.update({
        where: { id: mediaId },
        data: { 
          url: `/uploads/${webpName}`,
          status: 'ready' 
        }
      });

      console.log(`[QUEUE-WORKER]: Successfully optimized image ${fileName}`);
    } catch (err) {
      console.error(`[QUEUE-WORKER ERROR]: Image failed for ${fileName}:`, err.message);
      await prisma.media.update({ where: { id: mediaId }, data: { status: 'failed' } });
      throw err;
    }
  }
};

// The worker (runs in background)
export const videoWorker = new Worker('media-processing', processMediaJob, { 
  connection: redis.options,
  concurrency: 2 // Can handle a bit more for mixed tasks
});

videoWorker.on('completed', (job) => {
  console.log(`[QUEUE-WORKER]: Job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[QUEUE-WORKER]: Job ${job.id} failed:`, err.message);
});
