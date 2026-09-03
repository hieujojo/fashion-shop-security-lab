# Khái niệm: HTTP, Cookie & Session

> File này + 3 file còn lại trong `docs/concepts/` là "sách giáo khoa" của lab: đọc để
> hiểu CƠ CHẾ, không phải để làm việc. Nắm được đây là nắm được nền của cả 4 vuln.
> Các ví dụ payload thật nằm ở `tasks/09` — file này chỉ giải thích khái niệm.

---

## 1. HTTP là giao thức "không nhớ" (stateless)

Mỗi request HTTP **đứng một mình**: server không tự biết request thứ 2 có phải của
cùng người với request thứ 1 không.

```
Browser:  "GET /products"           → Server: trả danh sách sản phẩm (không biết ai hỏi)
Browser:  "GET /profile"            → Server: ??? đây là ai?
```

Muốn server "nhớ" bạn (đăng nhập rồi), browser phải **tự chứng minh danh tính trong
mỗi request** — đó là lúc cookie + session ra đời.

## 2. Cookie là gì

Cookie = **mảnh dữ liệu nhỏ do SERVER gửi xuống, browser lưu lại, rồi gửi kèm tự động
trong mọi request tiếp theo** tới đúng domain + path đó.

```
Lần 1 — POST /api/login {email, password}
  Server verify đúng → response kèm header:
    Set-Cookie: session=3; HttpOnly; SameSite=Lax; Max-Age=3600

Lần 2+ — mọi request tới localhost:5173
  Browser tự thêm header (lập trình viên KHÔNG cần làm gì):
    Cookie: session=3
```

### Các thuộc tính quan trọng của cookie

| Thuộc tính | Ý nghĩa | Nếu thiếu / set sai |
|---|---|---|
| `HttpOnly` | Cấm JavaScript (`document.cookie`) đọc cookie | XSS đọc được session → F02 chain |
| `Secure` | Chỉ gửi qua HTTPS | Cookie lộ trên đường truyền (lab chạy local HTTP nên bỏ qua) |
| `SameSite` | Kiểm soát gửi cookie khi request từ **trang khác** (cross-site): `Strict` / `Lax` / `None` | `None` → CSRF được (F03) |
| `Domain` / `Path` | Cookie hợp lệ cho domain/path nào | Set rộng quá → cookie gửi tới chỗ không nên |
| `Max-Age` / `Expires` | Thời gian sống | Quên set → cookie chết khi đóng browser (hoặc sống mãi nếu set dài) |

### Bẫy lịch sử SameSite (quan trọng — hỏi phỏng vấn được)

```
Trước 2020:  cookie KHÔNG set SameSite  → mặc định cho gửi MỌI nơi (kể cả cross-site)
Từ ~2020:    Chrome/Firefox đổi mặc định → cookie KHÔNG set SameSite = SameSite=Lax

SameSite=Lax:  vẫn gửi cookie khi user BẤM link (navigation GET) tới trang đó,
               nhưng KHÔNG gửi khi request cross-site kiểu form POST / fetch / img
               → Lax đã chặn được phần lớn CSRF "tự động"
SameSite=None: gửi cookie kể cả request cross-site → CSRF cổ điển sống lại
               (bắt buộc kèm Secure, nếu không browser sẽ VỨT cookie)
```

→ Đây là lý do lab CỐ Ý set `SameSite=None` (D3): nếu "bỏ trống" thì browser mặc định
Lax và demo CSRF (F03) sẽ chết âm thầm trên browser hiện đại.

## 3. Session là gì — và FashionHub làm kiểu gì

**Session** = trạng thái "đã đăng nhập" được server lưu. Có 2 trường phái:

```
Kiểu 1 — Session server-side (vd express-session):
  Server lưu session trong RAM/DB, cookie chỉ chứa 1 ID ngẫu nhiên (sessionId)
  → attacker có cookie cũng KHÔNG tự bịa được session khác

Kiểu 2 — Token tự chứa thông tin (vd JWT):
  Cookie/token chứa luôn thông tin user, có chữ ký của server
  → server chỉ cần verify chữ ký, không cần lưu gì
```

**FashionHub cố ý làm kiểu "tệ nhất của cả hai" (D4):**

```javascript
// session value = RAW USER ID, không ngẫu nhiên, không ký
res.cookie('session', String(user.id), { httpOnly: false, sameSite: 'none', secure: true })

// server đọc cookie rồi TIN TUYỆT ĐỐI:
const me = users.find(u => u.id === Number(req.cookies.session))
```

→ Hệ quả an toàn bị phá (đều là sub-findings của F04):

```
1. Tự đặt Cookie: session=1        → thành admin (không cần đăng nhập)   [broken auth]
2. XSS đọc document.cookie         → lấy được session của nạn nhân       [F02 chain]
3. Trang khác gửi form POST        → cookie tự gửi kèm → CSRF            [F03]
```

## 4. Phân biệt nhanh (hỏi nhau khi ôn)

| Câu hỏi | Trả lời |
|---|---|
| HTTP có nhớ bạn không? | Không — stateless. Cookie/session là cách "tự chứng minh" mỗi request |
| Cookie để ở đâu? | Browser, gửi kèm tự động theo domain/path |
| `HttpOnly` chống gì? | Chống JavaScript đọc cookie — nhưng KHÔNG chống XSS nói chung (XSS vẫn tự gọi API thay user được) |
| `SameSite=Lax` có chặn hết CSRF không? | Chặn request "tự động" cross-site (POST/fetch). Không chặn user bấm link độc (GET navigation) |
| FashionHub cookie tệ ở đâu? | (1) value = raw id không ký → giả mạo được; (2) không HttpOnly → XSS đọc được; (3) SameSite=None → CSRF được |
| Session khác JWT? | Session server-side: server lưu, cookie chỉ là ID. JWT: token tự mang thông tin + chữ ký, server stateless |

## 5. Ghi nhớ cho interview

> "Trong lab tôi tự dựng, session là cookie chứa raw user id không ký — cố ý để demo 3 lỗi
> cùng lúc: giả mạo session, XSS đánh cắp cookie, và CSRF nhờ SameSite=None. Khi viết cách
> sửa tôi chỉ ra: session id ngẫu nhiên + HttpOnly + SameSite=Lax/Strict + CSRF token."
