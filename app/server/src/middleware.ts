import { pool } from './db';

export async function requireAuth(req, res, next) {
  const userId = req.cookies.session;
  if (!userId) return res.status(401).json({ error: 'Not logged in' });
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid session' });
  req.user = rows[0];
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}
