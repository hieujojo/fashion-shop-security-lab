# Findings Index — FashionHub Security Lab

> Method: OWASP ZAP 2.16.0 (spider → active scan → passive scan) + manual verification
> (browser, DevTools, Postman, Burp Suite, Playwright evidence runs).
> **52 scanner alerts → triaged down to 4 verified findings.** Every verdict below is
> backed by reproducible evidence in `screenshots/` and `app/client/tests/evidence.spec.ts`.

## Verified findings

| Finding | Vulnerability | Severity | OWASP 2021 | CWE | Endpoint(s) | Report |
|---|---|---|---|---|---|---|
| F01 | SQL Injection — auth bypass + UNION data dump | Critical | A03:2021 Injection | CWE-89 | `POST /api/login`, `GET /api/products?q=` | [F01-sql-injection.md](F01-sql-injection.md) |
| F02 | Stored XSS — reviews → admin panel | High | A03:2021 Injection | CWE-79 | `POST /api/products/:id/reviews`, admin panel render | [F02-stored-xss.md](F02-stored-xss.md) |
| F03 | CSRF — email change without token | Medium | A01:2021 Broken Access Control | CWE-352 | `POST /api/profile/email` | [F03-csrf.md](F03-csrf.md) |
| F04 | Security Misconfiguration + Broken Authentication (7 sub-findings) | High | A05 + A07:2021 | CWE-16 / CWE-287 / CWE-598 | login, cookies, error handler, headers | [F04-misconfig-broken-auth.md](F04-misconfig-broken-auth.md) |

## Attack chains observed

- **F01b + F04-6** → every credential (plaintext passwords dumped via UNION).
- **F04-1 or F04-5** alone → full admin access (default creds / forged session cookie).
- **F02 + F04-2** → attacker-posted review executes in the admin's browser and reads the non-HttpOnly session cookie → session theft.

## ZAP alert triage (52 alerts → 8 unique rules)

| Risk | ZAP rule | Instances | Verdict | Reason |
|---|---|---|---|---|
| High | SQL Injection | 1 | ✅ REAL → **F01b** | UNION dump verified manually — users table with plaintext passwords returned in product grid |
| Medium | Content Security Policy (CSP) Header Not Set | ~20 | ✅ REAL → **F04-4** | No CSP on any response — confirmed via DevTools Network tab |
| Medium | Missing Anti-clickjacking Header | ~20 | ✅ REAL → **F04-4** | No `X-Frame-Options` / `frame-ancestors` anywhere |
| Low | X-Content-Type-Options Header Missing | ~20 | ✅ REAL → **F04-4** | MIME sniffing not blocked on any response |
| Low | Server Leaks Information via "X-Powered-By" Header | 1 | ✅ REAL → **F04-4** | `X-Powered-By: Express` discloses the stack |
| Low | Timestamp Disclosure - Unix | 1 | ❌ FALSE POSITIVE | `created_at` values are business data (review timestamps), not secrets |
| Informational | Information Disclosure - Suspicious Comments | 1 | ❌ FALSE POSITIVE (dev only) | Vite dev server serves raw source; a production build would not |
| Informational | Modern Web Application | 1 | ℹ️ INFORMATIONAL | SPA fingerprinting note, not a vulnerability |

Evidence: `screenshots/zap-01-spider.png` · `zap-02-active-scan-alerts.png` · `zap-03-alert-triage.png`

## What ZAP did NOT find (found manually instead)

| Finding | Why the scanner missed it |
|---|---|
| F01a — login SQLi (auth bypass) | ZAP had no authenticated session → `POST /api/login` was never active-scanned |
| F02 — stored XSS | Requires posting a review (multi-step flow) and re-rendering in the admin panel |
| F03 — CSRF | Token absence is a design flaw, not an injectable input — scanners cannot conclude it |
| F04-1/5/6/7 — default creds, session forgery, plaintext passwords, no rate limit | All require authentication context or semantic knowledge of the app |

> **Conclusion:** automation found the shallow layer (2 of 4 findings); the rest required
> understanding the app's flows and verifying manually — the core skill of security testing.
