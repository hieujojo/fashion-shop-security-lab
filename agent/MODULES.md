# MODULES — Bản đồ 4 Vulnerabilities → Nơi cài trong code

> File "la bàn" cho toàn bộ project: mỗi vuln nằm ở đâu, file nào, payload gì.
> Chi tiết từng bước xem ở tasks/ tương ứng.

---

## 4 Findings (đã chốt — xem thêm docs/guides/decisions.md)

| ID | Finding | Severity | OWASP 2021 | CWE | Nơi cài | tasks/ |
|---|---|---|---|---|---|---|
| F01 | SQL Injection (2 entry point) | Critical | A03:2021 | CWE-89 | login + search | tasks/03, 04 |
| F02 | Stored XSS (reviews) | High | A03:2021 | CWE-79 | reviews render | tasks/05 |
| F03 | CSRF (đổi email) | Medium | A01:2021 | CWE-352 | profile | tasks/06 |
| F04 | Misconfig + Broken Auth (gộp 7 mục con) | High | A05+A07 | — | toàn app | tasks/03, 07 |

---

## Bản đồ chi tiết

### F01 — SQL Injection (Critical)
```
Entry point 1: POST /api/login        → auth bypass (đăng nhập admin không cần password)
  File: app/server/src/routes/auth.ts
  Lỗi: nối chuỗi email vào SQL: WHERE email = '${email}' AND password = '${password}'
  Payload: email = admin@fashionhub.dev'--   (password bất kỳ)
  Kết quả: WHERE email='admin@…'--' AND password='x'  → comment hết phần sau → login admin

Entry point 2: GET /api/products?q=   → UNION dump bảng users
  File: app/server/src/routes/products.ts
  Lỗi: nối chuỗi q vào: WHERE name ILIKE '%${q}%'  (6 cột SELECT)
  Payload: q = ' UNION SELECT NULL,email,password,NULL,role,email FROM users--
  Kết quả: trả về toàn bộ users (email + password plaintext) trong response JSON

Cách sửa (viết trong report, KHÔNG sửa trong code):
  pg parameterized query: WHERE email = $1 AND password = $2
```

### F02 — Stored XSS (High)
```
Entry point: POST /api/products/:id/reviews → render review
  File: app/server/src/routes/reviews.ts  (lưu content thô, không sanitize)
        app/client/src/pages/ProductDetail.tsx  (dangerouslySetInnerHTML — CỐ Ý)
  Lý do giả vờ trong code: "hỗ trợ rich text / emoji từ review"
  Payload: content = <img src=x onerror="alert(document.cookie)">
  Kịch bản demo: mallory đăng review độc → admin mở Admin panel
    (hiển thị review mới nhất, cũng render HTML) → XSS chạy trong session admin
  Điều kiện tiên quyết: cookie KHÔNG HttpOnly (F04-5) → document.cookie đọc được
```

### F03 — CSRF đổi email (Medium)
```
Entry point: POST /api/profile/email   (auth bằng cookie, KHÔNG có CSRF token)
  File: app/server/src/routes/profile.ts
  File: poc/csrf-poc.html — form tự submit, mở bằng browser là chạy
  Điều kiện tiên quyết: cookie SameSite=None; Secure (F04-5) → browser gửi kèm cross-site
  Kịch bản: alice đang đăng nhập → mở csrf-poc.html → email bị đổi → 
    attacker đổi password / dùng forgot-password (nếu có) → chiếm tài khoản
```

### F04 — Misconfig + Broken Auth (High — gộp 7 mục con, 1 report)
```
F04-1 Default credentials: admin@fashionhub.dev / admin123  (seed, README ghi rõ)
F04-2 No rate limit / lockout: POST /api/login không giới hạn → brute-force được (Burp Intruder)
F04-3 Verbose error: lỗi SQL trả nguyên query + stack trace ra response
       (server KHÔNG có error handler gọn — Express dev mode)
F04-4 Thiếu security headers: không CSP, X-Frame-Options, HSTS… (không dùng helmet)
F04-5 Cookie thiếu an toàn: session cookie = raw user id, KHÔNG HttpOnly, SameSite=None, Secure
       → document.cookie đọc được (F02 dùng) + giả mạo được (session = 1 → admin)
F04-6 Password lưu plaintext trong DB (không hash) → SQLi dump ra password thật
F04-7 CORS: KHÔNG bật CORS middleware → ghi "N/A — không cấu hình" trong report (honest triage)
```

---

## Dependency graph (file thay đổi giữa các task)

```
tasks/01 (scaffold)     TẠO: docker-compose.yml, package.json, tsconfig, vite config, index.ts
tasks/02 (db)           TẠO: sql/schema.sql, sql/seed.sql, db.ts, npm scripts      [cần 01]
tasks/03 (auth)         TẠO: routes/auth.ts, middleware, Login page                 [cần 02]
tasks/04 (products)     TẠO: routes/products.ts, Home/Products pages                [cần 02]
tasks/05 (reviews)      TẠO: routes/reviews.ts, ProductDetail page                  [cần 02,04]
tasks/06 (profile)      TẠO: routes/profile.ts, Profile page, poc/csrf-poc.html      [cần 03]
tasks/07 (admin)        TẠO: routes/admin.ts, Admin page (đọc F04)                  [cần 03,05]
tasks/08 (polish)       SỬA nhỏ: seed 15 products, SVG placeholder, README nội bộ   [cần 02]
→ KHÔNG task nào sửa file của task khác (trừ 08 polish cuối — được phép vì là phase cuối build)
```

---

## Câu chuyện kể khi phỏng vấn (tóm tắt)

```
1. ZAP Spider → map toàn bộ endpoints
2. ZAP Active + Passive → alert: SQLi (search) + missing headers + cookie flags (F04)
3. Triage ~15-20 alerts → false positive + trùng lặp → findings thật
4. Stored XSS (F02) + CSRF (F03) + login SQLi (F01a) → ZAP KHÔNG bắt được
   (cần login + post flow) → verify tay browser + Postman + Burp
5. Kết: "ZAP tự tìm 1-2/4; phần còn lại phải đăng nhập + đi flow tay —
   scanner không phải viên đạn bạc, verify tay mới là kỹ năng chính"
```
