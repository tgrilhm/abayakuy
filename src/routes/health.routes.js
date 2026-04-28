import { Router } from 'express';
import prisma from '../config/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'API is running smoothly',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'API is running, but database is down',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
