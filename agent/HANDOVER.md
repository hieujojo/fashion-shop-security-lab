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
