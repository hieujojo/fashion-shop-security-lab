# Tasks 07: Admin panel + Misconfiguration (F04-1, F04-3)

> Phase 1 · Người làm: AI · Task này hoàn thiện **F04**: default creds + nơi XSS (F02) kích hoạt ở admin.

---

## Dependencies

```
Cần: tasks/03 (requireAuth + requireAdmin), tasks/05 (reviews render thô — dùng lại ở admin)
```

---

## Files tạo

### ✅ app/server/src/routes/admin.ts

```typescript
import { Router } from 'express';
import { pool } from '../db';
import { requireAuth, requireAdmin } from '../middleware';

const router = Router();
// Tất cả route admin: requireAuth + requireAdmin
// F04-1: admin vào được bằng default creds admin/admin123 (seed — KHÔNG có cơ chế đổi mk)

// GET /api/admin/users — email + role + created_at (KHÔNG trả password — tế nhị hơn dump ở search)
router.get('/admin/users', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, role, created_at FROM users ORDER BY id'
  );
  res.json(rows);
});

// GET /api/admin/products — count reviews theo product
router.get('/admin/products', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.category, p.price_cents,
            COUNT(r.id)::int AS review_count
     FROM products p LEFT JOIN reviews r ON r.product_id = p.id
     GROUP BY p.id ORDER BY p.id`
  );
  res.json(rows);
});

// GET /api/admin/reviews — review MỚI NHẤT toàn app (nơi stored XSS F02 kích hoạt ở admin)
router.get('/admin/reviews', requireAuth, requireAdmin, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT r.id, r.product_id, p.name AS product_name, r.author, r.content, r.rating, r.created_at
     FROM reviews r JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC LIMIT 20`
  );
  res.json(rows);
});

export default router;
```

### ✅ app/client/src/pages/Admin.tsx

```
UI: 3 tab (Users / Products / Reviews) — READ-ONLY, không có nút sửa/xoá
  Users:    bảng id/email/role
  Products: bảng tên/category/giá + review_count
  Reviews:  list review — content render bằng dangerouslySetInnerHTML
            (CÙNG pattern VULN-02 như ProductDetail — comment rõ)
Chỉ admin truy cập: nếu không phải admin → 403 → UI hiện "Forbidden"
```

### ✅ Sửa app/server/src/index.ts

```
Mount thêm: adminRouter, reviewsRouter, profileRouter (gộp từ task 05, 06)
Thứ tự không quan trọng (route riêng biệt)
```

---

## Verify checklist (functional)

```
□ Login admin → /admin hiện 3 tab, data đầy đủ
□ Login alice → /admin → 403 "Forbidden" (role check chạy)
□ Chưa login → /admin → 401
□ Tất cả read-only: không có input/nút sửa
```

## Verify checklist (F04 — các mục con thấy được ở task này)

```
□ F04-1: login admin/admin123 thành công NGAY LẦN ĐẦU (default creds, chưa ai đổi)
□ F04-3: mở /api/products?q=' (Postman) → 500, response chứa query text + "syntax error"
□ F02 chain: với review độc đã post ở task 05 → admin mở tab Reviews → alert(document.cookie) bắn
     (chụp screenshot: admin panel + alert hiện session cookie — evidence chính của F02)
```

---

## Changelog + Commit

```
Commit mẫu (tách 2):
  feat(admin): add read-only admin panel (users/products/reviews)
  vuln(admin): default admin credentials + verbose SQL errors (deliberate — F04)
```

---

## ⚠️ Lưu ý cho task sau (08) + Phase 2 (09)

```
- Đừng vô tình thêm helmet/rate-limit trong lúc code (F04 là tính năng, rules.md rule 1)
- Admin.tsx dùng lại pattern render thô → đừng "làm sạch" bằng cách escape
- Sau task này: CẢ 4 vuln đã nằm trong code → Phase 2 (tasks/09) bắt đầu khai thác tay
```
