# Bản đồ khái niệm project

> File này chỉ giúp bạn nắm được “phần nào minh hoạ cái gì”, không giải thích code.

---

## 1. Server API

Server là nơi xử lý yêu cầu từ client và giao tiếp với cơ sở dữ liệu.

**Nó minh hoạ:**
- cách xác thực cơ bản có thể được thực hiện (hoặc thực hiện sai).
- cách dữ liệu từ request có thể ảnh hưởng tới truy vấn.
- cách cấu hình server có thể tạo ra rủi ro nếu thiếu kiểm soát.

---

## 2. Cơ sở dữ liệu

Cơ sở dữ liệu lưu dữ liệu ứng dụng.

**Nó minh hoạ:**
- ảnh hưởng khi truy vấn không tách biệt dữ liệu và lệnh.
- rủi ro khi lưu trữ thông tin nhạy cảm không an toàn.
- cách một lỗ hổng truy vấn có thể ảnh hưởng tới dữ liệu.

---

## 3. Client và giao diện

Client là nơi người dùng tương tác.

**Nó minh hoạ:**
- cách hiển thị dữ liệu có thể sinh lỗ hổng nếu không xử lý đúng.
- cách người dùng có thể tương tác với nhiều tính năng như đăng nhập, đánh giá, đổi thông tin.
- điểm chấm dứt của nhiều luồng tấn công trước khi vào server.

---

## 4. Các luồng thường thấy

### Đăng nhập

- minh hoạ xác thực cơ bản.
- minh hoạ rủi ro khi kiểm tra không rõ ràng.

### Tìm kiếm / lọc

- minh hoạ rủi ro khi input ảnh hưởng trực tiếp tới truy vấn.
- minh hoạ cách dữ liệu độc hại có thể thay đổi kết quả.

### Đánh giá / nội dung người dùng

- minh hoạ cách nội dung lưu trữ có thể tạo rủi ro nếu render không đúng.

### Profile / thông tin cá nhân

- minh hoạ cách đổi thông tin có thể bị lợi dụng nếu thiếu kiểm soát.

### Quản trị

- minh hoạch quyền truy cập và rủi ro khi quyền cao bị lạm dụng hoặc truy cập trái phép.

---

## 5. Tóm tắt

Project này được chia thành các phần để minh hoạ:

- xác thực và phiên.
- truy vấn và dữ liệu.
- hiển thị và nội dung người dùng.
- kiểm soát truy cập và quyền.

Hiểu từng phần khái niệm sẽ giúp bạn dễ hơn khi đọc toàn bộ project.
