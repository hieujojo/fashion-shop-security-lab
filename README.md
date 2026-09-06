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

Repo này có 2 nhóm tài liệu: **hiểu project** (đọc 1 lần) và **làm việc** (tra mỗi ngày).

### Nhóm 1 — Hiểu project (đọc theo thứ tự)

```
1. docs/concepts/fundamentals.md
   Cái gì: Tổng quan cách đọc tài liệu, bản đồ project, hướng dẫn bắt đầu hiểu bảo mật web.
   Khi nào đọc: ĐẦU TIÊN — biết "phần nào minh hoạ cái gì" trước khi đọc chi tiết.

2. docs/concepts/session-cookie-csrf-xss.md
   Cái gì: HTTP cookie, session, SameSite, SOP, CSRF, XSS — toàn bộ nền chung cho F02 + F03.
   Khi nào đọc: Thứ 2 — hiểu cách browser hoạt động, vì sao cookie yếu dẫn đến 2 vuln lớn.

3. docs/concepts/owasp-top10-and-4-vulns.md
   Cái gì: 4 lỗ hổng trong lab (SQLi, Stored XSS, CSRF, Misconfig), OWASP mapping, payload, cách sửa.
   Khi nào đọc: Thứ 3 — biết cụ thể từng vuln là gì, nằm ở đâu, payload nào, impact thế nào.

4. docs/concepts/testing-and-reporting.md
   Cái gì: Quy trình 7 bước kiểm thử, format report 8 mục, sai lầm phổ biến.
   Khi nào đọc: Thứ 4 — biết "làm thế nào để kiểm thử có hệ thống và viết report chuyên nghiệp".

5. docs/architecture/architecture.md
   Cái gì: 4 lớp (Browser → Network → Server → Data), trust boundaries, bản đồ attack chain.
   Khi nào đọc: Thứ 5 — hiểu luồng dữ liệu, biết "tấn công vào từ đâu, phòng thủ ở đâu".

6. docs/architecture/tech-stack.md
   Cái gì: Lý do chọn từng công nghệ + alternatives đã cân nhắc.
   Khi nào đọc: Thứ 6 — hiểu "tại sao dùng Express thay NestJS", "tại sao không Supabase"...
```

### Nhóm 2 — Làm việc (tra mỗi ngày)

```
7. docs/guides/decisions.md
   Cái gì: 13 quyết định đã chốt (D1–D13) — KHÔNG tự đổi.
   Khi nào tra: Trước khi code / trước khi hỏi "tại sao làm vậy?" → đọc đây trước.

8. docs/guides/rules.md
   Cái gì: 10 quy tắc bắt buộc + lessons learned.
   Khi nào tra: Khi nghi ngờ "mình làm đúng không?" hoặc gặp lỗi cần xử lý.

9. docs/guides/setup.md
   Cái gì: Hướng dẫn cài đặt + chạy app + troubleshooting.
   Khi nào tra: Lần đầu chạy lab, hoặc gặp lỗi "port busy", "cannot find module", "cookie không lưu".

10. docs/reference/changelog.md
    Cái gì: Bug log — ghi lại lỗi THẬT (app chạy sai so với thiết kế).
    Khi nào tra: Khi gặp bug, tra xem đã ai ghi chưa; hoặc ghi bug mới vào đây.
```

### Nhóm 3 — Tham khảo sâu (chỉ đọc khi cần)

```
11. agent/MODULES.md
    Cái gì: Bản đồ 4 vuln → nơi cài trong code, payload, file nào sửa.
    Khi nào tra: Khi cần tìm nhanh "F02 nằm ở file nào?" hoặc "payload F03 là gì?".

12. agent/CODE_STYLE.md
    Cái gì: Cách đánh dấu // VULN-F0x, quy tắc comment, API shape.
    Khi nào tra: Khi viết code Phase 1, tra trước khi commit.

13. tasks/*.md (00–12)
    Cái gì: Runbook từng bước nhỏ.
    Khi nào đọc: Làm từng task — đọc tasks/NN trước khi bắt đầu, đọc tasks/09 khi khai thác tay,
    đọc tasks/10 khi chạy ZAP.
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
