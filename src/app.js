import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

// ─── Startup env validation — fail fast with a clear message ───
const REQUIRED_ENV = ['JWT_SECRET', 'ADMIN_USER', 'ADMIN_PASS'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Set these in your Vercel project → Settings → Environment Variables, then redeploy.');
  // Don't crash the process on Vercel — just log so the error shows in function logs
}

const app = express();

// ─── CORS ───
// On Vercel the frontend is served from the same domain as the API,
// so same-origin requests have no Origin header and are always allowed.
// For local dev and any cross-origin callers we allow explicitly listed origins,
// or fall back to allowing all origins when ALLOWED_ORIGINS is not set.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null; // null = allow all (safe for same-domain Vercel deployments)

app.use(
  cors({
    origin: (origin, callback) => {
      // No origin = same-domain request, curl, Postman — always allow
      if (!origin) return callback(null, true);
      // If no allowlist configured, allow everything
      if (!allowedOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Serve Static Uploads ───
app.use('/uploads', express.static('uploads'));

// ─── Request logger (helps debug Vercel function logs) ───
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ─── 404 handler for unmatched API routes ───
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ─── Global error handler ───
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (missingEnv.length > 0) {
      console.warn(`WARNING: Missing env vars: ${missingEnv.join(', ')}`);
    }
  });
}

export default app;
