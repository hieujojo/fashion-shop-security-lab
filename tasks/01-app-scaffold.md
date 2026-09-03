# Tasks 01: App Scaffold — dựng project chạy được

> Phase 1 · Người làm: AI · Mục tiêu: docker compose up + npm install + npm run dev → 2 server chạy.

---

## Dependencies

```
npm install ở 3 nơi: app/ (root), app/server, app/client
Xem danh sách chính xác ở tasks/00-overview.md
```

---

## Files tạo

### ✅ app/docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: trendthreads-db
    environment:
      POSTGRES_USER: trendthreads
      POSTGRES_PASSWORD: trendthreads
      POSTGRES_DB: trendthreads
    ports:
      - "5432:5432"        # bận → đổi "5433:5432" + env DB_PORT (xem docs/guides/setup.md)
    volumes:
      - trendthreads-data:/var/lib/postgresql/data
volumes:
  trendthreads-data:
```

### ✅ app/package.json (root workspace)

```json
{
  "name": "trendthreads-app",
  "private": true,
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm run dev -w server\" \"npm run dev -w client\"",
    "db:setup": "npm run db:setup -w server",
    "install:all": "npm install && npm install -w server && npm install -w client"
  },
  "devDependencies": { "concurrently": "^9.0.0" }
}
```

### ✅ app/server/package.json (những field chính)

```json
{
  "name": "server",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "db:setup": "tsx scripts/db-setup.ts"
  }
}
```

### ✅ app/client/package.json

```json
{
  "name": "client",
  "private": true,
  "scripts": { "dev": "vite", "build": "tsc -b && vite build", "preview": "vite preview" }
}
```

### ✅ app/client/vite.config.ts

```typescript
// proxy mọi /api sang Express :3000 → app duy nhất ở http://localhost:5173 (D2)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000' } },
});
```

### ✅ app/client/tsconfig.json + app/server/tsconfig.json

```
Server: module nodenext (hoặc commonjs), strict true, target ES2022
Client: chuẩn Vite React-TS template
```

### ✅ app/server/src/index.ts (tối thiểu — sẽ phát triển ở task sau)

```typescript
import express from 'express';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // D7: cần cho csrf-poc.html (form)
app.get('/api/health', (_req, res) => res.json({ ok: true }));
// VULN-F04-3: KHÔNG có error handler gọn — Express dev trả stack trace (cố ý, D6)
app.listen(3000, () => console.log('API on http://localhost:3000'));
```

### ✅ .gitignore (root)

```
node_modules/
dist/
.env
*.log
```

### ✅ app/sql/ (folder trống — task 02 điền)

---

## Verify checklist (chạy xong phải đạt)

```
□ docker compose -f app/docker-compose.yml up -d        → container Up
□ cd app && npm install (3 nơi)                          → không lỗi
□ npm run dev                                            → server :3000 + client :5173
□ http://localhost:3000/api/health                       → {"ok":true}
□ http://localhost:5173                                  → trang trắng Vite render (chưa có UI)
□ http://localhost:5173/api/health                       → {"ok":true}  (proxy hoạt động!)
```

---

## Changelog + Commit

```
Changelog (docs/reference/changelog.md): chỉ ghi nếu gặp bug thật
Commit mẫu:
  chore: init project scaffold (docker-compose, npm workspaces, express+vite)
```

---

## ⚠️ Lưu ý cho task sau (02)

```
- Đừng quên express.urlencoded() — task 06 (CSRF form) cần nó
- KHÔNG cài helmet/cors/express-session — đã chốt D3/D7
- Nhớ tick ✅ PROGRESS.md Phase 1 sau khi xong
```
