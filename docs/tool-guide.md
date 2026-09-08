# Tool Guide — What Was Used Where

> Companion to the findings reports: which tool found what, and how each finding was
> verified manually. When an interviewer asks "which tools did you use?", this is the map.

## Tool ↔ Finding matrix

| Finding | OWASP ZAP 2.16.0 | Burp Suite | Postman | Chrome DevTools | Playwright (evidence) |
|---|---|---|---|---|---|
| F01a — login SQLi (auth bypass) | ❌ no auth context | — | ✅ sent payload, read admin response | — | ✅ scripted login bypass → screenshot |
| F01b — UNION dump | ✅ **alert (High)** | — | ✅ column-count probing (`ORDER BY 6/7`) + dump | ✅ product grid renders dumped creds | ✅ scripted dump → screenshot |
| F02 — stored XSS | ❌ multi-step flow | — | ✅ confirmed raw storage in POST response | ✅ alert shows `session=` cookie | ✅ posted payload + fired in admin panel |
| F03 — CSRF | ❌ design flaw | ✅ (PoC pattern) | ✅ verified email changed server-side | ✅ Network tab shows cross-site POST 200 | ✅ PoC page → email changed |
| F04-1 — default creds | ❌ | ✅ manual login | ✅ | — | ✅ scripted admin login |
| F04-2 — no rate limit | ❌ | ✅ **Intruder**: 5 passwords, no throttling | ✅ repeated attempts | — | — |
| F04-3 — verbose errors | ✅ **alert (via SQLi)** | — | ✅ single-quote probe | — | ✅ scripted probe → screenshot |
| F04-4 — missing headers | ✅ **passive alerts (CSP, clickjacking, X-Content-Type-Options, X-Powered-By)** | — | — | ✅ Response Headers inspection | ✅ header dump → screenshot |
| F04-5 — cookie flags / session forgery | ✅ passive alert (cookie flags) | — | — | ✅ Application → Cookies; edited cookie to `session=1` → admin | ✅ scripted forgery → screenshot |
| F04-6 — plaintext passwords | — | — | ✅ via F01b dump | — | — |
| F04-7 — CORS not configured | — | — | — | — | — (honest N/A in report) |

## Scan pipeline (ZAP)

```
Spider (GET crawl)      → mapped public site tree (no auth, no POST flows)
Active scan (API host)  → SQL Injection alert on /api/products?q=
Passive scan            → CSP missing, X-Frame-Options missing,
                          X-Content-Type-Options missing, cookie flags, X-Powered-By
Raw output              → 52 alert instances → triaged to 8 unique rules → 4 findings
Evidence                → screenshots/zap-01-spider.png, zap-02-active-scan-alerts.png,
                          zap-03-alert-triage.png
```

## Why ZAP alone is not enough

1. **No authenticated session** — ZAP never logged in, so `POST /api/login` (F01a) and
   every admin endpoint were invisible to the active scanner.
2. **Multi-step flows** — stored XSS (F02) requires posting a review and then visiting
   the page as another user; scanners do not chain actions across sessions.
3. **Design flaws have no payload** — CSRF (F03) is the *absence* of a token; a scanner
   sees "POST without token" but cannot conclude it is exploitable. Same for session
   forgery (F04-5): only a human decides "session = raw user id is a fatal design choice".

> Automation found the shallow layer (2 of 4 findings). The rest came from understanding
> the app's flows and verifying manually — the core skill of security testing.
