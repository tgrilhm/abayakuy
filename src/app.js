import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Startup env validation — fail fast with a clear message ───
const REQUIRED_ENV = ['JWT_SECRET', 'ADMIN_USER', 'ADMIN_PASS'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missingEnv.join(', ')}`);
}

const app = express();

// ─── Production Middleware ───
app.use(helmet({
  contentSecurityPolicy: false, // Disable for easier initial setup, can be tightened later
}));
app.use(compression());

// ─── CORS ───
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request logger ───
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ─── Serve Frontend ───
if (process.env.VERCEL) {
  // On Vercel, static files and rewrites are handled by vercel.json
  // We don't need to serve frontend/dist manually here
} else {
  // On VPS/Local, we serve the frontend/dist folder
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  
  // Serve Uploads (Images/Videos) - ONLY on VPS
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

  // Catch-all for Frontend (SPA support) - ONLY on VPS
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return;
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('Frontend build not found. Run npm run build.');
      }
    });
  });
}

// ─── Global error handler ───
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Only start the server if NOT on Vercel
// Vercel handles the listener automatically via api/index.js
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (missingEnv.length > 0) {
      console.warn(`WARNING: Missing env vars: ${missingEnv.join(', ')}`);
    }
  });
}

export default app;
