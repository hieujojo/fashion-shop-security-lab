# Tasks 12: Publish — GitHub public + kiểm tra

> Phase 5 · Người làm: AI · Mục tiêu: repo public, link hoạt động, không sót file nhạy cảm.

---

## Trước khi push (rà soát)

```
□ git status sạch sẽ, chỉ còn những gì muốn public
□ KHÔNG có: .env*, node_modules/, dist/, test-report/, *.log
□ git check-ignore từng thứ nghi ngờ (vd: git check-ignore app/server/.env)
□ Quét nhanh secrets: git grep -iE "(password|secret|api[_-]?key)\s*=\s*['\"][^'\"]{6,}" 
    → kết quả CÓ là chuyện bình thường (seed credentials là data giả CỐ Ý — README ghi rõ)
    → mục đích quét: chắc chắn không có credential THẬT cá nhân
□ README đã có banner DELIBERATELY VULNERABLE + demo accounts + disclaimer
□ Không có ảnh/đường dẫn nội bộ (E:\, tên máy, email cá nhân…)
```

## Push

```
Bước 1: git init (nếu chưa) + commit theo GIT_WORKFLOW (đã commit dần từ Phase 1)
Bước 2: GitHub → New repository → tên: fashion-shop-security-lab → Public
        Mô tả: "Deliberately vulnerable fashion e-commerce app (FashionHub) — web security
        testing lab: SQLi, stored XSS, CSRF, misconfiguration. Educational only. Built with
        React + Node/Express + PostgreSQL."
        KHÔNG tick README/LICENSE (đã có sẵn trong repo)
Bước 3: git remote add origin https://github.com/<user>/fashion-shop-security-lab.git
        git push -u origin main
```

## Kiểm tra link (bắt buộc)

```
□ Mở link repo ở chế độ ẨN DANH (incognito) — xác nhận public thật sự (không cần login)
□ README render đúng (banner, bảng findings, quickstart)
□ findings/*.md + screenshots/ hiện được (click thử 2-3 ảnh)
□ csrf-poc.html + code app hiển thị
□ GitHub "Used by"/forks không quan trọng — đừng xem số liệu (rules.md rule 9)
```

## Cập nhật hồ sơ apply

```
□ Thêm link vào CV (mục projects — cạnh Distributed Cache)
□ Chuẩn bị 1 câu giới thiệu ngắn (cover message — FAQ JD nói gửi CV + links + cover message):
   "Hi, I built X (link) — a deliberately vulnerable e-commerce app where I practiced web
    security testing with OWASP ZAP, Burp Suite and Postman. I found and documented 4 OWASP
    Top 10 vulnerabilities with reproduction steps and fixes. My main project Y (link) is..."
□ Nhắc lại: KHÔNG claim pentest hệ thống thật — mọi thứ là lab local (rules.md rule 10)
```

## Checklist hoàn thành (toàn project — đối chiếu deliverable plan gốc)

```
□ App FashionHub chạy local, 4 vuln tái hiện được
□ findings/ — 4 reports + index (tiếng Anh) · README (tiếng Việt)
□ docs/OWASP-checklist.md + docs/tool-guide.md
□ csrf-poc.html
□ screenshots/ — evidence đủ (D13)
□ README: banner + quickstart + credentials + bảng findings
□ Push GitHub public, link hoạt động (đã kiểm tra incognito)
□ Tick PROGRESS.md: Phase 5 + toàn bộ tracking vuln
□ HANDOVER.md: đóng project / ghi "hoàn thành"
```

```
Commit mẫu:
  docs: add license + final README polish before public release
```
