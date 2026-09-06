# Technology Stack — Lý do chọn (FashionHub)

## Tổng quan

| Layer | Công nghệ | Phiên bản | Lý do chọn |
|---|---|---|---|
| Language | TypeScript | 5.x | Type safety, IDE support, cùng ngôn ngữ 2 phía |
| Frontend | React (Vite) | React 18.x + Vite | SPA phổ biến, HMR nhanh, proxy /api tiện |
| UI | Tailwind CSS | v4 (plugin Vite) | Class-based, không Ant Design (D1) |
| Backend | Node.js + Express | Node 20 LTS · Express ^4.21 | Framework TRONG SUỐT nhất — mục tiêu là security, không phải engineering (D12) |
| Database | PostgreSQL | 16 (Docker Compose) | Trùng stack Bespokify (PostgreSQL) — kể được khi phỏng vấn |
| DB driver | `pg` | latest | Prepared statements là thứ report F01 "cách sửa" sẽ dùng |
| Session | Cookie (raw user id) | tự viết + `cookie-parser` | KHÔNG express-session — cố ý đơn giản để vuln rõ (D4) |
| Images | SVG placeholder tự render | 0 dependency | Chạy offline, không lấy ảnh thật |
| Testing | — | — | **KHÔNG có** (D12) — đã chứng minh ở distributed-cache |
| CI/CD | — | — | **KHÔNG có** (D12) |
| Security tooling | OWASP ZAP · Burp Suite · Postman · Chrome DevTools | — | Đúng 4 tool trong JD Bespokify |

---

## Chi tiết từng công nghệ

### 1. TypeScript

**Tại sao chọn:**
```
+ Type safety → ít bug runtime, đặc biệt khi JSON shape phức tạp (products 6 cột)
+ Cùng ngôn ngữ client + server → chia sẻ type (vd User, Product)
+ Trùng stack distributed-cache + Bespokify → không phải học thêm gì
```

**Alternatives đã cân nhắc:**
```
JavaScript thuần:
  - Không type → dễ typo field name (vd password vs passwrod) gây nhầm lẫn khi demo
  + Viết nhanh hơn chút — nhưng không đáng đánh đổi
```

**Kết luận:** TypeScript — giữ thói quen đã có, không thêm chi phí.

---

### 2. React + Vite (không dùng Next.js)

**Tại sao chọn:**
```
+ Vite proxy /api → :3000: browser chỉ gọi 1 origin (5173)
  → cookie session luôn được gửi, không vướng CORS (D7)
+ HMR nhanh → sửa UI demo nhanh
+ KHÔNG Next.js: server-side rendering sẽ làm rối câu chuyện "cookie session"
  và thêm lớp chuyển tiếp không cần thiết giữa client và API
```

**Alternatives đã cân nhắc:**
```
Next.js:
  - Server components/API routes chồng lớp lên Express → khó giải thích "request
    đi từ browser qua Express tới DB" khi phỏng vấn
  - Thêm khái niệm (SSR/CSR, route handlers) không phục vụ mục đích security lab
```

**Kết luận:** Vite SPA thuần — luồng request/response trong suốt nhất để demo.

---

### 3. Express (KHÔNG NestJS) — quyết định quan trọng nhất

**Tại sao chọn:**
```
+ Lỗ hổng nằm NGAY trong code mình viết (route handler nối chuỗi SQL, set cookie...)
  → demo + giải thích dễ: "đây là dòng code gây SQLi"
+ Không lớp Guard/Pipe/Interceptor nào VÔ TÌNH chặn payload:
  NestJS validation pipe có thể chặn ký tự ' trong SQLi → tốn cả buổi "vô hiệu hoá
  framework" thay vì học khai thác
+ Không boilerplate — app chỉ 6 pages, ~8 route handlers
```

**Alternatives đã cân nhắc:**
```
NestJS:
  + Trông "enterprise" hơn (team Nhật hay dùng)
  - Nặng so với quy mô lab; DI/modules/guards che mất cơ chế vuln
  - Project này bị chấm bởi: vuln có thật · reports · khả năng giải thích —
    framework gần như vô hình trước 3 tiêu chí đó

Fastify:
  + Nhanh hơn Express
  - Ít quen thuộc hơn; không lợi gì cho mục đích lab
```

**Kết luận:** Express — framework càng trong suốt, thời gian dồn càng nhiều cho Phase 2–4
(khai thác + report + phỏng vấn). Nếu 2 năm nữa apply vị trí Backend thì Nest mới đáng cân nhắc.

---

### 4. PostgreSQL 16 (Docker Compose) — KHÔNG Supabase

**Tại sao chọn:**
```
+ Trùng stack production của Bespokify (PostgreSQL) → điểm chung kể khi phỏng vấn
+ Chạy local hoàn toàn: docker compose up -d → không phụ thuộc internet/account
+ SQLi demo cần SQL THẬT (ILIKE, UNION, ORDER BY) — database local cho kiểm soát
  tuyệt đối (reset data giữa các demo — tasks/09)
```

**Alternatives đã cân nhắc:**
```
Supabase:
  - Là hosted service → phụ thuộc network + account; plan cấm (KHÔNG Supabase)
  - Không reset seed nhanh được như local
SQLite:
  + Nhẹ nhất
  - Syntax khác PostgreSQL (vd ILIKE, toán tử) → bài học SQLi không chuyển được
    sang môi trường thật
```

**Kết luận:** PostgreSQL local bằng Docker — đúng stack thật, đúng syntax, tự do reset.

---

### 5. Cookie session tự viết (raw user id)

**Tại sao chọn:**
```
+ Session = String(user.id) không ký (D4) → "tự đặt session=1 là thành admin"
  → sub-finding F04 broken auth, demo 10 giây
+ Không express-session: thư viện sẽ giấu cơ chế (signed cookie, store) —
  còn tự viết thì mọi thứ nhìn thấy được trong 1 dòng res.cookie
```

**Kết luận:** `cookie-parser` đọc cookie + tự set — tối giản, vuln lộ thiên (D3–D4).

---

### 6. Cố ý KHÔNG cài (đọc kèm decisions.md)

| Package phổ biến | Vì sao KHÔNG cài | Vuln nào nhờ đó tồn tại |
|---|---|---|
| `helmet` | Không set security headers | F04-4 |
| `express-rate-limit` | Không giới hạn login | F04-2 |
| `cors` | Không cần cho CSRF form (D7) | — (tránh bịa finding) |
| sanitizer (DOMPurify…) | Không sanitize review | F02 |

> Nguyên tắc: chỉ thiếu những control CẦN THIẾT cho 4 finding. Thiếu lung tung = report
> loãng + triage mệt (xem `docs/concepts/testing-and-reporting.md`).
