# Tasks 11: Reports + Docs (tiếng Anh) + README

> Phase 4 · Người làm: AI draft → **chủ nhân đọc, hiểu, sửa bằng lời của mình** (bắt buộc).
> Mục tiêu: bộ deliverables public trông như security engineer thật viết.
> Toàn bộ nội dung public bằng TIẾNG ANH (D11).

---

## Files tạo (đều ở root repo)

```
findings/
  00-index.md
  01-sql-injection.md
  02-stored-xss-reviews.md
  03-csrf-email-change.md
  04-misconfig-broken-auth.md
docs/
  OWASP-checklist.md
  tool-guide.md
README.md
```

---

## Format 1 report (8 mục — template chung, dùng cho 01-04)

```markdown
# Finding XX — <Tên ngắn gọn> (<Severity>)

## 1. Summary
1-2 câu: lỗi gì, ở đâu, attacker làm được gì.

## 2. Classification
| Item | Value |
|---|---|
| OWASP Top 10 2021 | A0x:2021 |
| CWE | CWE-xxx |
| Severity | Critical / High / Medium |
| CVSS (optional) | (nếu muốn — tính theo CVSS 3.1, đừng phóng đại) |

## 3. Affected Endpoint(s)
| Method | Endpoint | Parameter |
|---|---|---|
| POST | /api/login | email |

## 4. Reproduction (click-by-click)
1. ...
2. Payload (code block — copy được ngay):
   ```
   <payload chính xác>
   ```
3. Kỳ vọng: ... (kết quả quan sát được)

## 5. Impact
Attacker có thể làm gì — cụ thể, không chung chung.

## 6. Evidence
Screenshot references (screenshots/01a-....png) — ảnh đã chụp ở Phase 2-3.

## 7. Root Cause
Đoạn code lỗi (trích + dẫn file), giải thích vì sao sai.
Code đúng ở chỗ khác (vd middleware dùng $1) → đối chiếu "đúng vs sai".

## 8. Remediation
### Before (code lỗi)
```typescript
// trích code thật từ server
```
### After (code đúng)
```typescript
// parameterized query / escape / token / header ...
```
Ghi chú: project cố ý giữ code lỗi để làm lab — bản After là hướng dẫn sửa cho dev.
```

> Chủ nhân: đọc từng report, tự viết lại mục 4 + 5 + 7 bằng lời của mình.
> Nếu không giải thích được 1 mục → quay lại tasks/09 làm lại phần đó. KHÔNG đi tiếp.

---

## Chi tiết từng report

### findings/01-sql-injection.md — F01 (Critical)
```
Severity: Critical · OWASP A03:2021 Injection · CWE-89
2 entry point: POST /api/login (auth bypass) + GET /api/products?q= (UNION exfiltration)
Reproduction: payload 01a + 01b từ tasks/09 (copy nguyên xi)
Impact: login admin không cần password + dump toàn bộ users (email + password plaintext)
Root cause: nối chuỗi SQL (tasks/03 auth.ts + tasks/04 products.ts) vs parameterized ở middleware
Remediation: pg $1/$2; before/after code
```

### findings/02-stored-xss-reviews.md — F02 (High)
```
Severity: High · OWASP A03:2021 (XSS thuộc Injection) · CWE-79
Vị trí: POST /api/products/:id/reviews + dangerouslySetInnerHTML ở ProductDetail + Admin
Reproduction: kịch bản mallory → admin (tasks/09 B1-B5) — KHÔNG dùng kịch bản alert ở trang public làm chính
Impact: chiếm session admin (cookie không HttpOnly) → toàn quyền admin
Root cause: render HTML thô; React escape mặc định bị vô hiệu bởi dangerouslySetInnerHTML
Remediation: render text (escape) / sanitize (DOMPurify) nếu thật sự cần rich text; + HttpOnly cookie
Điểm kể chuyện: scanner không bắt được (cần login + post flow) — xác nhận tay
```

### findings/03-csrf-email-change.md — F03 (Medium)
```
Severity: Medium · OWASP A01:2021 Broken Access Control (CSRF) · CWE-352
Vị trí: POST /api/profile/email — không token, cookie SameSite=None
Reproduction: csrf-poc.html từ origin file:// (tasks/09) — form tự submit
Impact: đổi email nạn nhân → chiếm tài khoản qua forgot-password (chain — giải thích honest: lab không có forgot-password thật, chain là kịch bản nếu có)
Root cause: state-change không token + SameSite=None + không check Origin/Referer
Remediation: CSRF token (double-submit hoặc session-bound) + SameSite=Lax/Strict + không dùng GET cho state change
```

### findings/04-misconfig-broken-auth.md — F04 (High, gộp 7 mục con)
```
Severity: High · OWASP A05:2021 Security Misconfiguration + A07:2021 Identification/Auth Failures
Các mục con (mỗi mục: reproduction + evidence + fix):
  1. Default credentials admin/admin123          (evidence 04a)
  2. No rate limiting / lockout — Burp Intruder  (evidence 04b)
  3. Verbose error — SQL query + stack trace     (evidence 04c)
  4. Missing security headers — CSP, XFO, HSTS   (evidence 04d + ZAP alerts)
  5. Insecure cookies — no HttpOnly, SameSite=None, session = raw user id (evidence 04e, 04f)
  6. Passwords stored in plaintext               (evidence 01b — SQLi dump)
  7. CORS — not enabled → N/A (honest)           
```

### findings/00-index.md
```
Bảng: | Finding | Severity | OWASP | CWE | Endpoint | Status (Verified/Remediated guidance) |
+ 1 dòng về phương pháp: ZAP + manual + triage N alerts → 4 findings (con số thật từ tasks/10)
+ 1 dòng kết: scanner 1 phần, verify tay là kỹ năng chính (đóng khung)
```

---

## docs/OWASP-checklist.md (1 trang, checkbox — tiếng Anh)

```
Mô phỏng checklist mà security engineer dùng khi review web app (đúng JD: "support documents,
checklists"). 1 bảng theo OWASP Top 10 2021, mỗi dòng:
| # | Control | Status | Note |
Checklist áp lên CHÍNH app này → ví dụ:
  A01 Broken Access Control — [ ] tested vertical privilege (admin) ...
  A03 Injection — [x] SQLi found (F01) → fixed guidance ...
Khoảng 20-30 dòng. Đây cũng là "tài liệu mẫu" cho câu "support the preparation of simple
documents, checklists" trong JD.
```

## docs/tool-guide.md (tiếng Anh — ZAP/Burp/Postman dùng cho finding nào)

```
1 bảng: | Finding | Tool chính | Cách dùng (tóm tắt) | Screenshot |
+ phần "How to verify manually" từng finding (rút gọn tasks/09)
+ phần "Why ZAP alone is not enough" (3 lý do từ tasks/10)
→ Khi phỏng vấn "bạn dùng tool gì" → chỉ vào file này kể.
```

## README.md (tiếng Anh — bộ mặt repo)

```
1. Banner to: ⚠️ DELIBERATELY VULNERABLE — EDUCATIONAL PURPOSES ONLY. DO NOT DEPLOY.
   + giải thích: data 100% synthetic, chạy local, ai clone về tự chịu trách nhiệm (ethics!)
2. What is TrendThreads: 1-2 câu + screenshot app chạy bình thường
3. Quickstart: docker compose up -d && npm install && npm run db:setup && npm run dev
4. Demo accounts (credentials bảng)
5. Vulnerabilities: bảng 4 findings + severity + link findings/*.md
6. Tooling: ZAP / Burp / Postman — trỏ docs/tool-guide.md
7. Project structure (ngắn)
8. Disclaimer + License MIT
Không badge CI/CD (không có), không thổi phồng số liệu (rules.md rule 9)
```

---

## Checklist hoàn thành Phase 4

```
□ 4 findings + index: đủ 8 mục, tiếng Anh, payload copy được, ảnh evidence đúng tên
□ Chủ nhân ĐÃ đọc + tự viết lại 4 mục (4/5/7) mỗi report — không phải bản AI nguyên si
□ OWASP-checklist.md + tool-guide.md + README.md xong (tiếng Anh)
□ Đọc lại 1 lần như người lạ: có chỗ nào "không hiểu" → sửa tới khi mạch lạc
□ Tick PROGRESS.md Phase 4
□ Ghi HANDOVER.md → Phase 5 (tasks/12)
```

```
Commit mẫu:
  docs(report): add findings 01-04 + index (SQLi, XSS, CSRF, misconfig)
  docs: add OWASP checklist, tool guide and English README
```
