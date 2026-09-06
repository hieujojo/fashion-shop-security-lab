# Tổng quan 4 lỗ hổng trong FashionHub

> File này chỉ giải thích khái niệm và ý nghĩa, không giải thích code.

---

## 1. SQL Injection

SQL Injection xảy ra khi dữ liệu do người dùng nhập được lồng vào truy vấn cơ sở dữ liệu
một cách không tách biệt giữa dữ liệu và cấu trúc lệnh.

**Cái đáng hiểu:**
- input không an toàn có thể thay đổi ý nghĩa của câu lệnh.
- có thể dẫn đến việc truy xuất dữ liệu không được phép, hoặc bỏ qua bước kiểm tra xác thực.
- đây là lỗ hổng klassik và thường gặp trong các bài kiểm thử web cơ bản.

---

## 2. Stored XSS

Stored XSS xảy ra khi nội dung độc hại được lưu lại và sau đó được hiển thị cho người khác
mà không được xử lý đúng ngữ cảnh.

**Cái đáng hiểu:**
- lỗ hổng này không chỉ ảnh hưởng người nhập, mà còn ảnh hưởng người xem.
- nó có thể chạy trong trình duyệt nạn nhân và mở ra nhiều rủi ro khác.
- giải pháp thường nằm ở cách render, encoding ngữ cảnh, và hạn chế render HTML thô.

---

## 3. CSRF

CSRF xảy ra khi một request thay đổi trạng thái được gửi trong ngữ cảnh đăng nhập hiện tại,
nhưng thực chất không phải là hành động chủ động của người dùng.

**Cái đáng hiểu:**
- trình duyệt có thể tự động gửi cookie hoặc tình trạng xác thực theo cách khiến hệ thống nhầm lẫn.
- hệ thống dễ bị lợi dụng nếu chỉ dựa vào cookie mà không có biện pháp khác.
- đây là vấn đề liên quan đến cách browser xử lý request cross-site.

---

## 4. Security Misconfiguration và Broken Auth

Nhóm này không phải một lỗ hổng đơn lẻ, mà là tập hợp nhiều điểm yếu nhỏ.
Gồm ví dụ như:

- thông tin đăng nhập mặc định dễ đoán.
- không giới hạn số lần thử đăng nhập.
- thông tin lỗi lộ quá nhiều chi tiết.
- cấu hình cookie hoặc header không an toàn.
- lưu trữ mật khẩu không bảo mật.

**Cái đáng hiểu:**
- nhiều rủi ro thực tế đến từ cấu hình và quy trình, không chỉ từ logic nghiệp vụ.
- một hệ thống có thể trông “chạy được” nhưng vẫn rất dễ tổn thương.
- 방어 tốt thường cần nhiều lớp kiểm soát, không chỉ một điểm.

---

## Tóm tắt nhanh

- SQL Injection: dữ liệu bị hiểu nhầm thành lệnh.
- Stored XSS: nội dung độc được lưu và hiển thị cho người khác.
- CSRF: request giả mạo trong ngữ cảnh đã đăng nhập.
- Misconfiguration/Broken Auth: nhiều điểm yếu nhỏ tạo ra rủi ro lớn.

Nếu bạn hiểu được 4 điểm này, bạn đã nắm được khung lớn của lab.
