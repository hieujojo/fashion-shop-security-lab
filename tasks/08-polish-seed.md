# Tasks 08: Polish — UI hoàn chỉnh + SVG placeholder + App routing

> Phase 1 (cuối) · Người làm: AI · Mục tiêu: app "nhìn như shop thật" để demo có sức thuyết phục.

---

## Dependencies

```
Cần: tasks/01-07 xong. Task này được phép SỬA file cũ (00-overview Conflict Map ghi rõ).
QUY TẮC: KHÔNG đổi logic vuln — chỉ làm đẹp UI + data.
```

---

## Việc cần làm

### ✅ App.tsx — routing + user state

```
Router: / (Home), /products (Products), /products/:id (ProductDetail),
        /login (Login), /profile (Profile), /admin (Admin)
User state: sau login/logout cập nhật → Navbar hiện email + link (Login/Profile/Admin/Logout)
Navbar: tên shop "FashionHub" + nav links (giống shop thật)
```

### ✅ Ảnh SVG placeholder (app/client/public/img/products/1.svg … 15.svg)

```
Tự render, chạy offline, 0 dependency (quyết định từ plan gốc):
  - Nền màu pastel khác nhau theo category (men: xanh dương nhạt, women: hồng, accessories: kem)
  - Giữa ảnh: chữ tên sản phẩm (font sans-serif) — nhìn rõ sản phẩm nào
  - Kích thước 400x400
Ghi chú: tạo 1 script nhỏ sinh 15 file (scripts/gen-svgs.mjs) HOẶC viết tay 15 file nhỏ
  — chọn cách nào nhanh, miễn kết quả đẹp. KHÔNG dùng ảnh từ internet (chạy offline).
```

### ✅ seed.sql — review lại + thêm mô tả cho đủ 15 products

```
- Đảm bảo 15 products với mô tả 1 câu thật (đã có ở tasks/02 — giữ nguyên)
- 5 reviews seed (đã có) — giữ BENIGN (payload độc để BẠN tự post ở Phase 2)
- Re-run: npm run db:setup → đếm lại 3/15/5
```

### ✅ CSS: Tailwind v4

```
- app/client/src/index.css: @import "tailwindcss";
- vite.config.ts đã có plugin tailwindcss (tasks/01)
- Style nhất quán: container max-w-6xl, card có border + shadow nhẹ, màu trung tính + 1 accent
```

### ✅ Trang trống/404 + loading/error state nhỏ

```
- api.ts đã throw error → các page bắt lỗi hiện message (không crash trắng trang)
- Đủ để "demo mượt" — KHÔNG làm quá (rules.md rule 8)
```

---

## Verify checklist (cuối Phase 1 — toàn diện)

```
□ http://localhost:5173 → Home đẹp, grid 8 sản phẩm có ảnh SVG
□ Đi hết flow người dùng thường: Home → Products (filter + search) → ProductDetail (xem + post review)
  → Login alice → Profile (đổi email) → Logout
□ Login admin → Admin panel 3 tab → Logout
□ Screenshot "app chạy bình thường" 1-2 tấm (dùng cho README + kể chuyện trước khi nói tới vuln)
```

## Verify checklist (4 vuln CÒN NGUYÊN — chạy nhanh từng cái)

```
□ F01a: POST /api/login {email:"admin@fashionhub.dev'--", password:"x"} → 200 admin
□ F01b: GET /api/products?q=' UNION SELECT NULL,email,password,NULL,role,email FROM users-- → dump users
□ F02:  review <img src=x onerror="alert(document.cookie)> → alert bắn ở ProductDetail VÀ Admin
□ F03:  csrf-poc.html đổi email khi đang login
□ F04:  admin/admin123 vào admin · q=' → 500 verbose · devtools: cookie không HttpOnly + SameSite=None
```

---

## Changelog + Commit

```
Commit mẫu:
  feat: add app shell, routing, navbar and SVG product placeholders
  chore: finalize seed with 15 products (re-run db:setup)
```

---

## ✅ Kết thúc Phase 1

```
□ Tick toàn bộ ✅ trong PROGRESS.md (Phase 1 + cột "Code xong" của 4 findings)
□ Ghi HANDOVER.md → Phase 2 bắt đầu (tasks/09 — BẠN làm)
□ Thông báo cho bạn: app sẵn sàng để TỰ TAY khai thác
```
