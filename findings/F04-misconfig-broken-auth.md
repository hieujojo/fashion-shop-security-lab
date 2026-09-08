# F04 — Security Misconfiguration & Broken Authentication

| | |
|---|---|
| **ID** | F04 |
| **Severity** | High |
| **OWASP** | A05:2021 Security Misconfiguration + A07:2021 Identification and Authentication Failures |
| **Location** | `app/server/src/routes/auth.ts`, `app/server/src/middleware.ts`, `app/server/src/index.ts` |
| **Status** | Verified (automated + manual) |

## Sub-findings

### F04-1 — Default credentials

Seed account `admin@fashionhub.dev` / `admin123` works and grants full admin.

```
POST /api/login {"email":"admin@fashionhub.dev","password":"admin123"}
→ 200 {"id":1,"role":"admin"}
```

### F04-2 — Session cookie without HttpOnly

```
Set-Cookie: session=2; Max-Age=3600; Path=/; Secure; SameSite=None
```

No `HttpOnly` flag → any XSS (F02) can read the session cookie. `SameSite=None`
also enables cross-site sending (F03). Deliberate for the lab (D3/D4) but must be
fixed in any real deployment:

```ts
res.cookie('session', token, { httpOnly: true, sameSite: 'lax', secure: true });
```

### F04-3 — Verbose errors / stack traces

```
GET /api/products?q='
→ <pre>error: unterminated quoted string at or near "' ORDER BY id"
     at E:\...\pg-pool\index.js:45:11 ...
```

Full stack traces with file paths leak implementation details and make
injection trivially diagnosable. Fix: global error handler returning a generic
message; log details server-side only.

### F04-4 — No security headers

Response headers on `/api/products` contain **none** of:
`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`,
`X-Frame-Options`. `X-Powered-By: Express` discloses the stack.

Fix: `helmet` middleware + `app.disable('x-powered-by')` + CSP.

### F04-5 — Session forgery (predictable, unsigned session)

The session cookie value is the raw user id, unsigned (D4). Setting
`session=1` in the browser grants the admin panel immediately:

```
Cookie: session=1 → GET /api/admin/users → 200 (full user list with plaintext passwords)
```

Evidence: `screenshots/04f-session-forgery.png`

Fix: random opaque session ids server-side, or signed JWTs verified on the server;
never trust a client-controlled identifier.

### F04-6 — Passwords stored in plaintext

```sql
SELECT id, email, password FROM users;
-- admin@fashionhub.dev | admin123
```

Combined with F01 (SQLi dump), all credentials leak directly. Fix: bcrypt/argon2
hashing with per-user salts.

### F04-7 — No rate limiting / brute-force protection

Unlimited failed login attempts are accepted. Fix: rate-limit middleware
(e.g. `express-rate-limit`) + account lockout/backoff.

## Impact

Chain: F04-1 or F04-5 alone yields admin. F01 + F04-6 yields every credential.
F02 + F04-2 yields live session theft. Individually medium, combined = full system
compromise.
