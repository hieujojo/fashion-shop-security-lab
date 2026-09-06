# Tổng quan khái niệm — tại sao các lỗ hổng này quan trọng và nên hiểu cái gì

> File này giải thích **ý nghĩa**, không đi sâu code. Dùng để ôn lý do + hiểu đúng trọng tâm.

---

## 1. SQL Injection

SQL injection xảy ra khi input của người dùng được đưa vào câu lệnh SQL theo cách không tách biệt
giữa dữ liệu và cấu trúc lệnh.

**Tại sao nó nguy hiểm:**  
Nó có thể làm thay đổi logic truy vấn, vượt qua xác thực, hoặc dẫn đến truy cập dữ liệu không được phép.
Trong một số trường hợp, nó còn cho phép đọc hoặc sửa dữ liệu mà ứng dụng không muốn.

**Cái nên nhớ:**  
Bài học chính không chỉ là “tránh nối chuỗi”, mà là hiểu rằng nếu data không được tách biệt rõ ràng với
command/structure, thì input của người dùng có thể trở thành một phần của lệnh.

---

## 2. Stored XSS

Stored XSS xảy ra khi nội dung độc hại được lưu lại và sau đó được hiển thị cho người khác mà không được
xử lý đúng ngữ cảnh.

**Tại sao nó nguy hiểm:**  
Nó có thể chạy trong trình duyệt của người xem và làm những điều thuộc ngữ cảnh của trang web đó,
ví dụ gọi API thay cho người dùng, đọc thông tin nhạy cảm nếu chế độ cookie không an toàn, hoặc lừa người dùng.

**Cái nên nhớ:**  
Rất nhiều vấn đề XSS không chỉ nằm ở “nhận dữ liệu”, mà ở “cách hiển thị dữ liệu đó”.
Vì vậy, output handling và encoding ngữ cảnh quan trọng không kém input validation.

---

## 3. CSRF

CSRF xảy ra khi một request thay đổi trạng thái được gửi khi người dùng đã có xác thực hiện tại,
nhưng request đó thực ra đến từ một nguồn khác chứ không phải hành động chủ động của người dùng.

**Tại sao nó nguy hiểm:**  
Nếu hệ thống chỉ dựa vào cookie hoặc phiên để xác nhận request, thì người dùng có thể vô tình gửi
một hành động quan trọng mà không hề biết.

**Cái nên remembers:**  
CSRF không cần attacker biết password. Nó lợi dụng cơ chế tự động gởi credential trong trình duyệt,
dẫn đến việc hệ thống khó phân biệt request thực sự từ người dùng hay từ nguồn bên ngoài.

---

## 4. Cấu hình sai và xác thực yếu

Nhóm này bao gồm nhiều vấn đề nhỏ, ví dụ như:

- mật khẩu mặc định hoặc dễ đoán
- không giới hạn số lần thử đăng nhập
- thông tin lỗi lộ quá nhiều chi tiết
- cấu hình cookie thiếu bảo vệ
- lưu mật khẩu không an toàn

**Tại sao nó quan trọng:**  
Nhiều khi ứng dụng không bị tấn công bởi một lỗ hổng lớn, mà bởi sự kết hợp của nhiều điểm nhỏ
khiến attacker dễ tiếp cận hơn.

**Cái nên nhớ:**  
Bảo mật không chỉ là “tránh lỗi lớn” mà còn là “giảm những điểm dễ bị lợi dụng”.

---

## 5. Điều nên hiểu sâu cho phỏng vấn

Đừng chỉ nhớ tên lỗ hổng. Hãy hiểu:

- lỗ hổng đó xảy ra như thế nào về mặt nguyên lý
- tại sao nó có thể xảy ra trong thiết kế thông thường
- làm sao attacker có thể lợi dụng
- làm sao giảm thiểu
- tại sao biện pháp giảm thiểu đó lại hợp lý

Nếu bạn hiểu được “tại sao”, bạn sẽ dễ giải thích và khó bị luống 파기 when asked.

---

## 6. Lưu ý thực hành

- Chỉ thực hành trên môi trường do bạn tự xây dựng hoặc được cho phép.
- Không áp dụng kiến thức này để thử nghiệm trên hệ thống không thuộc quyền kiểm soát của bạn.
- Học cách kiểm chứng, nhưng luôn rõ ràng về phạm vi: lab, học tập, không phải penetration test thực tế.

---

## 7. Gợi ý nhỏ cho CV

Điều CV thường muốn thấy là:

- bạn biết lỗ hổng là gì
- bạn biết tại sao nó nguy hiểm
- bạn đã kiểm chứng được trong lab
- bạn biết cách giảm thiểu

Không cần viết dài, nhưng cần rõ ràng và trung thực.
