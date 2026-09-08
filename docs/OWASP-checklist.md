# OWASP Top 10 Checklist — FashionHub

> A one-page review checklist applied to **this lab app**, in the format a security
> reviewer would use before sign-off. Statuses reflect the verified state of the
> deliberately vulnerable build — each ❌ maps to a finding with a remediation in `findings/`.

| # | Category (OWASP Top 10 2021) | Control checked | Status | Evidence / Finding |
|---|---|---|---|---|
| A01 | Broken Access Control | Vertical privilege escalation (customer → admin) blocked server-side | ❌ | Forged `session=1` cookie grants admin panel — F04-5 |
| A01 | Broken Access Control | State-changing actions protected against cross-site forgery | ❌ | Email change via auto-submitted cross-site form — F03 |
| A01 | Broken Access Control | Admin endpoints reject non-admin roles | ✅ | `requireAdmin` middleware: alice → 403, anonymous → 401 |
| A02 | Cryptographic Failures | Passwords stored hashed (bcrypt/argon2) | ❌ | Plaintext in DB, dumped via SQLi — F04-6 |
| A02 | Cryptographic Failures | Session tokens unpredictable / signed | ❌ | Session = raw user id, unsigned — F04-5 |
| A03 | Injection | SQL queries parameterized, user input never concatenated | ❌ | Login bypass + UNION dump — F01 |
| A03 | Injection | All user-supplied HTML rendered as text (no raw innerHTML) | ❌ | Review content via `dangerouslySetInnerHTML` — F02 |
| A04 | Insecure Design | Sensitive flows (email change) require re-authentication / confirmation | ❌ | Email change needs only the session cookie — F03 |
| A05 | Security Misconfiguration | Security headers set (CSP, X-Frame-Options, HSTS, X-Content-Type-Options) | ❌ | All missing; `X-Powered-By: Express` exposed — F04-4 |
| A05 | Security Misconfiguration | Error responses generic; no stack traces to clients | ❌ | Raw Postgres error + stack trace returned — F04-3 |
| A05 | Security Misconfiguration | No default credentials; forced rotation on first login | ❌ | `admin@fashionhub.dev / admin123` works — F04-1 |
| A06 | Vulnerable Components | Dependencies pinned; no known-vulnerable packages | ✅ | Standard express/pg/react versions (lab scope) |
| A07 | Auth Failures | Rate limiting / lockout on login | ❌ | Unlimited attempts, Burp Intruder 200/401 — F04-7 |
| A07 | Auth Failures | Session cookie flags: HttpOnly + Secure + SameSite | ❌ | No HttpOnly (JS-readable), SameSite=None — F04-2 |
| A07 | Auth Failures | Generic authentication errors (no user enumeration) | ⚠️ | Same "invalid" message, but verbose SQL errors leak elsewhere (F04-3) |
| A08 | Data Integrity | CI/CD pipeline, signed artifacts | ➖ | Out of lab scope (no deployment) |
| A09 | Logging & Monitoring | Auth failures and admin actions logged server-side | ❌ | No request logging implemented |
| A10 | SSRF | Server fetches user-supplied URLs | ➖ | N/A — no outbound fetch feature in this app |

**Score: 4 pass · 11 fail · 3 N/A** — every failure has a documented remediation (before/after code) in `findings/`.
