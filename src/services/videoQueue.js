import { Queue, Worker } from 'bullmq';
import path from 'path';
import fs from 'fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import sharp from 'sharp';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';
import { invalidateCache } from '../config/redis.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const VIDEO_CONCURRENCY = Math.max(1, parseInt(process.env.VIDEO_WORKER_CONCURRENCY || '1', 10));

const ffprobeAsync = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });

// The queue
export const videoQueue = new Queue('media-processing', { 
  connection: redis.options 
});

export const getMediaQueueSnapshot = async () => {
  const [counts, waiting, active, failed] = await Promise.all([
    videoQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
    videoQueue.getWaitingCount(),
    videoQueue.getActiveCount(),
    videoQueue.getFailedCount(),
  ]);

  return {
    counts,
    waiting,
    active,
    failed,
    workerConcurrency: VIDEO_CONCURRENCY,
  };
};

// The worker logic
const processMediaJob = async (job) => {
  const { rawFilePath, mediaId } = job.data;
  const fileName = path.basename(rawFilePath);
  const startedAt = Date.now();

  if (job.name === 'optimize-video') {
    const mp4Name = `${path.parse(fileName).name}.mp4`;
    const finalVideoPath = path.join(UPLOAD_DIR, mp4Name);
    const tempOptimizedPath = path.join(UPLOAD_DIR, `optimizing-${mp4Name}`);
    console.log(`[QUEUE-WORKER]: Starting video optimization for ${fileName} (job=${job.id}, mediaId=${mediaId})`);

    try {
      const inputStats = await fs.stat(rawFilePath);
      const probe = await ffprobeAsync(rawFilePath);
      const videoStream = probe.streams?.find((stream) => stream.codec_type === 'video');

      console.log('[QUEUE-WORKER]: Video source metadata', {
        jobId: job.id,
        mediaId,
        fileName,
        sizeBytes: inputStats.size,
        durationSeconds: probe.format?.duration ?? null,
        codec: videoStream?.codec_name ?? null,
        width: videoStream?.width ?? null,
        height: videoStream?.height ?? null,
      });

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
      await fs.rename(tempOptimizedPath, finalVideoPath);
      if (finalVideoPath !== rawFilePath) {
        try {
          await fs.unlink(rawFilePath);
        } catch {}
      }
      const outputStats = await fs.stat(finalVideoPath);

      // Update DB status
      await prisma.media.update({
        where: { id: mediaId },
        data: {
          url: `/uploads/${mp4Name}`,
          status: 'ready',
        }
      });
      await invalidateCache('products:*');
      console.log(`[QUEUE-WORKER]: Invalidated product caches after media ${mediaId} became ready`);

      console.log('[QUEUE-WORKER]: Successfully optimized video', {
        jobId: job.id,
        mediaId,
        fileName,
        durationMs: Date.now() - startedAt,
        outputSizeBytes: outputStats.size,
      });
    } catch (err) {
      console.error(`[QUEUE-WORKER ERROR]: Video failed for ${fileName}:`, err.message);
      try { await fs.unlink(tempOptimizedPath); } catch {}
      await prisma.media.update({ where: { id: mediaId }, data: { status: 'failed' } });
      await invalidateCache('products:*');
      console.log(`[QUEUE-WORKER]: Invalidated product caches after media ${mediaId} failed`);
      throw err;
    }
  }

  if (job.name === 'optimize-image') {
    console.log(`[QUEUE-WORKER]: Starting image optimization for ${fileName} (job=${job.id}, mediaId=${mediaId})`);
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
      await invalidateCache('products:*');
      console.log(`[QUEUE-WORKER]: Invalidated product caches after media ${mediaId} became ready`);

      console.log('[QUEUE-WORKER]: Successfully optimized image', {
        jobId: job.id,
        mediaId,
        fileName,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      console.error(`[QUEUE-WORKER ERROR]: Image failed for ${fileName}:`, err.message);
      await prisma.media.update({ where: { id: mediaId }, data: { status: 'failed' } });
      await invalidateCache('products:*');
      console.log(`[QUEUE-WORKER]: Invalidated product caches after media ${mediaId} failed`);
      throw err;
    }
  }
};

// The worker (runs in background)
export const videoWorker = new Worker('media-processing', processMediaJob, { 
  connection: redis.options,
  concurrency: VIDEO_CONCURRENCY,
  removeOnComplete: { count: 50 },
  removeOnFail: { count: 100 },
});

videoWorker.on('completed', (job) => {
  console.log(`[QUEUE-WORKER]: Job ${job.id} completed`);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[QUEUE-WORKER]: Job ${job.id} failed:`, err.message);
});
