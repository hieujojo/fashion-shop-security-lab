import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/products', async (req, res) => {
  const { category, q } = req.query;
  let sql = 'SELECT id, name, description, price_cents, category, image_url FROM products';
  const conds: string[] = [];
  const params: any[] = [];

  if (category) {
    params.push(category);
    conds.push(`category = $${params.length}`);
  }
  if (q) {
    conds.push(`name ILIKE '%${q}%'`);
  }
  if (conds.length > 0) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY id';

  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

router.get('/products/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = $1', [req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
});

export default router;
