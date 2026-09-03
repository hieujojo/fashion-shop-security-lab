# PR_TEMPLATE — Template Pull Request

> Project solo → không dùng PR khi tự phát triển (GIT_WORKFLOW.md).
> Template này dùng khi: người khác fork + muốn đóng góp, hoặc bạn tạo PR từ nhánh tạm.

---

## Template

```markdown
## Mô tả
[1-2 câu: thay đổi gì, tại sao]

## Loại thay đổi
- [ ] feat (tính năng mới)
- [ ] vuln (cài lỗ hổng cố ý — ghi rõ F0x)
- [ ] fix (bug thật)
- [ ] docs (docs/report)
- [ ] chore (config)

## Liên quan
- tasks/: [NN-ten.md]
- Finding: [F01-F04 nếu là vuln]
- Quyết định: [docs/guides/decisions.md — Dx nếu đổi quyết định]

## Checklist
- [ ] Chạy được: docker compose up -d && npm run db:setup && npm run dev
- [ ] Vuln (nếu có) còn exploit được với payload trong tasks file
- [ ] Commit message đúng COMMIT_CONVENTION.md
- [ ] KHÔNG chứa .env / data thật / thông tin cá nhân

## ⚠️ Lưu ý
Project này CỐ Ý chứa lỗ hổng bảo mật để học tập.
KHÔNG deploy, KHÔNG dùng ngoài môi trường lab local.
```
