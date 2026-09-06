# FashionHub — Web Security Testing Lab

> ⚠️ **CỐ Ý CHỨA LỖ HỔNG BẢO MẬT — CHỈ DÙNG CHO MỤC ĐÍCH HỌC TẬP. TUYỆT ĐỐI KHÔNG DEPLOY.**
> Toàn bộ dữ liệu là giả (100% tự tạo). Chỉ chạy ở môi trường local.

Ứng dụng thương mại điện tử thời trang (React + Node.js/Express + PostgreSQL) được dựng làm
"phòng lab" kiểm thử bảo mật web cho các lỗ hổng:

- **SQL Injection** — đăng nhập bypass + trích xuất dữ liệu bằng UNION
- **Stored XSS** — qua phần đánh giá sản phẩm (reviews)
- **CSRF** — đổi email tài khoản
- **Security Misconfiguration & Broken Auth** — mật khẩu mặc định, thiếu security headers,
  cookie không an toàn, verbose error, mật khẩu lưu plaintext, không giới hạn số lần đăng nhập

Mỗi lỗ hổng được ghi lại với **cách tái hiện, bằng chứng và cách khắc phục** (code trước/sau)
trong thư mục `findings/`.

Repo này **không phải** là penetration test thực tế, không phải hệ thống thật, và không dùng để thử nghiệm
trên bất kỳ hệ thống nào ngoài phạm vi kiểm soát của bạn.

---

## Bắt đầu nhanh

```bash
docker compose -f app/docker-compose.yml up -d
cd app && npm install
npm run db:setup
npm run dev
```

**App:** http://localhost:5173 · **API:** http://localhost:3000

**Tài khoản demo:**
- `admin@fashionhub.dev` / `admin123` (admin)
- `alice@fashionhub.dev` / `alice123` (customer)
- `mallory@fashionhub.dev` / `mallory123` (customer)

---

## 4 Findings

| ID | Lỗ hổng | Severity | OWASP |
|---|---|---|---|
| F01 | SQL Injection (auth bypass + UNION dump) | Critical | A03:2021 |
| F02 | Stored XSS (reviews → admin panel) | High | A03:2021 |
| F03 | CSRF (đổi email không token) | Medium | A01:2021 |
| F04 | Security Misconfiguration + Broken Auth | High | A05+A07:2021 |

Chi tiết: xem `findings/` (Phase 4).

---

## Công cụ

**OWASP ZAP** · **Burp Suite** · **Postman** · **Chrome DevTools**

---

## Thứ tự đọc tài liệu

Để hiểu toàn bộ project từ nền đến từng lỗ hổng:

```
1. docs/concepts/fundamentals.md
   → Tổng quan cách đọc tài liệu, bản đồ project, hướng dẫn bắt đầu hiểu bảo mật web.

2. docs/concepts/session-cookie-csrf-xss.md
   → HTTP cookie, session, SameSite, SOP, CSRF, XSS — nền chung cho F02 + F03.

3. docs/concepts/owasp-top10-and-4-vulns.md
   → 4 lỗ hổng trong lab, OWASP mapping, payload, cách sửa.

4. docs/concepts/testing-and-reporting.md
   → Quy trình 7 bước kiểm thử, cách viết report, sai lầm phổ biến.

5. docs/architecture/architecture.md + docs/architecture/tech-stack.md
   → Kiến trúc các lớp, trust boundaries, lý do chọn từng công nghệ.

6. docs/guides/decisions.md
   → Các quyết định đã chốt (KHÔNG tự đổi) — đọc trước khi code Phase 1.

7. docs/guides/rules.md
   → Quy tắc bắt buộc khi làm việc với lab.

8. tasks/*.md
   → Runbook từng bước nhỏ (00–12), đặc biệt tasks/09 (khai thác tay) + tasks/10 (ZAP).
```

---

## Cấu trúc project

```
README.md                  # File này
agent/                     # Workflow + convention (đọc agent/WORKFLOW.md trước)
tasks/                     # Kế hoạch từng bước nhỏ (00–12)
docs/
  architecture/            # Kiến trúc + tech stack
  concepts/                # Tài liệu khái niệm (đọc theo thứ tự ở trên)
  guides/                  # Quyết định + quy tắc + hướng dẫn setup
  reference/               # Changelog bug thật
app/                       # Mã nguồn (React + Express + PostgreSQL) — Phase 1
findings/                  # Báo cáo lỗ hổng — Phase 4
screenshots/               # Bằng chứng — Phase 2–3
poc/                       # File PoC (csrf-poc.html) — Phase 2
```

---

## Giấy phép

MIT — nhưng hãy nhớ: code trong repo **cố ý** chứa lỗ hổng bảo mật.
Chỉ chạy trong môi trường lab local, **không bao giờ deploy** lên production.
