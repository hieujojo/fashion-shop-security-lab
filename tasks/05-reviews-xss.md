# Tasks 05: Reviews — post + render HTML thô → Stored XSS (F02)

> Phase 1 · Người làm: AI · Vuln cài ở task này: **F02 (Stored XSS)** — cần render bằng dangerouslySetInnerHTML.

---

## Dependencies

```
Cần: tasks/02 (bảng reviews), tasks/04 (ProductDetail route + page)
```

---

## Files tạo

### ✅ app/server/src/routes/reviews.ts

```typescript
import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/products/:id/reviews → danh sách review của 1 sản phẩm (mới nhất trước)
router.get('/products/:id/reviews', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [req.params.id]
  );
  res.json(rows);
});

// POST /api/products/:id/reviews  { author, rating, content }
// D8: KHÔNG cần đăng nhập (như nhiều shop thật cho review nặc danh)
router.post('/products/:id/reviews', async (req, res) => {
  const { author, rating, content } = req.body;
  if (!author || !rating || !content) return res.status(400).json({ error: 'author, rating, content required' });

  // VULN-F02 (phần server): lưu content THÔ, không sanitize, không validate độ dài
  // See tasks/05 + docs/guides/decisions.md (D8). DO NOT "fix".
  const { rows } = await pool.query(
    `INSERT INTO reviews (product_id, author, content, rating)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.params.id, author, rating, content]
  );
  res.status(201).json(rows[0]);
});

export default router;
```

> Chú ý: INSERT dùng parameterized (không inject được ở đây) — **lỗ hổng F02 nằm ở phía RENDER**,
> không phải lưu trữ. Điểm này giải thích được khi phỏng vấn: "stored XSS là ở output encoding,
> dữ liệu độc chỉ thành XSS khi render thiếu escape".

### ✅ app/client/src/pages/ProductDetail.tsx (phần reviews)

```tsx
// ReviewList — VULN-02: deliberately renders raw HTML to support "rich text/emoji" reviews
// See tasks/05 + docs/guides/decisions.md (D8). DO NOT sanitize — stored XSS lives here.
// Payload: <img src=x onerror="alert(document.cookie)">
<div
  className="review-content"
  dangerouslySetInnerHTML={{ __html: review.content }}
/>
```

```
Page gồm:
  - Thông tin sản phẩm (ảnh, tên, giá, mô tả)
  - Form "Write a review": author (text) + rating (1-5 select) + content (textarea)
      → POST /api/products/:id/reviews → reload danh sách
  - ReviewList: render từng review — content qua dangerouslySetInnerHTML (VULN-02)
  - Comment trong code ghi rõ lý do giả vờ: "supports rich text/emoji in reviews"
```

---

✅ Task 05 completed — all files created and verified
