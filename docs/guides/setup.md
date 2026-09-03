# SETUP — Cài đặt & chạy app (FashionHub)

> Máy dev hiện tại: Node v20.20.2, npm 10.8.2, Docker 29 + Compose v5, Git 2.49 (Windows).

---

## Yêu cầu hệ thống

```
Node.js:  >= 20
npm:      >= 10
Docker:   Desktop (đang chạy) — cho PostgreSQL
Git:      >= 2
Browser:  Chrome (ưu tiên) / Firefox
```

---

## Cài đặt (1 lần)

```bash
# 1. Từ root repo fashion-shop-security-lab/
docker compose -f app/docker-compose.yml up -d     # PostgreSQL 16 trên port 5432

# 2. Cài dependencies
cd app && npm install          # root workspace (server + client)

# 3. Tạo DB + seed data
npm run db:setup               # tạo database fashionhub + chạy schema.sql + seed.sql

# 4. Chạy app
npm run dev                    # server :3000 + client :5173 (concurrently)
```

**App:** http://localhost:5173  ·  **API:** http://localhost:3000

---

## Kiểm tra cài đặt thành công

```
□ docker compose ps → container postgres đang "Up"
□ http://localhost:5173 → Home page hiện grid sản phẩm
□ http://localhost:3000/api/health → {"ok":true}
□ http://localhost:5173/api/products?q=jacket → trả JSON sản phẩm (proxy hoạt động)
```

---

## Credentials (seed — CỐ Ý yếu, ghi trong README)

```
admin@fashionhub.dev  / admin123     (role: admin)
alice@fashionhub.dev  / alice123     (role: customer)
mallory@fashionhub.dev / mallory123  (role: customer)
```

---

## Troubleshooting

### Postgres port 5432 bị chiếm
```bash
# Sửa app/docker-compose.yml: "5433:5432"
# Rồi export DB_PORT=5433 trước khi npm run dev (server đọc env DB_PORT, mặc định 5432)
```

### "Cannot find module"
```bash
cd app && rm -rf node_modules && npm install
```

### DB chưa có / seed lỗi
```bash
npm run db:setup            # idempotent: DROP + CREATE lại (data lab, không sợ mất)
```

### Vào trang nhưng cookie không lưu / CSRF không chạy
```
□ Đang mở http://localhost:5173 — KHÔNG phải 127.0.0.1
□ DevTools → Application → Cookies: có cookie 'session', SameSite=None, Secure
□ Nếu cookie biến mất → hard refresh (F5) sau khi login
```

### Reset toàn bộ (về trạng thái ban đầu)
```bash
docker compose -f app/docker-compose.yml down
docker compose -f app/docker-compose.yml up -d
cd app && npm run db:setup && npm run dev
```

---

## Cấu trúc sau khi cài đặt

```
fashion-shop-security-lab/
├── agent/          # Workflow docs (đọc WORKFLOW.md trước)
├── tasks/          # Từng bước nhỏ (00-12)
├── docs/
│   ├── guides/     # setup, rules, decisions
│   └── reference/  # changelog
├── app/
│   ├── client/     # React (Vite) + TS + Tailwind
│   ├── server/     # Express + TS
│   ├── sql/        # schema.sql + seed.sql
│   ├── docker-compose.yml
│   └── package.json (workspace: chạy cả server + client)
├── poc/csrf-poc.html
├── findings/       # (tạo ở tasks/11)
├── screenshots/    # (tạo ở tasks/09-10)
└── README.md       # (tạo ở tasks/11 — tiếng Anh)
```
