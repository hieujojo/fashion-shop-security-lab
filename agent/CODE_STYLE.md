# CODE_STYLE — Code Style & Đánh dấu chỗ CỐ Ý SAI

---

## Ngôn ngữ

```
Code, comment, commit: TIẾNG ANH
Docs planning (agent/, tasks/, docs/guides): tiếng Việt
README.md → tiếng Việt (bạn chốt 2026-09-03 — xem decisions.md D11)
findings/, docs/OWASP-checklist.md, docs/tool-guide.md → TIẾNG ANH
```

---

## Quy tắc đánh dấu lỗ hổng cố ý (QUAN TRỌNG NHẤT)

Mọi chỗ cố ý chứa lỗ hổng PHẢI có comment ngay phía trên, format:

```typescript
// VULN-01a: deliberately insecure — SQL string concatenation (auth bypass)
// See tasks/03, docs/guides/decisions.md. DO NOT "fix" — this is the vulnerability.
const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
```

```tsx
// VULN-02: deliberately renders raw HTML to support "rich text/emoji" reviews
// See tasks/05. DO NOT sanitize — stored XSS lives here.
<div dangerouslySetInnerHTML={{ __html: review.content }} />
```

```
Lý do:
- AI/bạn sau này đọc code không tưởng là bug thật mà sửa mất vuln
- Report root cause dẫn được đúng file/dòng
- Trông "có chủ đích" khi reviewer đọc repo (giống distributed-cache có chủ đích)
```

---

## Code style (TypeScript)

```
✅ Naming rõ ràng: getProducts, isAdmin, normalizeEmail
✅ Function ≤ 100 dòng, làm đúng 1 việc
✅ Route handler mỏng → gọi service/query
❌ Không code chết, không console.log rải rác (trừ dev tạm — xoá trước commit)
❌ Không unused imports
```

## Comment

```
✅ Comment "tại sao" (WHY) + đánh dấu VULN (như trên)
❌ Comment "cái gì" (WHAT) hiển nhiên
```

## API shape (thống nhất)

```
✅ JSON: { "error": "message" } cho lỗi (khi KHÔNG cố ý verbose)
✅ Status code chuẩn: 200/201/400/401/403/404/500
❌ KHÔNG bật CORS middleware (quyết định D7 — xem decisions.md)
```

## Frontend (React)

```
✅ Functional components + hooks
✅ fetch wrapper: app/client/src/api.ts
❌ KHÔNG dùng thư viện UI (chỉ Tailwind)
✅ Route: react-router-dom (pages: Home, Products, ProductDetail, Login, Profile, Admin)
```

---

## File cấu trúc tham chiếu

```
app/server/src/
  index.ts          — express app + middleware + mount routes
  db.ts             — pg Pool
  middleware.ts     — auth middleware (đọc cookie session)
  routes/
    auth.ts         — POST /api/login, /api/logout      (VULN-01a, F04-2)
    products.ts     — GET /api/products, /api/products/:id  (VULN-01b)
    reviews.ts      — POST /api/products/:id/reviews     (lưu content thô → F02)
    profile.ts      — GET /api/profile, POST /api/profile/email  (F03)
    admin.ts        — GET /api/admin/users|products|reviews  (F04-1)
app/client/src/
  api.ts, App.tsx, main.tsx
  pages/ Home.tsx Products.tsx ProductDetail.tsx Login.tsx Profile.tsx Admin.tsx
  components/ ProductCard.tsx ReviewList.tsx ...
```
