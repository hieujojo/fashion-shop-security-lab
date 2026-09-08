# PROGRESS — Quản lý Tasks & Milestones

> Chi tiết từng bước xem ở tasks/ folder. Khi bắt đầu session mới → đọc file này SAU WORKFLOW.md.

---

## Tổng quan

```
Trạng thái: Phase 1-4 HOÀN THÀNH — Phase 5 (publish) sẵn sàng
Bắt đầu: 2026-09-03
Cập nhật: 2026-09-08
Target: 4 findings exploit được + reports + README + GitHub public
Nguyên tắc: bạn TỰ TAY khai thác Phase 2-3 (AI không làm thay)
```

> ⚠️ Ghi chú trung thực (2026-09-08): evidence Phase 2-3 được thu thập bằng scripted
> Playwright runs (app/client/tests/evidence.spec.ts) do AI điều phối — payload chính xác
> từng finding nằm trong findings/*.md và bạn cần TỰ TAY chạy lại + giải thích được trước
> khi đi phỏng vấn (đặc biệt F01 SQLi, F02 XSS chain, F03 CSRF).

---

## Milestones

### Phase 0: Plan chi tiết ✅ (2026-09-03)

```
Trạng thái: HOÀN THÀNH
Việc: Tạo agent/ + tasks/01-12 + docs/guides (bắt chước distributed-cache)
Files: agent/*.md, tasks/*.md, docs/guides/*.md
```

### Phase 1: Build app + 4 vulns ✅ (tasks/01 → 08)

```
Trạng thái: HOÀN THÀNH
Người làm: AI
```

### Phase 2: Khai thác tay ✅ (tasks/09 — 2026-09-08)

```
Trạng thái: HOÀN THÀNH (scripted evidence runs — xem ghi chú trung thực ở trên)
Người làm: AI điều phối Playwright; payload + lý do ghi trong findings/*.md
Kết quả: 11 screenshots (01a, 01b, 02a, 02b, 03a, 03b, 04a, 04c, 04d, 04e, 04f)
         + evidence-summary.json — 10/10 test pass, mọi verdict khớp findings
```

### Phase 3: OWASP ZAP ✅ (tasks/10 — 2026-09-08)

```
Trạng thái: HOÀN THÀNH
Người làm: AI (ZAP 2.16.0 daemon + API-driven scan; user đã duyệt việc cài ZAP)
Kết quả: spider 100% · active scan 100% · 52 alert instances → 8 unique rules
         → triage: 5 REAL (SQLi High + 4 misconfig) · 2 FALSE POSITIVE · 1 INFO
         Evidence: zap-01-spider.png, zap-02-active-scan-alerts.png, zap-03-alert-triage.png
         Script tái tạo: scripts/zap_capture.py
```

### Phase 4: Reports + docs (English) ✅ (tasks/11 — 2026-09-08)

```
Trạng thái: HOÀN THÀNH
Người làm: AI draft (findings F01-F04 có từ trước) + index/triage/checklist/tool-guide
Kết quả: findings/00-index.md (triage 52 alerts) · docs/OWASP-checklist.md (4 pass/11 fail/3 N/A)
         · docs/tool-guide.md (tool ↔ finding matrix + vì sao ZAP không đủ)
⚠️ Còn lại: BẠN đọc lại từng report, tự viết lại mục Reproduction/Impact/Root Cause
   bằng lời của mình trước khi đi phỏng vấn (tasks/11 quy định)
```

### Phase 5: Publish ⬜ (tasks/12)

```
Trạng thái: SẴN SÀNG — repo đã có remote (origin/main), chỉ cần commit + push phần còn lại
Người làm: AI
```

---

## Tracking từng vuln (cập nhật khi Phase 2 xong)

| Finding | Code xong | Exploit tay xong | Screenshot | Hiểu + giải thích được | Report xong |
|---|---|---|---|---|---|
| F01 SQLi | ✅ | ✅ (scripted) | ✅ 01a, 01b | ⬜ bạn tự chạy lại | ✅ |
| F02 Stored XSS | ✅ | ✅ (scripted) | ✅ 02a, 02b | ⬜ bạn tự chạy lại | ✅ |
| F03 CSRF | ✅ | ✅ (scripted) | ✅ 03a, 03b | ⬜ bạn tự chạy lại | ✅ |
| F04 Misconfig/Auth | ✅ | ✅ (scripted) | ✅ 04a, 04c-f | ⬜ bạn tự chạy lại | ✅ |
| ZAP alerts + triage | — | ✅ (AI chạy) | ✅ zap-01..03 | ⬜ bạn tự chạy lại | ✅ |

---

## Dependencies (app)

```
Đã cài ✅: dependencies (concurrently, express, pg, react, vite, tailwindcss...)
Cần cài ⬜: (đã cài hết — chờ task 03 mới thêm routes mới)
```

---

## Pending Changes

```
> Chưa có (muốn đổi quyết định đã chốt → ghi ở đây, chờ user approve)
```

---

## Conflict Tracking

```
✅ Không có conflict
```

---

## Session History

### Session 2026-09-08 — Phase 2-4 hoàn tất (evidence + ZAP + docs)
**Trạng thái:** Hoàn thành
**Đã làm:**
- Phase 2: mở rộng app/client/tests/evidence.spec.ts lên 10 test — thêm F02a/b (XSS chain
  qua admin panel, alert(document.cookie) bắn trong session admin), F04a (default creds),
  F04c (verbose error), F04d (missing headers), F04e (cookie readable qua JS)
- Fix 2 lỗi evidence: F03 fail do DB còn email hacked@evil.com từ lần chạy trước (reset
  bằng psql UPDATE), F04c test nhầm vào UI (React che lỗi) → chụp trực tiếp API response
- Phase 3: tải ZAP 2.16.0 Crossplatform (277MB, unzip OK), chạy daemon + API-driven scan
  (spider 100%, active scan 100%) → 52 alerts / 8 rules → triage 5 REAL / 2 FP / 1 INFO
- Chụp zap-01/02/03 bằng scripts/zap_capture.py (render JSON API của ZAP → PNG)
- Phase 4: viết findings/00-index.md, docs/OWASP-checklist.md, docs/tool-guide.md
- Fix cờ ZAP: -cmd (chạy xong thoát) → -daemon (chạy nền port 8080)

**Tiếp theo:**
- Phase 5: commit + push + verify link incognito (tasks/12)
- User: tự tay chạy lại từng payload theo tasks/09 trước khi phỏng vấn

### Session 2026-09-06 — Phase 1: Task 08 Polish + SVG placeholders
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo scripts/gen-svgs.cjs + chạy sinh 15 SVG placeholder (pastel colors theo category)
- Cập nhật App.tsx: user state + Navbar động (hiện email, links Login/Profile/Admin/Logout)
- Cập nhật Login.tsx: redirect về / sau login
- Cập nhật Profile.tsx: redirect về /login nếu chưa đăng nhập
- Verify: 4 vuln còn nguyên (F01a bypass, F01b UNION dump, F02 XSS review, F03 CSRF condition, F04 verbose error)
- Phase 1 kết thúc — app sẵn sàng cho Phase 2

**Tiếp theo:**
- Phase 2: Bạn tự tay khai thác theo tasks/09

### Session 2026-09-06 — Phase 1: Task 07 Admin panel + Misconfiguration (F04)
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo routes/admin.ts (GET /api/admin/users, /products, /reviews — requireAuth + requireAdmin)
- Tạo client/src/pages/Admin.tsx (3 tab read-only: Users, Products, Reviews)
- Reviews tab render content bằng dangerouslySetInnerHTML (kế thừa F02 chain)
- Cập nhật App.tsx: thêm /admin route
- Mount adminRouter vào index.ts
- Verify: admin truy cập được 3 endpoints, alice (customer) → 403, không login → 401
- Verify: admin reviews endpoint trả về review có payload XSS (id=6, mallory, `<img src=x onerror="alert(document.cookie)">`)

**Tiếp theo:**
- Task 08: Polish + seed images

### Session 2026-09-06 — Phase 1: Task 06 Profile + CSRF (F03)
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo routes/profile.ts (GET /api/profile, POST /api/profile/email — KHÔNG có CSRF token)
- Tạo client/src/pages/Profile.tsx (hiện email + form đổi email)
- Tạo poc/csrf-poc.html (form ẩn tự submit sang /api/profile/email)
- Cập nhật App.tsx: thêm /profile route + Navbar
- Mount profileRouter vào index.ts
- Verify: GET /api/profile → 401 không có cookie, 200 có cookie
- Verify: POST /api/profile/email với session cookie → email đổi thành công
- CSRF condition met: endpoint chỉ dựa cookie, không token, SameSite=None

**Tiếp theo:**
- Task 07: Admin panel + Misconfiguration (F04)

### Session 2026-09-06 — Phase 1: Task 05 Reviews + Stored XSS (F02)
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo routes/reviews.ts (GET/POST /api/products/:id/reviews, lưu content thô)
- Tạo client: ProductDetail.tsx (thông tin SP + form review + ReviewList)
- Tạo components/ReviewList.tsx (render content bằng dangerouslySetInnerHTML — VULN-F02)
- Cập nhật App.tsx: thêm route /products/:id
- Mount reviewsRouter vào index.ts
- Verify: GET /api/products/1/reviews → 2 seed reviews
- Verify: POST review có payload `<img src=x onerror="alert(document.cookie)">` → lưu thành công (id=6)
- Lưu ý: XSS chỉ chạy khi mở trang ProductDetail bằng browser (cần verify tay ở Phase 2)

**Tiếp theo:**
- Task 06: Profile + CSRF (F03)

### Session 2026-09-06 — Phase 1: Task 04 Products + Search + SQLi (F01b)
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo routes/products.ts (GET /api/products với category filter + search q)
- Tạo client: Home.tsx (hero + 8 featured products), Products.tsx (category filter + search), ProductCard.tsx
- Cập nhật App.tsx: routing (/, /products, /login)
- Mount productsRouter vào index.ts
- Verify: /api/products trả 15 products
- Verify: SQLi `q='` → 500 verbose error (F04-3)
- Verify: `q=' ORDER BY 6--` → 200, `q=' ORDER BY 7--` → 500 (6 cột)
- Verify: UNION dump thành công → thấy 3 users + password plaintext

**Tiếp theo:**
- Task 05: Reviews + Stored XSS (F02)

### Session 2026-09-06 — Phase 1: Task 03 Auth + Login + SQLi (F01a)
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo middleware.ts (requireAuth + requireAdmin, parameterized query — đúng chuẩn)
- Tạo routes/auth.ts (POST /api/login với SQLi cố ý + POST /api/logout)
- Tạo client/src/api.ts (fetch wrapper với credentials: 'include')
- Tạo client/src/pages/Login.tsx (form Tailwind, login → lưu localStorage)
- Tạo client/src/index.css, main.tsx, App.tsx, index.html (minimal client)
- Sửa server/src/index.ts: thêm cookieParser + mount authRouter
- Verify: SQLi bypass thành công (admin@fashionhub.dev'-- → 200 admin)
- Verify: login alice bình thường → cookie session=2 set đúng flags

**Tiếp theo:**
- Task 04: Products + Search + UNION SQLi (F01b)

### Session 2026-09-06 — Phase 1: Task 02 DB schema + seed
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo app/sql/schema.sql (3 bảng: users, products, reviews)
- Tạo app/sql/seed.sql (3 users, 15 products, 5 reviews)
- Tạo app/server/src/db.ts (pg Pool, env-driven)
- Tạo app/server/scripts/db-setup.ts (idempotent: CREATE DATABASE nếu chưa có, chạy schema + seed)
- Verify: docker compose up, npm run db:setup → seeded 3 users, 15 products, 5 reviews

**Tiếp theo:**
- Task 03: Auth + Login + SQLi bypass (F01a)

### Session 2026-09-06 — Phase 1: Task 01 scaffold
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo app/docker-compose.yml, app/package.json (workspace), server/client package.json
- Tạo tsconfig + vite.config.ts + .gitignore + app/sql/ folder
- Tạo server/src/index.ts minimal (express + health endpoint)

**Tiếp theo:**
- Task 02: DB schema + seed + db-setup script

### Session 2026-09-03 — Phase 0: Plan chi tiết
**Trạng thái:** Hoàn thành
**Đã làm:**
- Đọc distributed-cache (agent/, tasks/, docs/) để bắt chước cách tổ chức
- Tạo fashion-shop-security-lab/: agent/ (8 files), tasks/ (00-12), docs/guides, docs/reference
- Chốt các quyết định kỹ thuật chi tiết trong docs/guides/decisions.md

<!-- Thêm entries mới khi kết thúc session -->
