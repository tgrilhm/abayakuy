# Product Catalog Management System

A production-ready web application for managing an abaya product catalog.

## Features
- **Backend**: Node.js, Express.js with ES Modules
- **Database**: PostgreSQL (via Supabase) with Prisma ORM
- **Authentication**: JWT-based login with admin credentials from environment variables
- **Image Storage**: Supabase Storage
- **Frontend**: React + Vite admin interface
- **Deployment**: Vercel-friendly split between static frontend and `/api` serverless backend

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- A [Supabase](https://supabase.com/) account and project

### 2. Environment Variables
1. Copy `.env.example` to `.env`.
2. Fill in the values:
   - `DATABASE_URL`: Supabase pooled connection string
   - `DIRECT_URL`: Supabase direct connection string
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_KEY`: Supabase `service_role` key for server-side storage uploads
   - `ADMIN_USER` and `ADMIN_PASS`: admin login credentials
   - `JWT_SECRET`: secure random string for JWT signing

### 3. Supabase Setup
1. In Supabase Storage, create a bucket named `products`.
2. Make the bucket public if media should be viewable in the frontend.
3. Keep the `service_role` key only in server environment variables.

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
- `api/index.js`: Vercel serverless entrypoint
- `prisma/`: Prisma schema
- `public/`: legacy static frontend retained for reference

### 7. Deploying to Vercel
1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Use build command: `npm install && npm run build`
4. Use output directory: `frontend/dist`
5. Add the production environment variables from `.env`.
6. Deploy.

### 8. Production Checklist
- Set `DATABASE_URL` to the Supabase pooled connection string.
- Set `DIRECT_URL` to the Supabase direct connection string.
- Set `SUPABASE_KEY` to the Supabase `service_role` key.
- Set strong values for `JWT_SECRET`, `ADMIN_USER`, and `ADMIN_PASS`.
- Run `npx prisma db push` against production if the tables do not exist yet.
- Verify `https://your-domain/api/health` after deployment.
