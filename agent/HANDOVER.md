# 🔄 HANDOVER — Context cho Session Mới

> Khi kết thúc session → ghi context vào đây. Khi session mới bắt đầu → đọc file này TRƯỚC TIÊN.

---

## 📋 Format khi kết thúc session

```
### Session YYYY-MM-DD — [Mô tả ngắn]
**Trạng thái:** [Đang làm dở / Hoàn thành / Blocked]
**Task hiện tại:** tasks/NN — [tên]
**Đã làm:**
- [ ] ...

**Đang làm dở:**
- [ ] ... (đã làm được gì, còn thiếu gì)

**Cần làm tiếp:**
- ...

**Vấn đề gặp phải:**
- [Mô tả + đã thử gì]

**Files đã thay đổi:**
- ...

**Lưu ý cho session sau:**
- [ví dụ: app đang chạy ở port nào, browser phải dùng localhost:5173 không phải 127.0.0.1]
```

---

## 📋 Format khi bắt đầu session mới

```
### Session YYYY-MM-DD — Bắt đầu
**Đọc trước:**
1. Entry gần nhất ở trên (HANDOVER)
2. agent/PROGRESS.md
3. tasks/NN-*.md của task cần làm
4. docs/guides/decisions.md (nếu là Phase 1 — đừng tự đổi quyết định)

**Kiểm tra:**
- docker compose ps (PostgreSQL còn chạy?)
- npm run dev (app còn chạy? port 5173/3000)
- Vuln còn exploit được không (chạy 1 payload thử)
```

---

## 📝 History

### Session 2026-09-08 — Phase 2-4 HOÀN THÀNH / Phase 5 sẵn sàng
**Trạng thái:** Hoàn thành
**Task hiện tại:** tasks/12 (publish) — chỉ còn commit + push + verify link
**Đã làm:**
- [x] Phase 2: 11/11 screenshots theo D13 + evidence-summary.json (10 Playwright tests pass)
- [x] Phase 3: ZAP 2.16.0 daemon scan → 52 alerts → triage 8 rules → zap-01..03.png
- [x] Phase 4: findings/00-index.md + docs/OWASP-checklist.md + docs/tool-guide.md
- [x] PROGRESS.md cập nhật Phase 2-4 ✅

**Cần làm tiếp:**
- Phase 5: commit + push (origin/main đã trỏ github.com/hieujojo/fashion-shop-security-lab)
- Verify link incognito theo tasks/12 checklist
- ⚠️ User: tự tay chạy lại từng payload (tasks/09) + đọc lại 4 findings trước phỏng vấn

**Lưu ý cho session sau:**
- ZAP daemon đang chạy ở C:\Users\Admin\Downloads\zap-tmp\ZAP_2.16.0 (port 8080,
  api.disablekey=true) — tắt bằng taskkill java hoặc giữ để rescan
- ZAP home dir: C:\Users\Admin\Downloads\zap-tmp\zaphome (session chứa 52 alerts)
- DB reset sau demo CSRF: `docker exec fashionhub-db psql -U fashionhub -d fashionhub -c "UPDATE users SET email='alice@fashionhub.dev' WHERE id=2;"`
- Evidence suite cần PoC server port 4444: `python -m http.server 4444 --directory poc`
- ZAP version cũ hơn 1 năm là bình thường (2.16.0 bản cuối ổn định cho lab)

### Session 2026-09-06 — Phase 1 HOÀN THÀNH / Phase 2 BẮT ĐẦU
**Trạng thái:** Hoàn thành
**Task hiện tại:** tasks/08 (polish) → xong, chuyển sang Phase 2
**Đã làm:**
- [x] Toàn bộ Phase 1 (tasks/01-08): scaffold + DB + Auth + Products + Reviews + Profile + Admin + Polish
- [x] 4 vuln còn nguyên trong code (F01a, F01b, F02, F03, F04)
- [x] App chạy được: http://localhost:5173 (client) + http://localhost:3000 (API)
- [x] PostgreSQL chạy trong Docker (fashionhub-db, port 5432)

**Cần làm tiếp:**
- Phase 2: Bạn tự tay khai thác theo tasks/09 (manual exploit runbook)
- Phase 3: tasks/10 (OWASP ZAP scan)
- Phase 4: tasks/11 (findings reports)
- Phase 5: tasks/12 (publish)

**Lưu ý cho session sau:**
- Browser LUÔN dùng http://localhost:5173 (KHÔNG dùng 127.0.0.1 — cookie Secure + same-site)
- Task 09 cần bạn tự thao tác: login admin, post review XSS, mở csrf-poc.html, chụp screenshot
- Giữ nguyên Docker container chạy (không cần restart nếu chưa tắt)

### Session 2026-09-03 — Phase 0: Plan chi tiết
**Trạng thái:** Hoàn thành
**Task hiện tại:** — (planning xong, chưa code)
**Đã làm:**
- [x] Tạo toàn bộ khung plan chi tiết (agent/, tasks/01-12, docs/guides)
- [x] Chốt quyết định kỹ thuật trong docs/guides/decisions.md (đọc TRƯỚC khi code Phase 1)

**Cần làm tiếp:**
- tasks/01: scaffold app (docker-compose + Vite React + Express TS)
- Chạy thử: docker compose up -d + npm install + npm run db:setup + npm run dev

**Lưu ý cho session sau:**
- Browser LUÔN dùng http://localhost:5173 (KHÔNG dùng 127.0.0.1 — cookie Secure + same-site)
- Node trên máy này: v20.20.2, npm 10.8.2, Docker 29 + Compose v5 — đủ điều kiện

<!-- Thêm entries mới khi kết thúc session -->
