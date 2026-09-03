# GIT_WORKFLOW — Git Workflow

> Quyết định gốc (security-lab-plan.md): **1 branch duy nhất**, không CI/CD, không unit tests.
> Remediation thể hiện bằng code before/after trong report, không phải branch riêng.

---

## Quy tắc

```
1. Branch duy nhất: main
2. Commit thẳng vào main (solo project — giống distributed-cache)
3. Mỗi task/file 1 commit riêng, message theo COMMIT_CONVENTION.md
4. KHÔNG push cho tới tasks/12 (trừ khi user yêu cầu rõ)
5. KHÔNG tạo branch "fixed" / "remediated" — cách sửa nằm trong findings/*.md (before/after)
```

## Thứ tự commit đề xuất cho Phase 1

```
chore: init project scaffold (config files, docker-compose, .gitignore)
feat(db): add schema + seed + db setup script
vuln(auth): add login with SQL injection (F01a) + cookie session (F04-5)
feat(products): add product listing + search pages
vuln(products): add UNION SQL injection in search (F01b)
feat(reviews): add review posting
vuln(reviews): render review HTML raw — stored XSS (F02)
feat(profile): add profile + email change
vuln(profile): email change without CSRF token (F03) + csrf-poc.html
feat(admin): add admin panel (read-only)
vuln(admin): default creds + verbose errors (F04-1, F04-3)
chore: final polish (seed 15 products, SVG placeholders)
```

## Trước khi public (tasks/12)

```
1. Kiểm tra KHÔNG còn file nhạy cảm: .env*, node_modules, dist, test-report
2. README có banner "DELIBERATELY VULNERABLE — DO NOT DEPLOY"
3. GitHub repo: public + mô tả rõ "educational security testing lab"
4. Kiểm tra link sau khi push (đăng xuất/đăng nhập GitHub khác để chắc chắn public)
```

## Cảnh báo

```
- Repo public chứa code có lỗ hổng THẬT (nhưng data 100% giả) → README cảnh báo đủ
- KHÔNG đưa credential thật, KHÔNG đưa đường dẫn nội bộ, KHÔNG đưa thông tin cá nhân
- Nếu sau này muốn demo "after fix" → tạo file .fixed riêng trong findings/, KHÔNG sửa code chính
```
