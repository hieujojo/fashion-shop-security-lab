import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/products/:id/reviews', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json(rows);
});

router.post('/products/:id/reviews', async (req, res) => {
  const { author, rating, content } = req.body;
  if (!author || !rating || !content) return res.status(400).json({ error: 'author, rating, content required' });

  const { rows } = await pool.query(
    `INSERT INTO reviews (product_id, author, content, rating)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.params.id, author, content, rating]
  );
  res.status(201).json(rows[0]);
});

export default router;
