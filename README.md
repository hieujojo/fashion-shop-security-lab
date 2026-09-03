# TrendThreads — Web Security Testing Lab

> ⚠️ **CỐ Ý CHỨA LỖ HỔNG BẢO MẬT — CHỈ DÙNG CHO MỤC ĐÍCH HỌC TẬP. TUYỆT ĐỐI KHÔNG DEPLOY.**
> Repo này chứa một ứng dụng web **cố tình** cài các lỗ hổng bảo mật để luyện tập kiểm thử.
> Toàn bộ dữ liệu là giả (100% tự tạo). Chỉ chạy ở môi trường local.

Ứng dụng thương mại điện tử thời trang (React + Node.js/Express + PostgreSQL) được dựng làm
"phòng lab" kiểm thử bảo mật web cho các lỗ hổng:

- **SQL Injection** — đăng nhập bypass + trích xuất dữ liệu bằng UNION
- **Stored XSS** — qua phần đánh giá sản phẩm (reviews)
- **CSRF** — đổi email tài khoản
- **Security Misconfiguration & Broken Auth** — mật khẩu mặc định, thiếu security headers,
  cookie không an toàn, verbose error, mật khẩu lưu plaintext, không giới hạn số lần đăng nhập

Mỗi lỗ hổng được ghi lại với **cách tái hiện, bằng chứng và cách khắc phục** (code trước/sau)
trong thư mục `findings/` (đang hoàn thiện ở Phase 4).

## Trạng thái dự án

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | Lập kế hoạch chi tiết (agent/ + tasks/ + docs/) | ✅ Hoàn thành |
| 1 | Xây dựng app TrendThreads + 4 lỗ hổng cố ý | ⬜ Tiếp theo |
| 2 | Khai thác thủ công từng lỗ hổng (browser/Postman/Burp) | ⬜ |
| 3 | Quét bằng OWASP ZAP + phân loại alerts | ⬜ |
| 4 | Viết findings reports + tài liệu | ⬜ |
| 5 | Công bố repo | ⬜ |

Công cụ sử dụng: **OWASP ZAP** · **Burp Suite** · **Postman** · **Chrome DevTools**.

## Cấu trúc project

```
security-lab-plan.md  # Plan tổng quan cấp cao (mục đích apply + timeline)
agent/                # Tài liệu quy trình phát triển (đọc agent/WORKFLOW.md trước)
tasks/                # Kế hoạch từng bước nhỏ + runbook khai thác (00-12)
docs/                 # Hướng dẫn (setup, rules, decisions) + reference
app/                  # Mã nguồn (React client + Express server + PostgreSQL) — Phase 1
findings/             # Báo cáo lỗ hổng — Phase 4
screenshots/          # Bằng chứng — Phase 2-3
csrf-poc.html         # File PoC CSRF — mở bằng browser là demo được
```

## Giấy phép

MIT — nhưng hãy nhớ: code trong repo **cố ý** chứa lỗ hổng bảo mật.
Chỉ chạy trong môi trường lab local, **không bao giờ deploy** lên production.
