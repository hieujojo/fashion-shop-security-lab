# Xác thực và phiên — khái niệm chỉ

> File này không giải thích cách code, chỉ giải thích ý nghĩa.

---

## 1. Xác thực là gì

Xác thực là quá trình hệ thốngตรวจสอบ danh tính của người truy cập.

Nhiệm vụ cơ bản nhất là:
- người dùng là ai
- người dùng có phải người được phép không

Đây là bước đầu tiên, nhưng không phải bước cuối cùng của bảo mật.

---

## 2. Phiên là gì

Phiên là cách hệ thống giữ trạng thái “đã xác thực” sau khi người dùng đăng nhập.

Có nhiều cách quản lý phiên, nhưng ý tưởng chung là:
- một khi người dùng đã xác thực, họ có một thứ để chứng minh danh tính trong các request tiếp theo.
- hệ thống cần quản lý thứ đó sao cho không bị giả mạo, đánh cắp, hoặc lạm dụng.

Phiên yếu làm tăng rủi ro nhiều loại tấn công.

---

## 3. Cookie trong xác thực

Cookie thường được dùng để lưu hoặc truyền thông tin phiên.

Cookie có thể chứa:
- session id
- token
- hoặc một giá trị khác dùng để nhận diện trạng thái đăng nhập

Cookie dễ bị ảnh hưởng nếu:
- không được bảo vệ đúng thuộc tính
- được đọc hoặc gửi trong ngữ cảnh không an toàn
- không được kiểm soát quyền truy cập

Vì vậy, cách thiết lập cookie rất quan trọng.

---

## 4. Tại sao xác thực và phiên dễ bị tấn công

Rất nhiều cuộc tấn công không cần phá vỡ logic nghiệp vụ chính.
Chúng chỉ cần lợi dụng:

- cách hệ thống lưu phiên
- cách hệ thống truyền credential
- cách trình duyệt xử lý request
- cách hệ thống kiểm tra quyền

Vì vậy, bảo mật không chỉ là “có đăng nhập”, mà còn là “quản lý phiên và quyền truy cập đúng”.

---

## 5. Những ý đáng nhớ

- xác thực khác với phân quyền.
- phiên yếu có thể dẫn đến giả mạo hoặc chiếm quyền.
- cookie là một điểm Contact phổ biến, nên cần cẩn thận attribute và cách dùng.
- attacker thường lợi dụng chính cơ chế xác thực, không chỉ tấn công code nghiệp vụ.

---

## 6. Tại sao cần hiểu khái niệm này

Nếu không hiểu xác thực và phiên, bạn khó giải thích:

- tại sao lỗ hổng này ảnh hưởng cả khi code nghiệp vụ có vẻ đúng.
- tại sao biện pháp bảo vệ không chỉ là “thêm form login”.
- tại sao attacker có thể lợi dụng một số loại tấn công mà không cần mật khẩu thật.

Hiểu khái niệm là nền để hiểu các lỗ hổng cụ thể hơn.
