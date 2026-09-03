# 📋 PLAN PROJECT A — Security Testing Lab: Fashion E-commerce

> **🔗 Bản plan CHI TIẾT từng bước nhỏ (kiểu distributed-cache: agent/ + tasks/ + docs/guides):
> xem tại [`agent/`](agent/WORKFLOW.md) + [`tasks/`](tasks/00-overview.md) — đọc `agent/WORKFLOW.md` trước.
> File này là bản tóm tắt cấp cao (giữ nguyên từ lúc lập plan).
> File này chỉ là tóm tắt cấp cao (quyết định + timeline).
> Cập nhật 2026-09-03: bổ sung quyết định kỹ thuật D3 (cookie SameSite=None thay vì "thiếu SameSite" —
> vì browser mặc định Lax sẽ chặn demo CSRF) + password plaintext + session = raw user id (mở rộng finding 04).

> **Mục đích:** Dự án portfolio apply **Web Security Intern @ Bespokify Vietnam** (ZOZO Group).
> Chứng minh đúng 2 dòng JD mà CV hiện tại đang trống:
> - Hiểu biết cơ bản về XSS, SQL Injection, CSRF, authentication issues, insecure configuration
> - Đã dùng thật các tool: OWASP ZAP, Burp Suite, Postman, browser devtools
>
> Mọi thứ khác (Git, docs, CI/CD, testing, React/TS/Node…) **đã được Distributed Cache / CRM chứng minh → KHÔNG làm lại**.

---

## 1. Quyết định stack (ĐÃ CHỐT)

| Hạng mục | Quyết định | Ghi chú |
|---|---|---|
| Frontend | **React (Vite) + TypeScript + Tailwind CSS** | Tailwind v4 (plugin Vite). Storefront nhìn như shop thật |
| Backend | **Node.js + Express (TypeScript)** — REST API | JSON API, cookie session |
| Database | **PostgreSQL (local, chạy bằng Docker Compose)** — KHÔNG Supabase | Trùng stack Bespokify (PostgreSQL) |
| UI thư viện | Tailwind (không dùng Ant Design) | |
| Session/Auth | Cookie session. **Cố ý insecure**: cookie không HttpOnly, không SameSite/Secure (để XSS/CSRF có đất diễn — chính là finding 04) | |
| Tool chính | **OWASP ZAP** (spider + active + passive scan) | Burp Suite Community + Postman phụ trợ verify |
| Verification | 100% GUI (browser, Postman, Burp, ZAP). **KHÔNG bash/Linux CLI scripts** | |
| Git | **1 branch duy nhất**. Remediation = code trước/sau ngay trong report | Không CI/CD, không unit tests |
| Tên app | **FashionHub** | Fashion e-commerce — tên đơn giản, dễ demo |
| Tên repo (đề xuất) | `fashion-shop-security-lab` | GitHub, public |

**Chạy app:** `docker compose up -d` + `npm install` + `npm run db:setup` + `npm run dev` → `http://localhost:3000`

---

## 2. Cấu trúc repo

```
fashion-shop-security-lab/
├── app/
│   ├── client/                  # React (Vite) + TS + Tailwind
│   │   ├── src/
│   │   │   ├── pages/           # Home, Products, ProductDetail, Login, Profile, Admin
│   │   │   ├── components/
│   │   │   └── api.ts           # fetch wrapper
│   ├── server/                  # Node + Express (TS)
│   │   ├── src/
│   │   │   ├── routes/          # auth, products, reviews, profile, admin
│   │   │   ├── db.ts
│   │   │   └── index.ts
│   ├── sql/
│   │   ├── schema.sql           # users, products, reviews
│   │   └── seed.sql             # data tự tạo
│   ├── docker-compose.yml       # postgres:16
│   └── package.json
├── findings/
│   ├── 00-index.md              # Bảng 4 findings + severity + OWASP map
│   ├── 01-sql-injection.md
│   ├── 02-stored-xss-reviews.md
│   ├── 03-csrf-email-change.md
│   └── 04-misconfig-broken-auth.md
├── docs/
│   ├── OWASP-checklist.md       # 1 trang, dạng checkbox
│   └── tool-guide.md            # ZAP/Burp/Postman: dùng gì cho finding nào
├── poc/csrf-poc.html            # File mở bằng browser là demo được (để root sạch)
├── screenshots/                 # Evidence 4 findings + ZAP alerts
└── README.md                    # Banner "deliberately vulnerable" + quickstart + bảng findings
```

---

## 3. App — FashionHub (vỏ real, ruột mỏng)

**Luật:** mỗi tính năng giữ lại phải (a) làm demo trông thật, (b) chứa lỗ hổng, hoặc (c) cần cho flow dẫn tới lỗ hổng. Không có lý do → cắt.

### Pages (6, đều mỏng)
| Page | Chức năng | Vì sao có |
|---|---|---|
| Home | Grid sản phẩm nổi bật | Trông thật |
| Products + Search `?q=` | List theo category + search | **Chứa SQLi (finding 01)** |
| Product Detail | Thông tin + phần reviews | **Chứa Stored XSS (finding 02)** |
| Login | Đăng nhập bằng user seed | **Chứa SQLi bypass (finding 01)** + no rate-limit (finding 04) |
| Profile | Đổi email | **Chứa CSRF (finding 03)** |
| Admin (read-only) | List users/products/reviews | **Chứa default creds (finding 04)** + là nơi Stored XSS kích hoạt |

### KHÔNG có (cố tình)
Cart, Checkout, Orders, Register page, payment, SMTP thật, wishlist, admin CRUD, role phức tạp, i18n.

### Seed data (tự tạo 100%, không lấy từ đâu)
| Loại | Chi tiết |
|---|---|
| Users (3) | `admin@fashionhub.dev / admin123` (yếu — cố ý) · `alice@…` · `mallory@…` — README ghi sẵn credentials |
| Products (~15) | Tên/giá/mô tả tự viết: "Slim-fit Denim Jacket $89", "Cashmere Crewneck $120"… |
| Ảnh | SVG placeholder tự render (màu nền + tên sản phẩm) — chạy offline, 0 dependency |
| Reviews (~5) | Text mẫu tự viết |

---

## 4. BỐN FINDINGS — chi tiết thi công

### Finding 01 — SQL Injection (Critical) · OWASP A03:2021 / CWE-89
**2 entry point:**
- `POST /login` — **auth bypass**: `email=admin@fashionhub.dev'--` + password bất kỳ → query thành `WHERE email='admin@…'--' AND password='…'` → đăng nhập admin
- `GET /api/products?q=` — **UNION data exfiltration**: `q=' UNION SELECT id, email, password, role FROM users--` (đếm đúng số cột) → dump bảng users

**Code lỗi:** nối chuỗi SQL trực tiếp (không dùng parameterized query) ở cả login lẫn search.
**Cách sửa:** `pg` prepared statements / parameterized queries.
**Phát hiện:** OWASP ZAP active scan báo alert → verify tay bằng Postman (gửi payload, xem response).

### Finding 02 — Stored XSS (Medium-High) · OWASP A03:2021 / CWE-79
- Vị trí: `POST /api/products/:id/reviews` + render review bằng `dangerouslySetInnerHTML` (lý do trong code: "hỗ trợ rich text/emoji")
- Payload: `<img src=x onerror="alert(document.cookie)">` → ai mở trang sản phẩm (kể cả admin) đều dính
- **Kịch bản demo mạnh:** mallory post review độc → admin đăng nhập, mở **admin panel** (có hiển thị review mới nhất) → XSS chạy → chứng minh chiếm session admin
- **Cách sửa:** render text thuần (React escape mặc định), bỏ `dangerouslySetInnerHTML` / dùng sanitizer
- **Phát hiện:** BẰNG TAY (ZAP không tự đăng review + login được) → đây là điểm kể chuyện "scanner không đủ"

### Finding 03 — CSRF (Medium) · OWASP A01:2021 / CWE-352
- Vị trí: đổi email qua request **không có CSRF token** + cookie không SameSite
- Kịch bản: alice đang đăng nhập → mở `csrf-poc.html` (attacker page) → form/request tự động gửi `POST /api/profile/email` → email alice bị đổi → attacker dùng "forgot password" chiếm tài khoản
- **Cách sửa:** CSRF token (double-submit / SameSite=Lax+ không dùng GET cho state-change) + verify
- **Phát hiện:** Bằng tay + Burp "Generate CSRF PoC"

### Finding 04 — Security Misconfiguration + Broken Auth (High, gộp) · OWASP A05+A07
Các mục con (viết trong 1 report):
1. **Default credentials:** `admin/admin123` — admin panel không đổi mật khẩu mặc định
2. **No rate limiting / lockout** trên login → brute-force được
3. **Verbose error:** lỗi SQL trả về nguyên query + stack trace ra trình duyệt (info disclosure)
4. **Thiếu security headers:** CSP, X-Frame-Options, HSTS…
5. **Cookie thiếu flags:** session cookie không `HttpOnly`, không `Secure`, không `SameSite`
6. (Nếu có) **CORS lỏng** trên API

**Cách sửa:** header `helmet`, cookie flags, rate-limit middleware, error handler gọn, đổi creds mặc định.
**Phát hiện:** **ZAP passive scan tự ghi alerts** ("Missing security headers", "Cookie without flags", "CSP not set") → xác nhận tay → screenshot alerts làm evidence.

---

## 5. Câu chuyện OWASP ZAP (tool chính — kể được khi phỏng vấn)

```
1. ZAP Spider            → quét toàn bộ app + map endpoints
2. ZAP Active Scan       → alert SQLi (01) + header/cookie issues (04)
3. ZAP Passive Scan      → tự ghi "Missing security headers", "Cookie without flags"…
4. ZAP báo ~15-20 alerts → triage: false positive + trùng lặp → 4 findings thật
5. Stored XSS (02) + CSRF (03) → ZAP KHÔNG bắt được (cần login + post flow)
   → verify tay bằng browser + Postman + Burp
```

**Câu kết:** *"ZAP tự tìm được 2/4, còn 2 cái phải đăng nhập + đi flow thủ công — nên mình hiểu scanner không phải viên đạn bạc, verify tay mới là kỹ năng chính của security testing."*

---

## 6. Format report (8 mục — ngắn, đủ, đúng chuẩn intern)

1. Tóm tắt + Severity (Critical / High / Medium)
2. OWASP Top 10 2021 + CWE mapping
3. Endpoint + parameter bị ảnh hưởng
4. **Cách tái hiện** (click-by-click, payload chính xác, chạy được)
5. Impact — attacker làm được gì
6. Evidence — screenshot
7. Root cause — code lỗi (dẫn file/dòng)
8. **Cách sửa** — code đúng (before/after)

---

## 7. Timeline (~7-9 ngày part-time)

| Phase | Việc | Ai làm | Ngày |
|---|---|---|---|
| 1 | Code app + 4 vulns + seed, chạy được | AI khác | 2-3 |
| 2 | Bạn tự khai thác từng vuln (browser/Postman/Burp) + chụp screenshot | **Bạn** (AI hướng dẫn từng bước) | 2 |
| 3 | Chạy ZAP scan → screenshot alerts → triage ~20 → 4 | Bạn | 1 |
| 4 | AI draft 4 reports + OWASP checklist + README → bạn đọc, hiểu, sửa bằng lời của mình | Cả hai | 1-2 |
| 5 | Push GitHub + kiểm tra link | AI khác | 0.5 |

**Nguyên tắc bất di bất dịch:** không code, nhưng **tự tay khai thác + giải thích được cả 4 vuln** — vì vòng technical interview sẽ hỏi đúng những thứ này. AI làm file, bạn làm hiểu.

---

## 8. Deliverables cuối (checklist hoàn thành)

- [ ] App FashionHub chạy local (React+TS+Tailwind / Node+TS / PostgreSQL Docker), 4 vuln tái hiện được
- [ ] `findings/` — 4 reports + index
- [ ] `docs/OWASP-checklist.md` (1 trang checkbox) + `docs/tool-guide.md`
- [ ] `csrf-poc.html` — mở browser là demo được
- [ ] `screenshots/` — evidence 4 findings + ZAP alerts
- [ ] README: banner "deliberately vulnerable — DO NOT DEPLOY", quickstart, credentials, bảng findings
- [ ] Push GitHub public, link hoạt động

---

## 9. CV bullets (sẽ dùng cho Bespokify)

> **Security Testing Lab — FashionHub** *(React + Node.js/Express + PostgreSQL)*
> - Built a deliberately vulnerable fashion e-commerce web app to practice security testing
> - Identified and manually verified 4 OWASP Top 10 vulnerabilities (SQL Injection, Stored XSS, CSRF, security misconfiguration) using **OWASP ZAP, Burp Suite, and Postman** — triaged 20+ scanner alerts down to confirmed findings
> - Wrote findings reports with reproduction steps and remediation (before/after code)

---

## 10. KHÔNG LÀM (checklist chặn)

- ❌ Không fork DVWA / OWASP Juice Shop / bất kỳ lab có sẵn
- ❌ Không claim "penetration testing" trên hệ thống thật / ngoài phạm vi lab
- ❌ Không CI/CD, không unit tests, không docs PUBLIC đồ sộ (README/findings giữ gọn tiếng Anh)
- ✅ NHƯNG có bộ plan nội bộ agent/ + tasks/ chi tiết từng bước (bắt chước distributed-cache — phục vụ AI + bạn thi công, không phải docs public)
- ❌ Không bash/Linux CLI scripts (verify bằng GUI)
- ❌ Không 2 git branch, không ghi commit counts
- ❌ Không Supabase, không cart/checkout/register/payment/SMTP
- ❌ Không ghi số liệu phóng đại; severity đúng thực tế
