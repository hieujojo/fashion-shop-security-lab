# Hướng dẫn bắt đầu hiểu bảo mật web — phiên bản ngắn gọn

---

## 1. Đừng bắt đầu từ tấn công

Nhiều người đọc bảo mật ngay từ “cách tấn công”, nhưng trước hết nên hiểu:

- dữ liệu là gì.
- request là gì.
- xác thực là gì.
- phiên là gì.
- kiểm soát truy cập là gì.

Nếu không hiểu được những khái niệm cơ bản, bạn sẽ khó nắm được tại sao tấn công lại xảy ra.

---

## 2. Tư duy cơ bản

Bảo mật thường gặp vấn đề khi:

- hệ thống tin vào input không kiểm soát.
- hệ thống không kiểm tra đủ.
- hệ thống tin vào trạng thái không đúng.
- hệ thống phơi nhiễm dữ liệu nhạy cảm.
- hệ thống thiếu control ở điểm quan trọng.

Vì vậy, không nên chỉ nghĩ “code đẹp là an toàn”.

---

## 3. SQL Injection

SQL Injection xảy ra khi input được đưa vào truy vấn và thay đổi ngữ nghĩa truy vấn.

Bạn nên hiểu:

- tại sao input không an toàn có thể biến thành lệnh.
- tại sao parameterized query giúp.
- tại sao validation đơn thuần không phải là đủ.

---

## 4. XSS

XSS xảy ra khi script hoặc nội dung độc được nhúng vào ngữ cảnh hiển thị và trình duyệt thực thi.

Bạn nên hiểu:

- tại sao render thô lại nguy hiểm.
- tại sao encoding theo ngữ cảnh cần thiết.
- tại sao CSP có thể hỗ trợ nhưng không thay thế xử lý đúng.

---

## 5. CSRF

CSRF xảy ra khi request thay đổi trạng thái được gửi trong ngữ cảnh xác thực hiện tại,
nhưng không phải hành động chính thức của người dùng.

Bạn nên hiểu:

- tại sao trình duyệt tự động gửi cookie/token trong một số trường hợp.
- tại sao token chống CSRF cần thiết.
- tại sao SameSite cookie có thể hỗ trợ.

---

## 6. Session và cookie

Session và cookie thường dùng để giữ trạng thái đăng nhập.

Bạn nên hiểu:

- session yếu như thế nào.
- cookie yếu như thế nào.
- tại sao lưu raw id rủi ro.
- tại sao thiếu HttpOnly có thể gây rủi ro.
- tại sao thiếu SameSite có thể gây rủi ro CSRF.

---

## 7. Misconfiguration

Nhiều hệ thống gặp rủi ro không phải vì logic nghiệp vụ lớn, mà vì cấu hình nhỏ.

Ví dụ:

- thông tin đăng nhập mặc định yếu.
- không giới hạn thử đăng nhập.
- lộ lỗi chi tiết.
- header bảo mật thiếu.
- lưu mật khẩu kém bảo mật.

---

## 8. Cách học hiệu quả

- hiểu khái niệm trước.
- hiểu tại sao nó xảy ra.
- hiểu tại sao defense hoạt động.
- hiểu tại sao defense không hoạt động trong một số trường hợp.
- sau đó đọc project map và tasks để biết nơi minh hoạ.

---

## 9. Lời nhắc an toàn

Chỉ thực hành trong môi trường do bạn kiểm soát.
Không thử nghiệm trên hệ thống không thuộc quyền của bạn.
Luôn ghi rõ phạm vi khi nói về kết quả thực hành.
