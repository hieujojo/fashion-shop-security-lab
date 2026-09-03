# COMMIT_CONVENTION — Quy tắc Commit Message

> Project này KHÁC thường: code chứa lỗ hổng CỐ Ý.
> Commit message PHẢI ghi rõ đó là deliberate, để lịch sử git không bị hiểu nhầm
> (và để chính mình sau này không tưởng đó là bug thật mà "sửa" mất vuln).

---

## Format

```
<type>(<scope>): <mô tả ngắn — tiếng Anh>

- bullet chi tiết (tuỳ chọn)
```

## Types

| Type | Dùng khi |
|---|---|
| `feat` | Thêm tính năng / page / route |
| `vuln` | **Cài lỗ hổng CỐ Ý** (đánh dấu rõ!) — dùng thay `feat` cho phần vulnerable |
| `fix` | Sửa bug THẬT (app chạy sai so với thiết kế — KHÔNG phải vuln) |
| `docs` | Docs: agent/, tasks/, docs/, README, findings/ |
| `chore` | Config, dependencies, .gitignore |
| `test` | (nếu có) |

## Scope (phần nào của app)

| Scope | Nghĩa |
|---|---|
| `scaffold` | Khởi tạo project, config |
| `db` | schema/seed |
| `auth` | login/logout/session |
| `products` | danh sách + search |
| `reviews` | reviews |
| `profile` | profile/email |
| `admin` | admin panel |
| `poc` | csrf-poc.html |
| `runbook` | tasks/09, 10 (hướng dẫn khai thác) |
| `report` | findings/*.md |
| `lab` | chung cho cả project |

---

## Ví dụ

```
vuln(auth): add SQL injection in login query (deliberate — F01a)

- Concatenate email directly into SQL string instead of parameterized query
- Payload: admin@fashionhub.dev'-- logs in as admin without password
- Deliberately insecure: see tasks/03 + docs/guides/decisions.md

feat(products): add search + category filter pages (home/products)
docs(report): add finding-01 SQL injection report draft
fix(auth): server crash when review content is null (real bug, not vuln)
```

---

## Quy tắc

```
1. Message TIẾNG ANH (repo public — ai cũng đọc được)
2. Commit theo từng task/file, không gộp lung tung
3. Commit chứa vuln → bắt buộc có "deliberate" hoặc "F0x" trong message
4. KHÔNG commit .env, node_modules, screenshots tạm
5. KHÔNG push cho tới task 12 (trừ khi user yêu cầu)
```
