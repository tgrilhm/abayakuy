import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const jwtSecret = process.env.JWT_SECRET;

  // Guard: missing env vars → clear error instead of silent 500
  if (!adminUser || !adminPass) {
    console.error('[AUTH] ADMIN_USER or ADMIN_PASS env var is not set');
    return res.status(500).json({ error: 'Server misconfiguration: admin credentials not set' });
  }

  if (!jwtSecret) {
    console.error('[AUTH] JWT_SECRET env var is not set');
    return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set' });
  }

  if (username === adminUser && password === adminPass) {
    try {
      const token = jwt.sign(
        { username, role: 'admin' },
        jwtSecret,
        { expiresIn: '1d' }
      );
      return res.status(200).json({ token });
    } catch (err) {
      console.error('[AUTH] jwt.sign failed:', err.message);
      return res.status(500).json({ error: 'Failed to generate token: ' + err.message });
    }
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};
