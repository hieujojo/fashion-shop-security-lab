# FashionHub — Web Security Testing Lab

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

## Tại sao repo này tồn tại

Đây là lab học tập để:
1. Hiểu cách các lỗ hổng web xảy ra.
2. Thực hành kiểm thử thủ công trong môi trường do chính mình xây dựng.
3. Biết cách ghi lại bằng chứng và cách sửa, chứ không chỉ liệt kê lỗ hổng.

Repo này **không phải** là penetration test thực tế, không phải hệ thống thật, và không dùng để thử nghiệm
trên bất kỳ hệ thống nào ngoài phạm vi kiểm soát của bạn.

## Hướng dẫn an toàn khi học

- Chỉ chạy app trong môi trường local.
- Không deploy hoặc public app này để người khác truy cập.
- Không thử nghiệm trên hệ thống không thuộc quyền kiểm soát của bạn.
- Nếu dùng tool như Postman, ZAP, Burp, chỉ áp dụng trong phạm vi lab.

## Trạng thái dự án

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | Lập kế hoạch chi tiết (agent/ + tasks/ + docs/) | ✅ Hoàn thành |
| 1 | Xây dựng app FashionHub + 4 lỗ hổng cố ý | ⬜ Tiếp theo |
| 2 | Khai thác thủ công từng lỗ hổng (browser/Postman/Burp) | ⬜ |
| 3 | Quét bằng OWASP ZAP + phân loại alerts | ⬜ |
| 4 | Viết findings reports + tài liệu | ⬜ |
| 5 | Công bố repo | ⬜ |

## Những gì cần thêm để có thể nộp CV

Để project này có sức nặng hơn khi nộp CV, bạn nên bổ sung ít nhất một trong nhóm sau:

- Một ứng dụng có thể chạy được và truy cập được (ít nhất cục bộ).
- Một lỗ hổng có thể tái hiện lại được.
- Một bằng chứng nhỏ: bước tái hiện + ảnh chụp màn hình.
- Một báo cáo ngắn cho thấy bạn hiểu lỗ hổng và biết cách sửa.
- Một README rõ ràng, nói rõ đây là lab có lỗ hổng cố ý nhằm mục đích học tập.

Bạn không cần hoàn thành toàn bộ nòng nai trước khi CV. Chỉ cần **có đủ một điểm đáng kể và trung thực**
để thấy bạn đã xây dựng và kiểm thử được, chứ không chỉ có kế hoạch.

## Công cụ sử dụng: **OWASP ZAP** · **Burp Suite** · **Postman** · **Chrome DevTools**.

## Cấu trúc project

```
README.md             # File này — giới thiệu project
agent/                # Tài liệu quy trình phát triển (đọc agent/WORKFLOW.md trước)
tasks/                # Kế hoạch từng bước nhỏ + runbook khai thác (00-12)
docs/                 # security-lab-plan.md + architecture/ (kiến trúc, tech-stack)
                      # + concepts/ (khái niệm security) + guides/ + reference/
app/                  # Mã nguồn (React client + Express server + PostgreSQL) — Phase 1
findings/             # Báo cáo lỗ hổng — Phase 4
screenshots/          # Bằng chứng — Phase 2-3
poc/                  # File PoC (csrf-poc.html) — tạo ở tasks/06
```

## Giấy phép

MIT — nhưng hãy nhớ: code trong repo **cố ý** chứa lỗ hổng bảo mật.
Chỉ chạy trong môi trường lab local, **không bao giờ deploy** lên production.
