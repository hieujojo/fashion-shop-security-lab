# RULES — Quy tắc bắt buộc

> Vi phạm = hỏng demo / hỏng report. Format mỗi rule: quy tắc + lý do.

---

## 1. KHÔNG "sửa" lỗ hổng cố ý

```
Code có comment // VULN-F0x → ĐÓ LÀ TÍNH NĂNG (của lab). KHÔNG sửa, KHÔNG sanitize,
KHÔNG thêm helmet/rate-limit/CSRF token vào app chính.
Muốn thể hiện "cách sửa" → viết code before/after TRONG findings/*.md (tasks/11).
```

## 2. KHÔNG deploy / KHÔNG chạy ngoài localhost

```
App chứa lỗ hổng thật + data giả. Chỉ chạy local (localhost:5173/:3000).
README public phải có banner "DELIBERATELY VULNERABLE — DO NOT DEPLOY".
```

## 3. Browser luôn dùng http://localhost:5173 (KHÔNG 127.0.0.1)

```
Cookie Secure + same-site + secure-context chỉ đúng với localhost.
Dùng 127.0.0.1 → cookie không lưu → CSRF/XSS demo chết (mất cả buổi debug).
```

## 4. Phase 2–3: bạn TỰ TAY khai thác

```
AI KHÔNG được làm thay việc bấm payload/chụp screenshot/chạy ZAP.
AI chỉ hướng dẫn + giải thích. Vì interview sẽ hỏi ĐÚNG những thao tác này.
```

## 5. Payload phải copy-nguyên-xi, không gõ lại tay

```
Payload có dấu nháy đơn, --, khoảng trắng → gõ lại tay dễ sai (vd quên space cuối).
Copy từ tasks/09 vào Postman/browser. Nghi ngờ → so từng ký tự với file.
```

## 6. Docs phải mới nhất

```
Sửa code → cập nhật tasks file (tick ✅) + PROGRESS.md + (nếu cần) decisions.md
TRƯỚC khi commit. Không để docs nói một đằng code một nẻo.
```

## 7. Commit đúng convention + ghi rõ deliberate

```
Xem agent/COMMIT_CONVENTION.md. Commit chứa vuln → bắt buộc có "deliberate"/"F0x".
```

## 8. Không thêm scope ngoài plan

```
❌ Cart/checkout/register/payment, ❌ CI/CD, ❌ unit tests, ❌ i18n,
❌ tính năng "cho oai" — nếu không phục vụ (a) demo thật (b) chứa vuln (c) dẫn tới vuln.
```

## 9. Severity + số liệu trung thực

```
Không phóng đại: ZAP báo bao nhiêu alert ghi bấy nhiêu; false positive ghi rõ.
Severity theo OWASP thực tế (F01 Critical, F02 High, F03 Medium, F04 High).
```

## 10. Không claim pentest hệ thống thật

```
Mọi thứ trong repo đều là lab local tự dựng. KHÔNG đụng tới hệ thống ngoài phạm vi.
```

---

## 🐛 Lessons Learned (điền dần khi gặp bug/vấn đề)

### L1. (trống — template)
```
📅 yyyy-mm-dd
🐛 [vấn đề]
✅ [cách xử lý]
📝 [bài học]
```

<!-- Khi gặp vấn đề thật (app chạy sai, vuln không exploit được, tool lỗi)
→ thêm entry ở đây theo template trên -->
