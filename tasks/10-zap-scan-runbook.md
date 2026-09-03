# Tasks 10: RUNBOOK Phase 3 — OWASP ZAP (tool chính)

> **Người làm: BẠN** (AI hướng dẫn). Mục tiêu: ZAP spider + scan → screenshot alerts → triage ~15-20 alerts → nối với 4 findings.
> Thời lượng: 1 ngày.

---

## Chuẩn bị

```
□ App đang chạy (localhost:5173)
□ Cài OWASP ZAP Desktop (zaproxy.org) — dùng bản ổn định mới nhất
□ Nhớ: ZAP scan app LOCAL của mình = hợp lệ (lab). KHÔNG scan thứ không phải của mình (rules.md rule 10)
□ Screenshot sẽ lưu vào screenshots/ theo tên D13: zap-01..zap-03
```

---

## Phần A — Spider (map endpoints)

```
Bước 1: Mở ZAP → tab "Automation" hoặc dùng Quick Start → "Automated Scan"
  URL to scan: http://localhost:5173
  → ZAP tự chạy Spider (crawl toàn bộ link) + passive scan

Bước 2 (hoặc làm tay cho chắc — khuyên làm tay lần đầu):
  Tab "Sites" (trái) → chuột phải http://localhost:5173 → Attack → Spider…
  → để mặc định → Start Scan → chờ crawl xong (nhìn cây Sites mọc ra các trang:
    /, /products, /products/1..15, /login, /profile, /admin, /api/products...)

Screenshot: zap-01-spider.png  (cây Sites sau spider — thấy app được map đầy đủ)

Ghi chú kể chuyện: "Spider chỉ đi được link GET — nó KHÔNG tự login, KHÔNG tự post review.
→ Đây là giới hạn đầu tiên của scanner (dẫn vào câu chuyện verify tay)."
```

---

## Phần B — Active Scan (tấn công chủ động)

```
Bước 1: Chuột phải http://localhost:5173 → Attack → Active Scan…
Bước 2: Tab "Input Vectors" → bỏ tick "URL Path" (không cần) — giữ Query String + POST data
        Tab "Technology" → tick PostgreSQL (để ZAP dùng payload đúng dialect)
Bước 3: Start Scan → chờ (có thể 5-15 phút với app nhỏ — để chạy, đi pha cà phê)
Bước 4: Xem tab "Alerts" (dưới cùng) → đếm tổng số alerts

KỲ VỌNG (không phải chính xác 100% — số thật ghi vào report):
  - SQL Injection alert trên /api/products param q   ← nối với F01b
  - Application Error Disclosure / SQL error message ← nối với F04-3
  - (login POST /api/login có thể KHÔNG được active-scan vì ZAP không tự login được — bình thường)
  - Passive scan ghi: Missing CSP / X-Frame-Options / cookie without HttpOnly/SameSite ← F04-4, F04-5

Screenshot: zap-02-active-scan-alerts.png  (tab Alerts mở rộng, thấy danh sách + risk level)
```

---

## Phần C — Passive alerts + Cookie (không cần active scan)

```
Passive scan tự chạy khi spider/duyệt qua ZAP → các alert "low/informational":
  - "Content Security Policy (CSP) Header Not Set"        → F04-4
  - "Missing Anti-clickjacking Header" (X-Frame-Options)  → F04-4
  - "Cookie No HttpOnly Flag"                             → F04-5
  - "Cookie Without SameSite Attribute" (ZAP version cũ) / "SameSite=None" (mới) → F04-5
  → Mỗi alert: bấm vào → xem mô tả + URL + evidence → chụp 1 ảnh tổng tab Alerts là đủ
```

---

## Phần D — Triage: 15-20 alerts → 4 findings THẬT

> Đây là phần "ăn điểm" nhất — cho thấy bạn KHÔNG paste mù alerts (JD: "reviewing, analyzing, verifying").

```
Làm bảng triage trong 1 file tạm (findings/00-index.md sẽ là bản chính thức — tasks/11):

| # | Alert (ZAP) | Risk | URL | Verdict | Ghi chú |
|---|---|---|---|---|---|
| 1 | SQL Injection | High | /api/products?q= | ✅ REAL → F01b | Verify tay Postman (tasks/09) xác nhận dump users |
| 2 | SQL error message disclosure | Medium | /api/products?q= | ✅ REAL → F04-3 | Trùng vector với #1 — gộp vào report F04 |
| 3 | CSP not set | Low | tất cả | ✅ REAL → F04-4 | Xác nhận = DevTools headers |
| 4 | X-Frame-Options missing | Low | tất cả | ✅ REAL → F04-4 | Clickjacking potential |
| 5 | Cookie no HttpOnly | Low | /api/login | ✅ REAL → F04-5 | Chính là điều kiện cho F02 |
| 6 | Cookie SameSite | Low | /api/login | ✅ REAL → F04-5 | SameSite=None — điều kiện cho F03 |
| 7 | ... (thêm alerts ZAP báo thật) | | | ... | |
| 8 | (vd) Path Traversal | Info | ... | ❌ FALSE POSITIVE | Tham số số nguyên / không đọc file — ZAP đoán nhầm |
| 9 | (vd) XSS reflected ở q | ... | | ⚠️ XEM KỸ | ZAP inject vào search — nhưng React JSON API không render HTML → không exploit được → ghi rõ lý do |

Quy tắc triage:
  - Verdict ✅ REAL: verify tay ĐƯỢC (đã làm ở tasks/09) → nối finding
  - Verdict ❌ FP: giải thích VÌ SAO (1 câu) — không được bỏ qua không nói
  - Verdict ⚠️: không chắc → thử lại tay; không tái hiện được → ghi "not reproducible, noted"
Screenshot: zap-03-alert-triage.png  (bảng triage của bạn — chụp hoặc export)

KHÔNG thấy SQLi alert ở login? → Đúng vậy: ZAP không tự login → không active-scan được POST /api/login.
  Đây là lúc kể: "ZAP tìm được X/4; F01a (login), F02 (XSS), F03 (CSRF) phải login + đi flow tay — 
  scanner không phải viên đạn bạc, verify tay mới là kỹ năng chính."
```

---

## Checklist kết thúc Phase 3

```
□ zap-01-spider.png, zap-02-active-scan-alerts.png, zap-03-alert-triage.png (đủ 3)
□ Bảng triage hoàn chỉnh (số alert thật, verdict từng cái, lý do FP)
□ Kể lại được: ZAP báo gì, cái nào thật cái nào FP, cái nào ZAP KHÔNG bắt được và vì sao
□ Tick PROGRESS.md: hàng "ZAP alerts + triage"
□ Ghi HANDOVER.md → Phase 4 (tasks/11 — AI viết reports, bạn review)
```

---

## 💡 Giải thích nhanh "vì sao ZAP khó bắt F02/F03" (nói được khi phỏng vấn)

```
1. Stored XSS (F02): ZAP phải (a) biết đăng nhập, (b) tự post 1 review, (c) mở lại trang
   và kiểm tra execution. Không có auth context + form flow → mù.
   → Tôi làm tay: post payload → admin mở panel → alert bắn.
2. CSRF (F03): Bản chất là thiếu token/logic — scanner KHÔNG có khái niệm "request này
   nên có token không". Nó chỉ thấy "POST /api/profile/email không token" → không đủ để kết luận.
   → Tôi làm tay: csrf-poc.html từ origin khác → email đổi thật.
3. Login SQLi (F01a): ZAP không tự đăng nhập được → không active-scan POST /login.
   → Tôi làm tay: Postman payload '--.
→ Kết luận đóng khung: automation tìm vấn đề tầng nông; kỹ năng thật = hiểu flow + verify tay.
```
