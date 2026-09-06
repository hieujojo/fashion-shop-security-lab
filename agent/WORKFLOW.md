# WORKFLOW — Quy trình làm việc (FashionHub Security Lab)

> File tổng hợp toàn bộ quy trình. **Đọc file này trước khi bắt đầu bất kỳ việc gì.**
> Project mô phỏng cách tổ chức của `distributed-cache` (agent/ + tasks/ + docs/guides).

---

## ⚠️ Bản chất project (đọc kỹ — KHÁC distributed-cache)

```
Đây là DELIBERATELY VULNERABLE app (chứa lỗ hổng CỐ Ý) — dùng để luyện security testing.
→ KHÔNG deploy, KHÔNG đưa lên server thật, KHÔNG dùng data thật.
→ Mọi thứ trong app/sql/seed.sql là dữ liệu giả tự tạo.
→ Khi thấy "lỗi" trong code → ĐÓ LÀ LỖ HỔNG CỐ Ý, đừng "sửa giúp" — ghi lại để report.
```

---

## Khi bắt đầu làm việc (session mới)

```
1. Đọc file này (WORKFLOW.md)
2. Đọc agent/HANDOVER.md → session trước làm gì, đang dở chỗ nào
3. Đọc agent/PROGRESS.md → task nào cần làm tiếp
4. Đọc tasks/NN-*.md tương ứng → chi tiết từng bước nhỏ
5. Đọc docs/guides/rules.md → quy tắc bắt buộc
6. Đọc docs/guides/decisions.md → các quyết định đã chốt (KHÔNG tự đổi)
```

---

## Bản đồ tasks ↔ Phase (trong plan gốc)

| Phase | Nội dung | tasks/ | Ai làm | Ngày |
|---|---|---|---|---|
| 0 | Lập plan chi tiết (file này) | — | AI | xong |
| 1 | Code app FashionHub + 4 vulns + seed | tasks/01 → 08 | AI (Buffy) | 2-3 |
| 2 | Bạn TỰ TAY khai thác từng vuln + screenshot | tasks/09 | **Bạn** (AI hướng dẫn từng bước) | 2 |
| 3 | Chạy OWASP ZAP → screenshot alerts → triage | tasks/10 | Bạn | 1 |
| 4 | Viết 4 findings reports + docs + README (tiếng Anh) | tasks/11 | AI draft → bạn sửa bằng lời mình | 1-2 |
| 5 | Push GitHub + kiểm tra link | tasks/12 | AI | 0.5 |

---

## Quy trình code 1 task (Phase 1 — dành cho AI)

```
BƯỚC 1: Chuẩn bị
  □ Đọc tasks/NN-*.md
  □ Đọc docs/guides/decisions.md (nhất là các quyết định về CÁCH cài lỗ hổng)

BƯỚC 2: Code theo file
  □ Tạo/sửa từng file theo đúng checklist trong tasks file
  □ Mỗi chỗ CỐ Ý sai → comment rõ: // VULN-01: deliberately insecure — see tasks/03
  □ SAU KHI XONG 1 FILE: tick ✅ trong tasks/NN-*.md

BƯỚC 3: Verify chạy được
  □ docker compose up -d (PostgreSQL)
  □ npm run db:setup
  □ npm run dev → http://localhost:5173 (app) + http://localhost:3000 (API)
  □ Mở browser: 6 pages render, login/đăng review/đổi email chạy

BƯỚC 4: Kiểm tra lỗ hổng CÒN HOẠT ĐỘNG (quan trọng nhất!)
  □ Chạy ĐÚNG payload trong tasks file → xác nhận vuln còn exploit được
  □ Nếu vuln "bị sửa mất" (vd: framework tự escape) → DỪNG, báo, đọc decisions.md

BƯỚC 5: Update docs
  □ Tick ✅ tasks file + PROGRESS.md
  □ Ghi changelog (docs/reference/changelog.md nếu gặp bug thật)
  □ Nếu phát hiện điều gì mới → thêm Lessons Learned vào docs/guides/rules.md

BƯỚC 6: Commit
  □ Commit theo agent/COMMIT_CONVENTION.md (message ghi rõ deliberate vuln)
  □ KHÔNG push (trừ task 12)

BƯỚC 7: Kết thúc session
  □ Ghi context vào agent/HANDOVER.md
```

---

## Quy trình Phase 2–3 (Bạn khai thác — AI chỉ hướng dẫn)

```
NGUYÊN TẮC BẤT DI BẤT DỊCH: bạn TỰ TAY làm, TỰ giải thích được.
AI KHÔNG được làm thay. AI chỉ:
  □ Chỉ dẫn từng bước trong tasks/09, tasks/10
  □ Giải thích "vì sao" khi bạn hỏi
  □ Review screenshot/evidence bạn chụp

Khi bạn xong 1 vuln → tick ✅ + ghi chú "hiểu và giải thích được" 
  (interview sẽ hỏi ĐÚNG những thứ này)
```

---

## Quy trình khi gặp vấn đề

```
1. Bug thật (app chạy sai so với thiết kế):
   → Ghi docs/reference/changelog.md + sửa + commit "fix(...)"
2. Vuln không exploit được (payload không chạy):
   → KHÔNG tự sửa code lung tung — đọc decisions.md, kiểm tra payload từng ký tự,
     kiểm tra cookie/browser (localhost đúng port, không phải 127.0.0.1), rồi mới hỏi AI
3. Muốn đổi quyết định đã chốt (decisions.md):
   → Ghi vào agent/PROGRESS.md mục "Pending Changes" → chờ user approve
```

---

## Reference files

| File | Mục đích |
|---|---|
| agent/WORKFLOW.md | Quy trình tổng hợp (file này) |
| agent/HANDOVER.md | Context handoff giữa các session |
| agent/PROGRESS.md | Track progress + session history |
| agent/MODULES.md | Tổng quan 4 findings + nơi cài trong code |
| agent/COMMIT_CONVENTION.md | Quy tắc commit |
| agent/GIT_WORKFLOW.md | Git workflow (1 branch) |
| agent/CODE_STYLE.md | Code style + cách đánh dấu chỗ cố ý sai |
| agent/PR_TEMPLATE.md | Template PR (repo public — dùng khi fork về) |
| tasks/*.md | Chi tiết từng bước nhỏ |
| docs/guides/setup.md | Cài đặt + chạy app |
| docs/guides/rules.md | Quy tắc bắt buộc + lessons learned |
| docs/guides/decisions.md | Các quyết định đã chốt (KHÔNG tự đổi) |
| docs/architecture/architecture.md | Kiến trúc các lớp + trust boundaries + bản đồ vuln |
| docs/architecture/tech-stack.md | Lý do chọn từng công nghệ + alternatives |
| docs/concepts/fundamentals.md | Tổng quan + bản đồ project + khởi động người mới |
| docs/concepts/session-cookie-csrf-xss.md | Cookie, session, SOP, CSRF, XSS — nền cho F02+F03 |
| docs/concepts/owasp-top10-and-4-vulns.md | OWASP Top 10 + 4 vuln lab + cách sửa |
| docs/concepts/testing-and-reporting.md | Quy trình kiểm thử + format report + sai lầm phổ biến |
| docs/reference/changelog.md | Bug log |
