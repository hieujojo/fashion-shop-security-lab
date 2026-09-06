# Ví dụ báo cáo ngắn

> Ví dụ minh hoạ cấu trúc, không phải báo cáo thực tế.

---

## Tên lỗ hổng

Ví dụ: SQL Injection trên endpoint đăng nhập

---

## Nơi xảy ra

Ví dụ: API đăng nhập nhận địa chỉ email từ request.

---

## Cơ chế

Hệ thống gắn trực tiếp giá trị người dùng vào câu lệnh truy vấn.
Khi input chứa ký tự đặc biệt, câu lệnh có thể thay đổi ý nghĩa.

Kết quả có thể là:
- bỏ qua bước kiểm tra password.
- truy xuất dữ liệu không được phép.

---

## Cách kiểm chứng

Trong lab, bạn có thể kiểm chứng bằng cách:

1. gửi request test với input đặc biệt.
2. xem response có phản ánh việc bypass hoặc truy xuất dữ liệu không.
3. ghi lại request và response làm bằng chứng.

---

## Tác động

Nếu xảy ra trong môi trường thật, lỗ hổng này có thể:
- cho phép đăng nhập trái phép.
- dẫn đến rò rỉ thông tin.
- mở ra tấn công thêm.

---

## Cách giảm thiểu

- tách biệt dữ liệu và cấu trúc lệnh.
- sử dụng parameterization hoặc cơ chế tương đương.
- kiểm soát kỹ quy trình xác thực và xử lý lỗi.

---

## Ghi chú cho CV

Bạn không cần viết dài.
Chỉ cần thể hiện rằng:

- bạn biết lỗ hổng là gì.
- bạn biết cách kiểm chứng trong lab.
- bạn biết hướng sửa khái quát.

---

## Lưu ý

Ví dụ này chỉ dùng để hình dung cấu trúc.
Khi bạn có thực tế từ lab, hãy ghi lại đúng những gì bạn kiểm chứng được.
