# Product Catalog Management System

A production-ready web application for managing an abaya product catalog.

## Features
- **Backend**: Node.js, Express.js with ES Modules
- **Database**: PostgreSQL with Prisma ORM
- **Media Storage**: local `uploads/` directory persisted on the VPS
- **Media Processing**: BullMQ + Redis background jobs with `ffmpeg` and `sharp`
- **Authentication**: JWT-based login with admin credentials from environment variables
- **Frontend**: React + Vite admin interface
- **Deployment**: Docker-based VPS deployment with frontend and backend containers

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Redis
- `ffmpeg`

### 2. Environment Variables
1. Copy `.env.example` to `.env`.
2. Fill in the values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `REDIS_URL`: Redis connection string for BullMQ
   - `ADMIN_USER` and `ADMIN_PASS`: admin login credentials
   - `JWT_SECRET`: secure random string for JWT signing
   - `VIDEO_WORKER_CONCURRENCY`: optional queue worker concurrency, default `1` for small VPS instances
   - `VIDEO_PROCESSING_MODE`: `passthrough` to publish raw videos immediately, `transcode` to keep background ffmpeg processing
   - `MAX_VIDEO_UPLOAD_MB`: practical VPS-side size cap for uploaded videos
   - `STAGED_MEDIA_TTL_HOURS`: how long admin pre-uploads can wait before automatic cleanup
   - `STAGED_MEDIA_CLEANUP_INTERVAL_MS`: how often the backend removes expired staged uploads

### 3. Storage And Processing
1. The app writes uploaded images and videos to `uploads/`.
2. Mount that directory to persistent storage in production.
3. Images are converted to `.webp` in the background.
4. Videos can either publish immediately in raw form or be transcoded in the background, depending on `VIDEO_PROCESSING_MODE`.
5. Admin uploads can be staged before product creation, with automatic cleanup for abandoned files.
6. Check `GET /api/health` to verify Redis, queue counts, and upload directory access.

### 4. Install and Initialize
```bash
npm install
npm run frontend:install
npm run build
npx prisma db push
```

### 5. Running Locally
Start the backend:
```bash
npm run dev
```

Start the frontend in a second terminal:
```bash
npm run frontend:dev
```

Local URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

### 6. Project Structure
- `frontend/`: React + Vite frontend
- `src/`: Express API source
- `uploads/`: persisted media files in VPS/Docker deployments
- `prisma/`: Prisma schema
- `public/`: legacy static frontend retained for reference

### 7. Deploying To A VPS
1. Build and run the containers with `docker-compose up -d --build`.
2. Make sure `./uploads` is mounted to `/app/uploads` for persistence.
3. Keep Redis reachable from the backend container.
4. Start with `VIDEO_WORKER_CONCURRENCY=1` on small VPS instances.
5. Use `VIDEO_PROCESSING_MODE=passthrough` if admin upload speed matters more than aggressive video compression.
6. Verify `https://your-domain/api/health` after deployment.

### 8. Production Checklist
- Set `DATABASE_URL` and `REDIS_URL`.
- Set strong values for `JWT_SECRET`, `ADMIN_USER`, and `ADMIN_PASS`.
- Run `npx prisma db push` against production if the tables do not exist yet.
- Verify `https://your-domain/api/health` shows Redis connected and queue details.
- Monitor backend logs for `[QUEUE-WORKER]` entries during video uploads.
