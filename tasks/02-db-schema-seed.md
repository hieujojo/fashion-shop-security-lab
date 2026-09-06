# Tasks 02: DB — schema + seed + kết nối

> Phase 1 · Người làm: AI · Mục tiêu: PostgreSQL có 3 bảng + data seed, server query được.

---

## Dependencies

```
Cần: tasks/01 xong (docker-compose + pg trong deps)
```

---

## Files tạo

### ✅ app/sql/schema.sql

```sql
DROP TABLE IF EXISTS reviews, products, users CASCADE;

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,          -- VULN-F04-6: plaintext, KHÔNG hash (D5)
  role        TEXT NOT NULL DEFAULT 'customer',   -- 'admin' | 'customer'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  category    TEXT NOT NULL,          -- 'men' | 'women' | 'accessories'
  image_url   TEXT NOT NULL           -- /img/products/<n>.svg (SVG placeholder, task 08)
);

CREATE TABLE reviews (
  id          SERIAL PRIMARY KEY,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author      TEXT NOT NULL,          -- tên hiển thị, người dùng tự nhập (D8: không cần login)
  content     TEXT NOT NULL,          -- VULN-F02: lưu thô, không sanitize (D8)
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### ✅ app/sql/seed.sql (bản đầy đủ — task 08 chỉ THÊM products/ảnh, không đổi cấu trúc)

```sql
-- users (3) — password PLAINTEXT cố ý (D5), README sẽ ghi credentials
INSERT INTO users (email, password, role) VALUES
  ('admin@fashionhub.dev',   'admin123',   'admin'),
  ('alice@fashionhub.dev',   'alice123',   'customer'),
  ('mallory@fashionhub.dev', 'mallory123', 'customer');

-- products (~15) — danh sách gợi ý (task 08 bổ sung cho đủ + mô tả + ảnh SVG)
INSERT INTO products (name, description, price_cents, category, image_url) VALUES
  ('Slim-fit Denim Jacket', 'Classic denim jacket, stone-washed.', 8900, 'men', '/img/products/1.svg'),
  ('Cashmere Crewneck',     'Ultra-soft cashmere knit.',           12000, 'men', '/img/products/2.svg'),
  ('Linen Summer Shirt',    'Breathable linen, relaxed fit.',      4500, 'men', '/img/products/3.svg'),
  ('Tailored Wool Blazer',  'Italian wool, single-breasted.',      15900, 'men', '/img/products/4.svg'),
  ('Cotton Chino Pants',    'Stretch cotton, tapered cut.',        6900, 'men', '/img/products/5.svg'),
  ('Silk Wrap Dress',       'Elegant silk, midi length.',          13900, 'women', '/img/products/6.svg'),
  ('Denim Skirt',           'High-waist A-line denim.',            5200, 'women', '/img/products/7.svg'),
  ('Knit Cardigan',         'Cozy oversized cardigan.',            7800, 'women', '/img/products/8.svg'),
  ('Pleated Midi Skirt',    'Flowing pleats, satin finish.',       6500, 'women', '/img/products/9.svg'),
  ('Cropped Puffer Vest',   'Lightweight quilted vest.',           9800, 'women', '/img/products/10.svg'),
  ('Leather Crossbody Bag', 'Full-grain leather.',                 7500, 'accessories', '/img/products/11.svg'),
  ('Aviator Sunglasses',    'UV400 polarized lenses.',             3500, 'accessories', '/img/products/12.svg'),
  ('Silk Scarf',            'Hand-rolled edges.',                  2900, 'accessories', '/img/products/13.svg'),
  ('Wool Beanie',           'Merino wool, ribbed knit.',           1900, 'accessories', '/img/products/14.svg'),
  ('Canvas Tote Bag',       'Heavy-duty canvas, inner pocket.',    2400, 'accessories', '/img/products/15.svg');

-- reviews mẫu (5) — benign, không chứa payload
INSERT INTO reviews (product_id, author, content, rating) VALUES
  (1, 'alice',  'Great fit and the denim feels premium.', 5),
  (1, 'daniel', 'Runs slightly large, size down.', 4),
  (6, 'sofia',  'The silk is gorgeous, perfect for events.', 5),
  (11, 'mike',  'Nice bag but strap is a bit thin.', 4),
  (2, 'alice',  'Softest sweater I own.', 5);
```

### ✅ app/server/src/db.ts

```typescript
import { Pool } from 'pg';
// Đọc env: DB_HOST=localhost, DB_PORT=5432, DB_USER/PASS/NAME=fashionhub
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'fashionhub',
  password: process.env.DB_PASS || 'fashionhub',
  database: process.env.DB_NAME || 'fashionhub',
});
```

### ✅ app/server/scripts/db-setup.ts

```
1. Kết nối tới postgres (db mặc định 'postgres') → CREATE DATABASE fashionhub (nếu chưa có)
2. Đọc app/sql/schema.sql + app/sql/seed.sql → chạy tuần tự
3. Log số rows insert được
→ Script idempotent: chạy lại = DROP + CREATE lại (data lab, không sợ mất)
```

---

## Verify checklist

```
□ docker compose up -d → postgres Up
□ npm run db:setup     → log "schema OK" + "seeded 3 users, 15 products, 5 reviews"
□ Kiểm tra nhanh bằng node (tsx -e) hoặc psql:
     SELECT email, role FROM users;              → 3 rows
     SELECT count(*) FROM products;              → 15
     SELECT count(*) FROM reviews;               → 5
□ Thêm endpoint tạm GET /api/health/db trả về count(*) từng bảng → bỏ sau (hoặc giữ nếu muốn)
```

✅ Task 02 completed — all files created and verified

---

## Changelog + Commit

```
Commit mẫu:
  feat(db): add schema, seed data and db setup script
```

---

## ⚠️ Lưu ý cho task sau (03)

```
- Bảng users có cột password PLAINTEXT → task 03 login so sánh thẳng chuỗi
- db.ts export pool → các route import { pool } từ '../db'
```
