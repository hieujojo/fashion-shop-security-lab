import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const { rows } = await pool.query(sql);

  if (rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const user = rows[0];

  res.cookie('session', String(user.id), {
    httpOnly: false,
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 60 * 1000,
  });
  res.json({ id: user.id, email: user.email, role: user.role });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});

export default router;
