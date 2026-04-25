# Product Catalog Management System

A premium, private, and complete production-ready web application for managing a product catalog.

## Features
- **Backend**: Node.js, Express.js with ES Modules
- **Database**: PostgreSQL (via Supabase) with Prisma ORM
- **Authentication**: JWT-based login (Single admin user via Environment Variables)
- **Image Storage**: Supabase Storage
- **Frontend**: Vanilla HTML/CSS/JS, premium design, mobile-friendly (optimized for iPad), glassmorphism UI.

## Setup Instructions

### 1. Prerequisites
- Node.js (v16 or higher)
- A [Supabase](https://supabase.com/) account and project.

### 2. Environment Variables
1. Copy `.env.example` to `.env`.
2. Fill in the values:
   - `DATABASE_URL`: Connection string from your Supabase Database settings (Transaction/Pooler URL).
   - `DIRECT_URL`: Direct database connection string from your Supabase Database settings.
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase Project `service_role` key for secure server-side storage uploads.
   - `ADMIN_USER` & `ADMIN_PASS`: Set your desired admin credentials.
   - `JWT_SECRET`: A secure random string for JWT signing.

### 3. Supabase Setup
1. In your Supabase dashboard, go to **Storage**.
2. Create a new bucket named **`products`**.
3. **Make the bucket Public** so images can be viewed on the frontend.
4. If you use the `service_role` key on the server, uploads will work without opening anonymous insert access. Keep this key only in server environment variables and never expose it in frontend code.

### 4. Database Initialization
Run the following commands to initialize your Prisma client and sync the schema to Supabase:
```bash
npm install
npm run build
npx prisma db push
```

### 5. Running Locally
Start the development server:
```bash
npm run dev
```
The application will be running at `http://localhost:3000`. 
- Open `http://localhost:3000` to be redirected to the login page.
- Login with the `ADMIN_USER` and `ADMIN_PASS` you set in the `.env` file.

### 6. Deployment (e.g., Render)
1. Push your code to a GitHub repository.
2. Create a new "Web Service" on Render.
3. Connect your repository.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add all the environment variables from your `.env` file into the Render dashboard.
7. Deploy!

### 7. Production Checklist
- Set `DATABASE_URL` to the Supabase pooled connection string.
- Set `DIRECT_URL` to the Supabase direct connection string.
- Set `SUPABASE_KEY` to the Supabase `service_role` key, because uploads happen from the backend.
- Set a strong `JWT_SECRET`, `ADMIN_USER`, and `ADMIN_PASS` in production.
- After the first deploy, run `npx prisma db push` against your production database if the table has not been created yet.
- Verify `https://your-domain/api/health` returns a success response after deployment.
