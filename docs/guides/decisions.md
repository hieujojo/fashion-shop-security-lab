# DECISIONS — Các quyết định đã chốt (KHÔNG tự ý đổi)

> Mọi quyết định ảnh hưởng tới việc cài lỗ hổng đều ghi ở đây kèm LÝ DO.
> AI code Phase 1: đọc file này TRƯỚC. Muốn đổi → ghi vào PROGRESS.md "Pending Changes", chờ user approve.

---

## D1. Stack (giữ nguyên từ plan gốc)

```
Frontend : React (Vite) + TypeScript + Tailwind CSS v4 (plugin Vite)
Backend  : Node.js + Express ^4.21 + TypeScript (tsx watch khi dev)
Database : PostgreSQL 16 (Docker Compose) — KHÔNG Supabase
UI       : Tailwind — KHÔNG Ant Design
```

## D2. Hai origin: app 5173 (Vite) + API 3000 (Express), Vite proxy /api → 3000

```
Lý do:
- Dev nhanh (Vite HMR), không cần build lại client mỗi lần sửa
- ZAP/Postman/Burp có thể quét thẳng API ở :3000 HOẶC qua :5173 — cả hai đều được
- Browser LUÔN mở http://localhost:5173 — KHÔNG dùng 127.0.0.1 (cookie + Secure context)
```

## D3. Cookie session — CỐ Ý insecure (quan trọng — ảnh hưởng F02 + F03)

```javascript
// server/src/index.ts (hoặc middleware)
res.cookie('session', String(user.id), {
  httpOnly: false,        // VULN: JS đọc được → stored XSS (F02) đánh cắp được
  sameSite: 'none',       // VULN: browser gửi kèm khi request cross-site → CSRF (F03)
  secure: true,           // BẮT BUỘC khi sameSite='none' — OK trên http://localhost
  maxAge: 60 * 60 * 1000,
});
```

```
LÝ DO sameSite='none' chứ KHÔNG phải "bỏ trống SameSite":
- Từ ~2020 Chrome/Firefox mặc định cookie KHÔNG có SameSite = SameSite=Lax
- Lax CHẶN request POST cross-site → csrf-poc.html sẽ KHÔNG chạy trên browser hiện đại
- Phải set tường minh SameSite=None thì CSRF demo mới hoạt động (xem tasks/06)
- Secure=true + http://localhost → Chrome/Firefox đều chấp nhận (localhost = secure context)
- Đây cũng là điểm "sâu" để kể khi phỏng vấn: hiểu cookie flags + SameSite evolution
```

## D4. Session cookie = raw user id (không ký) — thêm vào F04

```javascript
// session value là số id — không mã hoá, không ký → tự đặt session=1 là thành admin
// → sub-item F04 "broken auth: session có thể giả mạo"
// Đơn giản hoá: không cần thư viện session (express-session), chỉ cookie-parser
```

## D5. Password lưu plaintext — thêm vào F04

```sql
-- users.password lưu text thường (KHÔNG hash)
-- Lý do: SQLi dump (F01) ra password thật → impact mạnh hơn cho report
-- → sub-item F04-6 "passwords stored in plaintext"
```

## D6. Verbose error — Express dev mode, không error handler gọn

```
- KHÔNG bọc try/catch quanh query DB trong route handler
- Express dev mode tự trả stack trace + query text → F04-3 (info disclosure)
- Đồng thời giúp ZAP active scan nhận diện SQLi (thấy chữ "syntax error" trong response)
```

## D7. CORS: KHÔNG cài middleware cors

```
Lý do: CSRF dùng form POST (simple request) → KHÔNG cần CORS.
  express.urlencoded() PHẢI bật để csrf-poc.html (form) hoạt động.
Trong report F04 ghi rõ: "CORS not enabled — N/A" (honest triage, không bịa finding)
```

## D8. Review: cho phép đăng KHÔNG cần đăng nhập (như nhiều shop thật)

```
Lý do: đơn giản hoá demo stored XSS — mallory (hoặc bất kỳ ai) post review độc,
  admin chỉ cần MỞ admin panel là dính → chain XSS → session admin
Fields: author (text), rating (int 1-5), content (text — KHÔNG sanitize → F02)
```

## D9. SQLi search: SELECT products có ĐÚNG 6 cột (để UNION dễ đếm)

```sql
-- Route GET /api/products?q=  chạy:
SELECT id, name, description, price_cents, category, image_url
FROM products WHERE name ILIKE '%${q}%'
-- → UNION payload cần 6 cột:
-- q = ' UNION SELECT NULL,email,password,NULL,role,email FROM users--
-- (NULL cho cột int, email/password/role vào cột text) → xem tasks/04
```

## D10. Admin panel: read-only, không CRUD

```
GET /api/admin/users | /api/admin/products | /api/admin/reviews
Chỉ hiển thị. Cần role='admin'. Default creds admin/admin123 (F04-1).
Admin page hiển thị reviews MỚI NHẤT và render HTML thô → nơi F02 kích hoạt.
```

## D11. Ngôn ngữ tài liệu (CẬP NHẬT 2026-09-03)

```
README.md → TIẾNG VIỆT (bạn chốt — repo giới thiệu cho người Việt đọc trước)
findings/*.md, docs/OWASP-checklist.md, docs/tool-guide.md → TIẾNG ANH (giữ nguyên)
  Lý do: JD yêu cầu "ability to read English technical documents"; team ZOZO Nhật/Mỹ/NZ;
  reports tiếng Anh là bằng chứng trực tiếp cho dòng đó của JD + interview có thể đọc trực tiếp.
Docs planning (agent/, tasks/, docs/guides) → tiếng Việt (chỉ mình dùng).
Commit message → tiếng Anh (COMMIT_CONVENTION.md).
```

## D12. Không CI/CD, không unit tests, không branch "fixed"

```
Đã chứng minh ở distributed-cache. Repo này chỉ cần: app chạy + vuln exploit được + reports.
Remediation = code before/after TRONG findings reports.
```

## D13. Screenshot evidence: quy ước tên file

```
screenshots/  (commit lên repo — đều là ảnh tự tạo, không nhạy cảm)
   01a-login-sqli-bypass.png       01b-search-union-dump.png
   02a-xss-payload-posted.png      02b-admin-xss-alert-cookie.png
   02c-session-replay-admin.png    (optional)
   03a-csrf-poc-html.png           03b-email-changed-profile.png
   04a-default-creds-admin.png     04b-burp-intruder-brute.png
   04c-verbose-error.png           04d-missing-headers-devtools.png
   04e-cookie-flags-devtools.png   04f-session-forgery.png
   zap-01-spider.png               zap-02-active-scan-alerts.png
   zap-03-alert-triage.png         (thêm nếu cần)
```

---

## Bảng tóm tắt "vì sao cài kiểu này"

| Câu hỏi | Trả lời |
|---|---|
| Sao SameSite=None mà không bỏ trống? | Browser mặc định Lax → CSRF demo chết (D3) |
| Sao cookie không HttpOnly? | Để XSS đọc được cookie → chain F02 |
| Sao password plaintext? | SQLi dump ra "bằng chứng" mạnh (D5) |
| Sao không bật CORS? | Không cần cho CSRF form; tránh bịa finding (D7) |
| Sao 6 cột? | UNION payload đếm cột đúng, dễ học (D9) |
| Sao docs public tiếng Anh? | Đúng JD + team quốc tế (D11) |
