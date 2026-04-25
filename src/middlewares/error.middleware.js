export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma errors or specific known errors can be handled here
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'A record with that unique field already exists.' });
  }

  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
