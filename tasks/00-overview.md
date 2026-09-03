# Tasks Overview — Tổng quan Tasks & Dependencies

> File quản lý dependencies + thứ tự làm. Đọc trước khi chạm vào bất kỳ task nào.

---

## Dependencies (app)

### Cần cài ⬜ (tasks/01)

```
Server (app/server):
  express ^4.21          — REST API
  pg ^8                  — PostgreSQL client
  cookie-parser ^1.4     — đọc cookie session (D4: không dùng express-session)
  cors: KHÔNG cài         (D7)
  helmet: KHÔNG cài       (F04-4: cố ý thiếu security headers)
  typescript, tsx, @types/express, @types/node, @types/cookie-parser, @types/pg

Client (app/client):
  react, react-dom, react-router-dom
  vite, @vitejs/plugin-react, typescript, tailwindcss v4 + @tailwindcss/vite

Root (app/):
  concurrently            — chạy server + client cùng lúc
```

### Không cần cài ❌ (cố ý)

```
express-session   → dùng cookie tự chế (D4)
helmet            → để thiếu headers (F04-4)
cors              → không bật CORS (D7)
bcrypt/bcryptjs   → password plaintext (D5)
rate-limiter      → để brute-force được (F04-2)
jest/vitest       → không unit tests (D12)
supabase          → PostgreSQL local (D1)
```

---

## Config files sẽ tạo (tasks/01)

```
✅ app/docker-compose.yml
✅ app/package.json            (root workspace: scripts dev, db:setup)
✅ app/server/package.json
✅ app/server/tsconfig.json
✅ app/client/package.json
✅ app/client/tsconfig.json
✅ app/client/vite.config.ts   (proxy /api → http://localhost:3000)
✅ .gitignore (root)
```

---

## Module Dependency Graph

```
tasks/01 (scaffold)     TẠO: docker-compose, 3 package.json, tsconfig, vite config, index.ts tối thiểu
  └── Không phụ thuộc gì

tasks/02 (db)           TẠO: sql/schema.sql, sql/seed.sql, server/src/db.ts, scripts db:setup
  └── Cần: 01 (cấu trúc folder + pg trong deps)

tasks/03 (auth)         TẠO: routes/auth.ts, middleware.ts, pages/Login.tsx, api.ts
  └── Cần: 02 (bảng users) — VULN-01a + F04-2, F04-5 (cookie)

tasks/04 (products)     TẠO: routes/products.ts, pages/Home.tsx, Products.tsx, ProductCard
  └── Cần: 02 (bảng products) — VULN-01b (search UNION)

tasks/05 (reviews)      TẠO: routes/reviews.ts, trang ProductDetail.tsx + ReviewList
  └── Cần: 02, 04 — VULN-02 (stored XSS render thô)

tasks/06 (profile)      TẠO: routes/profile.ts, pages/Profile.tsx, poc/csrf-poc.html
  └── Cần: 03 (auth middleware) — VULN-03 (CSRF đổi email)

tasks/07 (admin)        TẠO: routes/admin.ts, pages/Admin.tsx
  └── Cần: 03 (role check), 05 (reviews render thô để XSS kích hoạt) — F04-1, F04-3

tasks/08 (polish)       SỬA: seed.sql (15 products + 5 reviews), ảnh SVG placeholder, README nội bộ
  └── Cần: 02 — KHÔNG đổi logic vuln
```

---

## Conflict Map

```
tasks/01 → 02:  KHÔNG (02 chỉ thêm file mới vào folder đã có)
tasks/02 → 03:  KHÔNG (03 đọc db.ts, không sửa)
tasks/03 → 04:  KHÔNG (04 không đụng auth)
tasks/04 → 05:  KHÔNG (05 thêm route + page mới)
tasks/05 → 06:  KHÔNG
tasks/06 → 07:  KHÔNG (07 đọc middleware.ts — chỉ đọc)
tasks/07 → 08:  NHỎ (08 sửa seed.sql — file của 02 — được phép: đây là task cuối Phase 1)
→ Trừ 08, mỗi task TẠO file mới, KHÔNG sửa file task trước
→ Nếu BẮT BUỘC sửa file cũ → ghi PROGRESS.md "Pending Changes" + chờ approve
```

---

## Checklist Phase 1 (tổng — tick khi xong từng task)

```
□ 01 App scaffold chạy: health check OK, Vite render trang trắng + proxy OK
□ 02 DB: schema + seed chạy, psql thấy 3 users / 15 products / 5 reviews
□ 03 Login OK: alice login được, cookie 'session' xuất hiện; VULN-01a exploit được
□ 04 Products/search OK: filter category, search q; VULN-01b UNION dump được users
□ 05 Reviews: post + hiển thị; VULN-02 XSS kích hoạt ở ProductDetail
□ 06 Profile: đổi email được; VULN-03 poc/csrf-poc.html đổi email khi đang login
□ 07 Admin: default creds vào được; XSS bắn alert trong admin panel (F02 chain)
□ 08 Seed đủ 15 products ảnh SVG; app "nhìn như shop thật"
```

---

## Changelog

```
2026-09-03: Tạo tasks/ folder + 13 files (00-overview + 01-12)
```
