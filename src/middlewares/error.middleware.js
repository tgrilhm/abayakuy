export const errorHandler = (err, req, res, next) => {
  // Always log the full error — visible in Vercel function logs
  console.error(`[ERROR] ${req.method} ${req.path}`, {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'A record with that unique field already exists.' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Please upload a smaller file.' });
  }

  // Multer file count limit
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files. Maximum 10 files are allowed.' });
  }

  // CORS error
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }

  // Always include the message so errors are visible — remove once stable
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
};
