import { Router } from 'express';
import { pool } from '../db';
import { requireAuth, requireAdmin } from '../middleware';

const router = Router();

router.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, created_at FROM users ORDER BY id'
  );
  res.json(rows);
});

router.get('/admin/products', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.category, p.price_cents,
            COUNT(r.id)::int AS review_count
     FROM products p LEFT JOIN reviews r ON r.product_id = p.id
     GROUP BY p.id ORDER BY p.id`
  );
  res.json(rows);
});

router.get('/admin/reviews', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT r.id, r.product_id, p.name AS product_name, r.author, r.content, r.rating, r.created_at
     FROM reviews r JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC LIMIT 20`
  );
  res.json(rows);
});

export default router;
