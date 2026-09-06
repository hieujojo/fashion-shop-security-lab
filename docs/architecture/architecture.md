# Kiến trúc Tổng quan — FashionHub Security Lab

> ⚠️ **Trạng thái:** file này mô tả kiến trúc **MỤC TIÊU** đã chốt ở Phase 0 (quyết định D1–D13
> trong `docs/guides/decisions.md`). Khi code Phase 1 (tasks/01–08) xong, rà soát lại: chỗ nào
> code lệch thiết kế → cập nhật file này (không sửa tasks cũ).

## Mục đích

Trả lời 3 câu như `docs/architecture/` bên distributed-cache:

1. Hệ thống gồm những **lớp** nào, mỗi lớp chịu trách nhiệm gì?
2. **Dữ liệu chảy** ra sao từ user input tới database và ngược lại?
3. **Trust boundaries** nằm ở đâu — và chỗ nào **CỐ Ý yếu** (đó là 4 vuln)?

Khác distributed-cache một điểm: mỗi thành phần ở đây còn gắn nhãn `VULN-Fxx` — vì lỗ hổng là
"tính năng" của lab, không phải bug. Đọc kèm `agent/MODULES.md` (bản đồ chi tiết từng vuln).

## Tổng quan Hệ thống

```
┌───────────────────────────────────────────────────────────────┐
│                     Browser Layer (Client)                     │
│  React SPA — Vite dev server :5173 — http://localhost:5173    │
│  Pages: Home · Products+Search · ProductDetail · Login        │
│         Profile · Admin                                        │
│  api.ts = fetch wrapper → /api/*                              │
│  ⚠️ ProductDetail + Admin render review bằng                  │
│     dangerouslySetInnerHTML  → VULN-F02 (stored XSS)          │
└────────────────────────────┬──────────────────────────────────┘
                             │ HTTP (JSON) + cookie session
                             │ Vite proxy /api → :3000
                             │ → browser chỉ thấy 1 origin (5173)
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                     Network Layer (HTTP)                       │
│  Request/Response · Cookie session = RAW USER ID (D4)          │
│  Cookie flags CỐ Ý sai: httpOnly=false · sameSite=None ·       │
│  secure=true (D3) → VULN-F02 (JS đọc được) + VULN-F03 (CSRF)   │
└────────────────────────────┬──────────────────────────────────┘
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                     Server Layer (Express :3000)               │
│  Middleware: cookie-parser · express.json()                    │
│              express.urlencoded()  ← cần cho PoC form CSRF     │
│  KHÔNG CÓ: helmet · rate-limit · error handler gọn → VULN-F04  │
│                                                               │
│  Routes (không tách service/repository — handler query thẳng  │
│  DB, cố ý — D6):                                               │
│    auth      POST /api/login · POST /api/logout                │
│              → VULN-F01a (SQLi bypass) · F04-2 (no rate-limit) │
│    products  GET /api/products?q=&category= · GET /api/products/:id │
│              → VULN-F01b (SQLi UNION)                          │
│    reviews   GET|POST /api/products/:id/reviews                │
│              → VULN-F02 (content lưu thô, không sanitize)      │
│    profile   GET /api/profile · POST /api/profile/email        │
│              → VULN-F03 (CSRF — không token)                   │
│    admin     GET /api/admin/users|products|reviews             │
│              → F04-1 (default creds) + nơi F02 kích hoạt       │
└────────────────────────────┬──────────────────────────────────┘
                             │ SQL string NỐI CHUỖI (không         │
                             │ parameterized) → VULN-F01          │
                             ▼
┌───────────────────────────────────────────────────────────────┐
│                      Data Layer (PostgreSQL 16)                │
│  Container: fashionhub-db · DB: fashionhub (Docker Compose)    │
│  users(id, email, password PLAINTEXT, role)   → F04-6 (D5)     │
│  products(id, name, description, price_cents, category,        │
│            image_url)  — ĐÚNG 6 cột để UNION dễ đếm (D9)       │
│  reviews(id, product_id, author, rating, content THÔ) → F02    │
└───────────────────────────────────────────────────────────────┘
```

## Trust Boundaries (ranh giới tin cậy)

Đây là khái niệm cốt lõi để hiểu **vì sao** 4 vuln tấn công được — kể được khi phỏng vấn.

```
Boundary 1 — Browser ⇄ Server
  Server tin TUYỆT ĐỐI cookie: giá trị session = raw user id, không ký (D4)
  → ai đặt session=1 là thành admin (F04 broken auth)
  → cookie không HttpOnly: nếu attacker chạy được JS trong page (F02) là đọc được

Boundary 2 — Server ⇄ Database
  Query build bằng nối chuỗi, input của user đi THẲNG vào SQL (F01)
  → không có "ranh giới" nào chặn payload giữa HTTP body và câu SQL

Boundary 3 — (không tồn tại) giữa trang web A và trang web B của attacker
  Cookie SameSite=None → browser gửi cookie khi request CROSS-SITE (F03)
  → attacker page gọi được API "nhân danh" nạn nhân mà không cần biết session
```

## Component Diagram theo module

### 1. Auth (`auth.ts`)

```
Responsibility:
  → Nhận email/password từ POST /api/login
  → Verify bằng query SQL → đúng thì set cookie session
  → POST /api/logout xoá cookie

Endpoints:
  POST /api/login    { email, password }
  POST /api/logout

CỐ Ý yếu (VULN):
  - Query: WHERE email='${email}' AND password='${password}'  → F01a auth bypass
  - Không đếm số lần thử sai → F04-2 brute-force
  - Password so sánh plaintext → F04-6 (D5)
```

### 2. Products + Search (`products.ts`)

```
Responsibility:
  → GET /api/products?category=&q=  → lọc + tìm kiếm sản phẩm
  → GET /api/products/:id           → 1 sản phẩm (+ reviews từ task 05)

Endpoints:
  GET /api/products?q=<input>
  GET /api/products/:id

CỐ Ý yếu (VULN):
  - WHERE name ILIKE '%${q}%' nối chuỗi → F01b UNION exfiltration
  - SELECT đúng 6 cột (D9) để payload UNION ' UNION SELECT NULL,email,password,NULL,role,email
    FROM users-- chèn được (NULL vào cột số, email/password vào cột text)
  - Không try/catch → lỗi SQL lộ nguyên query text (F04-3, D6)
```

### 3. Reviews (`reviews.ts`)

```
Responsibility:
  → POST /api/products/:id/reviews  { author, rating, content } — KHÔNG cần đăng nhập (D8)
  → GET  /api/products/:id/reviews  → review mới nhất trước

CỐ Ý yếu (VULN):
  - content lưu THÔ vào DB, không sanitize → F02
  - Client render bằng dangerouslySetInnerHTML (lý do giả: "hỗ trợ rich text/emoji")
  - Admin panel hiển thị review mới nhất + render thô → ai mở là dính (chain F02)
```

### 4. Profile (`profile.ts`)

```
Responsibility:
  → GET  /api/profile          → thông tin user từ cookie
  → POST /api/profile/email    { newEmail }  → đổi email (state change)

CỐ Ý yếu (VULN):
  - POST /api/profile/email KHÔNG có CSRF token, chỉ dựa cookie → F03
  - Cookie sameSite=None (D3) → browser vẫn gửi khi request từ trang khác
  - express.urlencoded() bật (D7) → PoC dùng form POST thuần (simple request) không cần CORS
```

### 5. Admin (`admin.ts`)

```
Responsibility:
  → GET /api/admin/users     — email + role + created_at (KHÔNG trả password)
  → GET /api/admin/products  — kèm count reviews theo product
  → GET /api/admin/reviews   — review MỚI NHẤT toàn app (nơi F02 bắn ở admin)

CỐ Ý yếu (VULN):
  - Kiểm role='admin' bằng requireAuth đọc cookie → nhưng F01a cho phép
    đăng nhập admin không cần password; session raw id thì tự đặt được (F04)
  - Default creds admin@fashionhub.dev / admin123 → F04-1 (D10)
  - Read-only (D10) — không có CRUD, tránh phình scope
```

## Bản đồ vuln theo luồng dữ liệu (attack chains)

| Finding | Luồng dữ liệu | Bước nào cần "chặn" để fix |
|---|---|---|
| F01 SQLi | user input → nối chuỗi SQL → DB → response trả nguyên bảng users | Parameterized query (pg prepared statement) |
| F02 Stored XSS | review content → DB → render HTML thô ở browser nạn nhân | Escape khi render (React mặc định) / sanitize đầu vào |
| F03 CSRF | trang attacker → POST form cross-site → cookie tự gửi → đổi email | CSRF token / SameSite=Lax trở lên |
| F04 Misconfig | cấp cấu hình: headers, cookie flags, rate-limit, error handler, plaintext pw | helmet · cookie flags · express-rate-limit · error middleware · hash password |

> Quy tắc vàng để nhớ: **F01 + F02 là lỗi ở điểm "đầu vào → xử lý"**, **F03 là lỗi ở
> "cơ chế xác thực request"**, **F04 là lỗi ở "cấu hình hệ thống"** — 3 tầng khác nhau,
  > scanner + tay đều phải cover (xem `docs/concepts/testing-and-reporting.md`).

## Điểm yếu cố ý — tổng kết 1 bảng

| Control ĐÁNG LẼ có | Trạng thái trong lab | Cho phép vuln nào |
|---|---|---|
| Parameterized SQL | ❌ nối chuỗi | F01 |
| Sanitize/escape HTML | ❌ lưu thô + render thô | F02 |
| CSRF token + SameSite cookie | ❌ không token, SameSite=None | F03 |
| helmet (security headers) | ❌ không cài | F04-4 |
| express-rate-limit | ❌ không cài | F04-2 |
| Error handler gọn | ❌ mặc định dev mode | F04-3 |
| bcrypt/argon2 hash password | ❌ plaintext | F04-6 + tăng impact F01 |
| HttpOnly cookie | ❌ httpOnly=false | F02 (đọc cookie) + F04-5 |
