# Quy trình Kiểm thử Bảo mật Web & Cách viết Report

> File này mô tả **vòng đời chuẩn của một buổi kiểm thử bảo mật** — chính là thứ JD Bespokify
> gọi là *"checking, reviewing, analyzing, and reporting the security of web systems"*.
> Lab FashionHub được thiết kế để bạn chạy đúng quy trình này (Phase 2–4), và kể lại mạch lạc
> khi phỏng vấn. Các bước bấm máy cụ thể nằm ở `tasks/09` (tay) + `tasks/10` (ZAP).

---

## 1. Sơ đồ 7 bước

```
  1. Scope & Rules       2. Recon / Map          3. Passive Scan       4. Active Scan
  (được phép test gì)    (app có những gì)       (nghe không đụng)     (chủ động tấn công)
         │                     │                       │                     │
         ▼                     ▼                       ▼                     ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ 5. Manual Verification — xác nhận bằng tay từng nghi vấn (mấu chốt nhất)      │
  │ 6. Triage — gom 20+ alerts → loại false positive/trùng → findings thật        │
  │ 7. Report + Remediation — viết báo cáo + đề xuất sửa (+ retest nếu được)      │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết từng bước

### 2.1 Scope & Rules — làm rõ "được phép làm gì"

```
Trong lab:  target = FashionHub local (của mình) → được phép MỌI thứ
Ngoài đời:  phải có văn bản cho phép (authorization) trước khi test bất kỳ hệ thống nào
Quy tắc lab (docs/guides/rules.md): chỉ test local, không deploy, không đụng hệ thống thật
```

> Điểm ghi điểm khi phỏng vấn: bạn **tự giác** phân biệt lab vs hệ thống thật — đúng đạo đức nghề (nhiều ứng viên thiếu).

### 2.2 Recon / Mapping — app có những gì

```
Công cụ:  ZAP Spider (tự bò qua link), hoặc tay: click từng trang + Chrome DevTools Network
Kết quả:  danh sách endpoints + tham số → "attack surface"
Lab:      6 pages → /api/login, /api/products?q=&category=, /api/products/:id,
           /api/products/:id/reviews, /api/profile(, /api/email), /api/admin/*
           (xem agent/MODULES.md)
```

### 2.3 Passive Scan — nghe, không đụng

```
ZAP passive scan: chỉ QUAN SÁT request/response khi bạn dùng app (hoặc spider)
  → ghi ngay các alert "nhìn là thấy": thiếu security headers, cookie thiếu flags,
    CSP không set… (chính là F04 — ZAP tìm GIÚP, không cần payload)
Vì sao làm trước active: 0 rủi ro, nhanh, bắt được cả đống misconfig
```

### 2.4 Active Scan — chủ động bắn payload

```
ZAP active scan: tự gửi hàng loạt payload (SQLi, XSS, path traversal…) vào từng tham số
  → F01 (SQLi) thường ZAP tìm được: thấy response 500 + "syntax error" là báo alert
Giới hạn của ZAP: KHÔNG tự đăng nhập + đi flow được
  → /api/login, post review (F02), đổi email (F03) NẰM NGOÀI tầm active scan
```

### 2.5 Manual Verification — bước quyết định chất lượng (lab tập trung nhất)

```
Vì sao bắt buộc: scanner báo alert ≠ vuln thật. Phải TÁI HIỆN được mới tính là finding.
Lab (tasks/09 — runbook từng click):
  F01:  Postman gửi payload → thấy response dump users  → REAL
  F02:  đăng review payload → mở bằng browser → alert() bắn → REAL
  F03:  mở csrf-poc.html → email đổi → REAL
  F04:  ZAP alerts + xác nhận tay (default creds đăng nhập được, brute-force chạy…)
```

### 2.6 Triage — từ "nhiều alert" tới "finding thật"

```
ZAP trả về ~15–20 alerts (tasks/10 có bảng mẫu). Việc của tester:
   1. Loại FALSE POSITIVE   (vd alert "SQLi" trên tham số không dùng trong query)
   2. Gộp TRÙNG             (vd 3 alert khác nhau cùng 1 gốc cookie → 1 mục F04-5)
   3. Xác nhận bằng tay     (alert → payload → response → screenshot)
   4. Gán severity đúng     (Critical/High/Medium/Low theo impact thật)
Kết quả lab: 20+ alerts → 4 findings thật (F01–F04) — bảng ở findings/00-index.md
```

> Câu chuyện kể được: **"ZAP tự tìm 2/4 (F01 + F04), còn F02 + F03 phải đăng nhập + đi flow
> thủ công mới ra → scanner không phải viên đạn bạc, verify tay mới là kỹ năng chính."**

### 2.7 Report + Remediation — sản phẩm tester giao

```
Format 8 mục (docs/security-lab-plan.md §6) — mỗi finding 1 file ở findings/:
  1. Tóm tắt + Severity    2. OWASP/CWE mapping    3. Endpoint + tham số bị ảnh hưởng
  4. Cách tái hiện (click-by-click, payload)  5. Impact    6. Evidence (screenshot)
  7. Root cause (file/dòng code)              8. Cách sửa (before/after code)
Retest (nếu được): fix theo "cách sửa" → scan lại → alerts giảm/0 → chứng minh cải thiện
```

---

## 3. Bản đồ công cụ theo bước

| Công cụ | Dùng ở bước nào | Ghi chú |
|---|---|---|
| Chrome DevTools | 2 (map), 5 (verify) | Network tab: xem request/response/cookie headers |
| ZAP Spider | 2 | Tự bò link, map endpoints |
| ZAP Passive | 3 | Bắt misconfig (F04) không cần payload |
| ZAP Active | 4 | Bắn payload → alert SQLi (F01) |
| Postman | 5 | Gửi payload tay, đọc response JSON dump users |
| Burp Suite | 2/5 | Proxy xem + sửa request; "Generate CSRF PoC"; Intruder brute-force (F04-2) |
| Browser (tay) | 5 | Flow login → post review → admin panel (F02); mở csrf-poc.html (F03) |

---

## 4. Sai lầm phổ biến của người mới (tránh — cũng là điều interview hay hỏi)

```
❌ "Scanner báo alert là xong"        → chưa verify = chưa phải finding (bước 5)
❌ Paste nguyên danh sách alert vào report → không triage → trông như không hiểu (bước 6)
❌ Không ghi cách tái hiện            → người đọc không chạy lại được = report vô dụng
❌ Bịa severity / phóng đại impact    → mất uy tín ngay vòng interview
❌ Chỉ test "có gì thấy" (những gì scanner quét) → bỏ quên flow cần đăng nhập (F02/F03)
✅ Thứ tự đúng: map → passive → active → VERIFY TAY → triage → report → (retest)
```

---

## 5. Ví dụ báo cáo ngắn (template mẫu)

> Ví dụ minh hoạ cấu trúc, không phải báo cáo thực tế.

### Tên lỗ hổng

SQL Injection trên endpoint đăng nhập

### Nơi xảy ra

API đăng nhập nhận địa chỉ email từ request.

### Cơ chế

Hệ thống gắn trực tiếp giá trị người dùng vào câu lệnh truy vấn. Khi input chứa ký tự đặc biệt, câu lệnh có thể thay đổi ý nghĩa.

Kết quả có thể là:
- bỏ qua bước kiểm tra password.
- truy xuất dữ liệu không được phép.

### Cách kiểm chứng

Trong lab, bạn có thể kiểm chứng bằng cách:
1. gửi request test với input đặc biệt.
2. xem response có phản ánh việc bypass hoặc truy xuất dữ liệu không.
3. ghi lại request và response làm bằng chứng.

### Tác động

Nếu xảy ra trong môi trường thật, lỗ hổng này có thể:
- cho phép đăng nhập trái phép.
- dẫn đến rò rỉ thông tin.
- mở ra tấn công thêm.

### Cách giảm thiểu

- tách biệt dữ liệu và cấu trúc lệnh.
- sử dụng parameterization hoặc cơ chế tương đương.
- kiểm soát kỹ quy trình xác thực và xử lý lỗi.

### Ghi chú cho CV

Bạn không cần viết dài. Chỉ cần thể hiện rằng:
- bạn biết lỗ hổng là gì.
- bạn biết cách kiểm chứng trong lab.
- bạn biết hướng sửa khái quát.

### Lưu ý

Ví dụ này chỉ dùng để hình dung cấu trúc. Khi bạn có thực tế từ lab, hãy ghi lại đúng những gì bạn kiểm chứng được.

---

## 6. Ghi nhớ cho interview

> "Tôi chạy đúng quy trình 1 engagement trên app tự dựng: ZAP spider + passive bắt misconfig,
> active scan bắt SQLi, rồi phần quan trọng nhất là verify tay — đăng nhập, post review,
> mở CSRF PoC — vì 2/4 vuln của tôi nằm sau flow cần xác thực mà scanner không tự đi được.
> Cuối cùng tôi triage 20+ alerts xuống 4 findings và viết report đủ 8 mục kèm cách sửa."
