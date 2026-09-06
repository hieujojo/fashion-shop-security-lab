import { Router } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware';

const router = Router();

router.get('/profile', requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

router.post('/profile/email', requireAuth, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ error: 'newEmail required' });

  const { rows } = await pool.query(
    'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, role',
    [newEmail, req.user.id]
  );
  res.json(rows[0]);
});

export default router;
