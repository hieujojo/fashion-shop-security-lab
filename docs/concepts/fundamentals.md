# Tổng quan & Khái niệm nền

> File này là **cửa ngõ** vào toàn bộ phần `docs/concepts/`. Đọc trước khi vào các file chuyên đề.
> Nó gộp 3 phần: tổng quan cách đọc tài liệu, bản đồ project, và hướng dẫn bắt đầu hiểu bảo mật web.

---

## 1. Cách đọc tài liệu trong repo

Thư mục `docs/concepts/` là "sách giáo khoa" của lab: đọc để hiểu **cơ chế**, không phải để làm việc.
Nắm được đây là nắm được nền của cả 4 vuln.

### Thứ tự đọc đề xuất

```
1. fundamentals.md        ← file này — tổng quan + bản đồ + khởi động
2. owasp-top10-and-4-vulns.md   — 4 lỗ hổng chính là gì, tại sao nguy hiểm
3. session-cookie-csrf-xss.md   — cookie, session, SOP, CSRF, XSS (nền cho F02+F03)
4. testing-and-reporting.md     — quy trình kiểm thử + cách viết report
```

Nếu chỉ muốn nhanh: đọc mục 2 và 3 là đủ nắm khung lớn.

### Những gì có trong `docs/concepts/`

| File | Nội dung |
|---|---|
| `fundamentals.md` | Tổng quan cách đọc, bản đồ project, khởi động người mới (file này) |
| `owasp-top10-and-4-vulns.md` | 4 lỗ hổng lab + OWASP mapping + cách sửa |
| `session-cookie-csrf-xss.md` | HTTP cookie, session, SameSite, SOP, CSRF, XSS — nền chung |
| `testing-and-reporting.md` | Quy trình 7 bước của 1 buổi kiểm thử + format report + sai lầm phổ biến |

Các file khác trong `docs/`:
- `architecture/` — kiến trúc + tech stack.
- `guides/` — quyết định đã chốt, quy tắc bắt buộc, hướng dẫn cài đặt.
- `reference/` — changelog bug thật.

### Những gì KHÔNG có trong `docs/concepts/`

- Hướng dẫn từng dòng code.
- Hướng dẫn deploy.
- Hướng dẫn tấn công thực tế.
- Hướng dẫn sửa từng dòng.

Thư mục này chỉ để **hiểu**.

---

## 2. Bản đồ khái niệm project

File này giúp bạn nắm được "phần nào minh hoạ cái gì", không giải thích code chi tiết.

### 2.1 Server API

Server xử lý yêu cầu từ client và giao tiếp với cơ sở dữ liệu.

**Nó minh hoạ:**
- xác thực cơ bản.
- cách dữ liệu từ request ảnh hưởng tới truy vấn.
- rủi ro khi cấu hình server thiếu kiểm soát.

### 2.2 Cơ sở dữ liệu

Cơ sở dữ liệu lưu dữ liệu ứng dụng.

**Nó minh hoạ:**
- ảnh hưởng khi truy vấn không tách biệt dữ liệu và lệnh.
- rủi ro khi lưu trữ thông tin nhạy cảm không an toàn.
- cách một lỗ hổng truy vấn có thể ảnh hưởng tới dữ liệu.

### 2.3 Client và giao diện

Client là nơi người dùng tương tác.

**Nó minh hoạ:**
- cách hiển thị dữ liệu có thể sinh lỗ hổng nếu không xử lý đúng.
- nhiều tính năng như đăng nhập, đánh giá, đổi thông tin.
- điểm chấm dứt của nhiều luồng tấn công trước khi vào server.

### 2.4 Các luồng thường thấy

#### Đăng nhập
- minh hoạ xác thực cơ bản.
- minh hoạ rủi ro khi kiểm tra không rõ ràng.

#### Tìm kiếm / lọc
- minh hoạ rủi ro khi input ảnh hưởng trực tiếp tới truy vấn.
- minh hoạ cách dữ liệu độc hại có thể thay đổi kết quả.

#### Đánh giá / nội dung người dùng
- minh hoạ cách nội dung lưu trữ có thể tạo rủi ro nếu render không đúng.

#### Profile / thông tin cá nhân
- minh hoạ cách đổi thông tin có thể bị lợi dụng nếu thiếu kiểm soát.

#### Quản trị
- minh hoạ quyền truy cập và rủi ro khi quyền cao bị lạm dụng hoặc truy cập trái phép.

### 2.5 Tóm tắt

Project này được chia thành các phần để minh hoạ:
- xác thực và phiên.
- truy vấn và dữ liệu.
- hiển thị và nội dung người dùng.
- kiểm soát truy cập và quyền.

Hiểu từng phần khái niệm sẽ giúp bạn dễ hơn khi đọc toàn bộ project.

---

## 3. Hướng dẫn bắt đầu hiểu bảo mật web

### 3.1 Đừng bắt đầu từ tấn công

Nhiều người đọc bảo mật ngay từ "cách tấn công", nhưng trước hết nên hiểu:
- dữ liệu là gì.
- request là gì.
- xác thực là gì.
- phiên là gì.
- kiểm soát truy cập là gì.

Nếu không hiểu những khái niệm cơ bản, bạn sẽ khó nắm được tại sao tấn công lại xảy ra.

### 3.2 Tư duy cơ bản

Bảo mật thường gặp vấn đề khi:
- hệ thống tin vào input không kiểm soát.
- hệ thống không kiểm tra đủ.
- hệ thống tin vào trạng thái không đúng.
- hệ thống phơi nhiễm dữ liệu nhạy cảm.
- hệ thống thiếu control ở điểm quan trọng.

Vì vậy, không nên chỉ nghĩ "code đẹp là an toàn".

### 3.3 SQL Injection

SQL Injection xảy ra khi input được đưa vào truy vấn và thay đổi ngữ nghĩa truy vấn.

Bạn nên hiểu:
- tại sao input không an toàn có thể biến thành lệnh.
- tại sao parameterized query giúp.
- tại sao validation đơn thuần không phải là đủ.

### 3.4 XSS

XSS xảy ra khi script hoặc nội dung độc được nhúng vào ngữ cảnh hiển thị và trình duyệt thực thi.

Bạn nên hiểu:
- tại sao render thô lại nguy hiểm.
- tại sao encoding theo ngữ cảnh cần thiết.
- tại sao CSP có thể hỗ trợ nhưng không thay thế xử lý đúng.

### 3.5 CSRF

CSRF xảy ra khi request thay đổi trạng thái được gửi trong ngữ cảnh xác thực hiện tại, nhưng không phải hành động chính thức của người dùng.

Bạn nên hiểu:
- tại sao trình duyệt tự động gửi cookie/token trong một số trường hợp.
- tại sao token chống CSRF cần thiết.
- tại sao SameSite cookie có thể hỗ trợ.

### 3.6 Session và cookie

Session và cookie thường dùng để giữ trạng thái đăng nhập.

Bạn nên hiểu:
- session yếu như thế nào.
- cookie yếu như thế nào.
- tại sao lưu raw id rủi ro.
- tại sao thiếu HttpOnly có thể gây rủi ro.
- tại sao thiếu SameSite có thể gây rủi ro CSRF.

### 3.7 Misconfiguration

Nhiều hệ thống gặp rủi ro không phải vì logic nghiệp vụ lớn, mà vì cấu hình nhỏ.

Ví dụ:
- thông tin đăng nhập mặc định yếu.
- không giới hạn thử đăng nhập.
- lộ lỗi chi tiết.
- header bảo mật thiếu.
- lưu mật khẩu kém bảo mật.

### 3.8 Cách học hiệu quả

- hiểu khái niệm trước.
- hiểu tại sao nó xảy ra.
- hiểu tại sao defense hoạt động.
- hiểu tại sao defense không hoạt động trong một số trường hợp.
- sau đó đọc project map và tasks để biết nơi minh hoạ.

### 3.9 Lời nhắc an toàn

Chỉ thực hành trong môi trường do bạn kiểm soát. Không thử nghiệm trên hệ thống không thuộc quyền của bạn. Luôn ghi rõ phạm vi khi nói về kết quả thực hành.
