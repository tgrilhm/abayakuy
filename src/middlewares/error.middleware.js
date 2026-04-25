export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'A record with that unique field already exists.' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Please upload a smaller file.' });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files. Maximum 7 files are allowed.' });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
