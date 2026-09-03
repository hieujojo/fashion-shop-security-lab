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

## Verify checklist (functional)

```
□ Mở /products/1 → thấy 2 reviews seed (alice, daniel) render đẹp
□ Post review thường ("Very nice") → hiện ngay dưới form
□ Rating 1-5 validate (server CHECK constraint — sai rating → 500 verbose, chấp nhận được)
□ Review mới nhất nằm trên cùng
```

## Verify checklist (VULN-02 — làm NGAY, theo đúng kịch bản demo)

```
Kịch bản đầy đủ (đây là câu chuyện chính của F02 — XSS đánh cắp session admin):

□ B1: Đăng xuất hết → mở http://localhost:5173/products/1
□ B2: Post review với content:
        <img src=x onerror="alert(document.cookie)">
     author: mallory
□ B3: Trang reload → alert() BẮN RA, hiện session cookie (vd session=3)  ← XSS chạy ở browser thường
□ B4: Đăng nhập admin (admin/admin123) → mở Admin panel (task 07) → review độc cũng render ở đó
      → alert bắn lần nữa trong session ADMIN — "admin dính XSS vì mở trang có review độc"
□ B5 (chain — kể khi phỏng vấn): vì cookie KHÔNG HttpOnly + SameSite=None,
      payload thật có thể fetch cookie về server attacker → chiếm session admin.
      Trong lab: chỉ alert(document.cookie) + chụp màn hình là đủ bằng chứng.
```

---

## Changelog + Commit

```
Commit mẫu (tách 2):
  feat(reviews): add review form and list on product detail page
  vuln(reviews): render review content as raw HTML — stored XSS (deliberate — F02)
```

---

## ⚠️ Lưu ý cho task sau (06, 07)

```
- ProductDetail page KHÔNG được tự ý escape/sanitize content (React escape mặc định sẽ
  "vô tình" chặn XSS — phải dùng dangerouslySetInnerHTML ĐÚNG chỗ này, đừng quên)
- Admin panel (07) hiển thị reviews MỚI NHẤT toàn app → cũng render thô (kế thừa F02)
- React strict mode double-render không ảnh hưởng vuln — chỉ cần alert bắn 1 lần là đủ evidence
```
