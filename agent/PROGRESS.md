# PROGRESS — Quản lý Tasks & Milestones

> Chi tiết từng bước xem ở tasks/ folder. Khi bắt đầu session mới → đọc file này SAU WORKFLOW.md.

---

## Tổng quan

```
Trạng thái: Phase 1 (build app) ĐANG LÀM — task 01 xong
Bắt đầu: 2026-09-03
Cập nhật: 2026-09-06
Target: 4 findings exploit được + reports + README + GitHub public
Nguyên tắc: bạn TỰ TAY khai thác Phase 2-3 (AI không làm thay)
```

---

## Milestones

### Phase 0: Plan chi tiết ✅ (2026-09-03)

```
Trạng thái: HOÀN THÀNH
Việc: Tạo agent/ + tasks/01-12 + docs/guides (bắt chước distributed-cache)
Files: agent/*.md, tasks/*.md, docs/guides/*.md
```

### Phase 1: Build app + 4 vulns 🔄 (tasks/01 → 08)

```
Trạng thái: ĐANG LÀM — task 01 HOÀN THÀNH
Người làm: AI
```

### Phase 2: Khai thác tay ⬜ (tasks/09)

```
Trạng thái: CHƯA BẮT ĐẦU
Người làm: BẠN (AI hướng dẫn) — không code, chỉ khai thác + chụp screenshot
```

### Phase 3: OWASP ZAP ⬜ (tasks/10)

```
Trạng thái: CHƯA BẮT ĐẦU
Người làm: BẠN
```

### Phase 4: Reports + docs (English) ⬜ (tasks/11)

```
Trạng thái: CHƯA BẮT ĐẦU
Người làm: AI draft → bạn đọc + sửa bằng lời của mình
```

### Phase 5: Publish ⬜ (tasks/12)

```
Trạng thái: CHƯA BẮT ĐẦU
Người làm: AI
```

---

## Tracking từng vuln (cập nhật khi Phase 2 xong)

| Finding | Code xong | Exploit tay xong | Screenshot | Hiểu + giải thích được | Report xong |
|---|---|---|---|---|---|
| F01 SQLi | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| F02 Stored XSS | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| F03 CSRF | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| F04 Misconfig/Auth | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| ZAP alerts + triage | — | ⬜ | ⬜ | ⬜ | ⬜ |

---

## Dependencies (app)

```
Đã cài ✅: (chưa)
Cần cài ⬜: xem tasks/00-overview.md
```

---

## Pending Changes

```
> Chưa có (muốn đổi quyết định đã chốt → ghi ở đây, chờ user approve)
```

---

## Conflict Tracking

```
✅ Không có conflict
```

---

## Session History

### Session 2026-09-06 — Phase 1: Task 01 scaffold
**Trạng thái:** Hoàn thành
**Đã làm:**
- Tạo app/docker-compose.yml, app/package.json (workspace), server/client package.json
- Tạo tsconfig + vite.config.ts + .gitignore + app/sql/ folder
- Tạo server/src/index.ts minimal (express + health endpoint)

**Tiếp theo:**
- Task 02: DB schema + seed + db-setup script

### Session 2026-09-03 — Phase 0: Plan chi tiết
**Trạng thái:** Hoàn thành
**Đã làm:**
- Đọc distributed-cache (agent/, tasks/, docs/) để bắt chước cách tổ chức
- Tạo fashion-shop-security-lab/: agent/ (8 files), tasks/ (00-12), docs/guides, docs/reference
- Chốt các quyết định kỹ thuật chi tiết trong docs/guides/decisions.md

<!-- Thêm entries mới khi kết thúc session -->
