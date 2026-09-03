# Tasks 03: Auth — Login + Cookie session + SQLi bypass (F01a)

> Phase 1 · Người làm: AI · Vuln cài ở task này: **F01a (SQLi auth bypass)** + nền cho F04 (cookie, rate-limit).

---

## Dependencies

```
Cần: tasks/02 (bảng users + db.ts)
```

---

## Files tạo

### ✅ app/server/src/middleware.ts

```typescript
import { pool } from './db';

// Đọc cookie 'session' (raw user id — D4) → load user từ DB → gắn req.user
export async function requireAuth(req, res, next) {
  const userId = req.cookies.session;
  if (!userId) return res.status(401).json({ error: 'Not logged in' });
  // Parameterized query (chỗ này ĐÚNG — để đối chiếu với chỗ SAI ở login)
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (rows.length === 0) return res.status(401).json({ error: 'Invalid session' });
  req.user = rows[0];
  next();
}

// Admin check — dùng sau requireAuth
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}
```

### ✅ app/server/src/routes/auth.ts

```typescript
import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// POST /api/login  { email, password }
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  // VULN-01a: deliberately insecure — SQL string concatenation (auth bypass)
  // See tasks/03 + docs/guides/decisions.md (D-notes). DO NOT "fix" — this is the vulnerability.
  // Payload: email = admin@trendthreads.dev'--  → comment hết phần password check
  const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  const { rows } = await pool.query(sql);   // KHÔNG try/catch → verbose error (F04-3, D6)

  if (rows.length === 0) {
    // F04-2: no rate limit / lockout — attacker brute-force thoải mái (cố ý)
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const user = rows[0];

  // VULN-F04-5: cookie insecure — httpOnly:false, sameSite:'none' (D3, D4)
  // httpOnly:false → JS đọc được document.cookie (stored XSS F02 dùng cái này)
  // sameSite:'none' → browser gửi cookie khi request cross-site (CSRF F03 dùng cái này)
  res.cookie('session', String(user.id), {
    httpOnly: false,
    sameSite: 'none',
    secure: true,          // sameSite=none bắt buộc secure — OK trên http://localhost
    maxAge: 60 * 60 * 1000,
  });
  res.json({ id: user.id, email: user.email, role: user.role });
});

// POST /api/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});

export default router;
```

### ✅ app/client/src/api.ts

```typescript
// fetch wrapper — mọi request kèm credentials (cookie) và parse JSON
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',        // gửi cookie session
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}
```

### ✅ app/client/src/pages/Login.tsx

```
UI: form email + password + nút "Sign in" (Tailwind)
On submit: POST /api/login → thành công: lưu user vào state (App) + navigate '/'
          → thất bại: hiện error message từ server
Ghi chú demo: dưới form ghi nhỏ "Demo accounts: admin@trendthreads.dev / admin123"
  (giống shop thật có "use demo account" — cũng là hint cho default creds finding)
```

### ✅ Sửa app/server/src/index.ts: mount routes

```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser());
app.use('/api', authRouter);   // + các router task sau
```

---

## Verify checklist (functional)

```
□ http://localhost:5173/login → login bằng alice@trendthreads.dev / alice123 → vào được Home
□ DevTools → Application → Cookies → localhost: cookie 'session' tồn tại:
     HttpOnly = KHÔNG tick · SameSite = None · Secure = tick
□ Console gõ document.cookie → hiện "session=2" (chứng minh JS đọc được — nền cho F02)
□ Sai password → 401 "Invalid email or password"
□ /api/profile (task 06) chưa có — test bằng requireAuth sau
```

## Verify checklist (VULN-01a — quan trọng, làm NGAY khi code xong)

```
□ Postman: POST http://localhost:5173/api/login
     Body JSON: { "email": "admin@trendthreads.dev'--", "password": "anything" }
   → 200 + trả về { id:1, email:"admin@trendthreads.dev", role:"admin" }  ← BYPASS THÀNH CÔNG
□ Giải thích (phải hiểu): query thành
     SELECT * FROM users WHERE email='admin@trendthreads.dev'--' AND password='anything'
   → '--' comment hết phần password check (PostgreSQL: -- comment tới cuối dòng, không cần space)
```

---

## Changelog + Commit

```
Commit mẫu (tách 2 commit):
  feat(auth): add login/logout with cookie session + Login page
  vuln(auth): add SQL injection in login query (deliberate — F01a)
```

---

## ⚠️ Lưu ý cho task sau

```
- 401 phải TRẢ VỀ JSON error — đừng redirect (API thuần)
- Login page + Home cần state user chung → để App.tsx quản lý (context đơn giản hoặc prop)
- KHÔNG thêm rate-limit dù biết là thiếu (F04-2 là tính năng)
```
