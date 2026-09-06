# Ví dụ báo cáo tìm thấy truyền tải (ngắn, minh họa)

> File này không phải báo cáo thật. Nó chỉ cho thấy **cấu trúc ngắn gọn** có thể đưa vào CV hoặc repo
> khi đã có bằng chứng thực tế. Khi đã có screenshot và Postman request response, bạn thay thế
> các chỗ “chưa có bằng chứng” bằng ảnh/real data.

---

## Tìm thấy: SQL Injection ở đăng nhập

| Thành phần | Ghi chú |
|---|---|
| Nơi 영향 | `POST /api/login` |
| Parameter | request body `email` |
| Loại | SQL injection (auth bypass) |
| Mức độ | Cao / nghiêm trọng (tùy ngữ cảnh) |
| OWASP | A03:2021 / Injection |
| CWE | CWE-89 |

---

## Tại sao lại xảy ra

Hệ thống gắn trực tiếp giá trị `email` từ body request vào câu lệnh SQL. Vì vậy, nếu request chứa ký tự
đặc biệt có ý nghĩa trong SQL, câu lệnh thực tế có thể khác với ý đồ ban đầu.

Trong trường hợp này, mục tiêu là bypass bước kiểm tra password bằng cách comment phần điều kiện còn lại.

---

## Hành động kiểm chứng (sơ cấp, chưa có screenshot)

1. Gửi request đăng nhập với email chứa payload chặn phần password.
2. Quan sát response: nếu đăng nhập thành công với tài khoản admin mà không cần password đúng,
   thì điều này cho thấy câu lệnh đã bị thao túng.
3. Một cách kiểm tra khác là xem response có trả về thông tin đăng nhập admin hay không.

**Lưu ý:** bước này cần được làm trên môi trường lab do chính bạn xây dựng, không áp dụng trên hệ thống
ngoài tầm kiểm soát của bạn.

---

## Tác động tiềm năng

- Có thể đăng nhập vào tài khoản khác mà không cần password đúng.
- Nếu kèm theo việc lộ dữ liệu, có thể dẫn đến truy cập sai, rò rỉ thông tin, hoặc mất tính toàn vẹn truy cập.
- Trong môi trường thực, đây là vấn đề nghiêm trọng vì attacker có thể lợi dụng để chiếm tài khoản.

---

## Bằng chứng nên có (khi đã thực hành)

- Ảnh chụp màn hình request và response từ Postman hoặc tool tương tự.
- Nếu có thể, ghi lại payload đã dùng và response nhận được.
- Không cần chụp toàn bộ ứng dụng; chỉ cần đủ để thấy rõ “input này → response đó”.

---

## Cách giảm thiểu

Thay vì gắn trực tiếp input vào SQL, nên sử dụng parameterized query / prepared statement.

Ví dụ tư duy (không cần copy nguyên vẹn vào báo cáo nếu không muốn):

- trước: `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`
- sau: `SELECT * FROM users WHERE email = $1 AND password = $2` với parameter riêng

Cách này giúp cơ sở dữ liệu hiểu dữ liệu là dữ liệu, không phải là một phần của cấu trúc lệnh.

---

## Những điều nên tránh khi viết

- Không claim đây là lỗ hổng đã kiểm chứng nếu bạn chưa chạy thực tế.
- Không phóng đại tác động nếu không có bằng chứng tương ứng.
- Không dùng screenshot hoặc request response của hệ thống không thuộc quyền kiểm soát của bạn.
- Không viếtreport dài dòng mà không có bằng chứng cụ thể.

---

## Gợi ý ngắn để đưa vào CV

Khi đã có bằng chứng thực tế, có thể ghi ngắn gọn dạng:

- Tìm và kiểm chứng SQL injection ở endpoint đăng nhập, giải thích cơ chế bypass,
  và đề xuất cách sửa bằng parameterized query.
- Thực hành kiểm thử thủ công và기록 bằng chứng request/response.

Như vậy không cần ép phải ghi “đã tam sát gì”, chỉ cần thấy rõ bạn **hiểu và đã kiểm chứng được
trong lab**.
