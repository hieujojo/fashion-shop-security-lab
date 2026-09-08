# Findings — Verified Vulnerability Reports

All four findings were **verified against the running lab** (automated Playwright
evidence runs + manual verification). Evidence lives in `screenshots/`, the
reproduction script in `app/client/tests/evidence.spec.ts`, and the CSRF PoC in
`poc/csrf-poc.html`.

| ID | Vulnerability | Severity | OWASP | Report |
|---|---|---|---|---|
| F01 | SQL Injection — auth bypass + UNION dump | Critical | A03:2021 | [F01-sql-injection.md](F01-sql-injection.md) |
| F02 | Stored XSS — reviews → admin panel | High | A03:2021 | [F02-stored-xss.md](F02-stored-xss.md) |
| F03 | CSRF — email change without token | Medium | A01:2021 | [F03-csrf.md](F03-csrf.md) |
| F04 | Security Misconfiguration + Broken Auth | High | A05+A07:2021 | [F04-misconfig-broken-auth.md](F04-misconfig-broken-auth.md) |

## Automated evidence summary

`screenshots/evidence-summary.json` from the last run:

```json
{
  "F01a_login_bypass": "logged-in-as-admin-id-1",
  "F01b_union_dump": "creds-visible",
  "F02_xss_stored": "raw-html-stored",
  "F03_csrf_email_change": "email-changed",
  "F04_session_forgery": "admin-access-granted"
}
```

## Reproduce

```bash
docker compose -f app/docker-compose.yml up -d
cd app && npm install && npm run db:setup
npm run dev                                  # app :5173, API :3000
cd poc && python -m http.server 4444 &       # attacker origin for F03
cd app/client && npx playwright test tests/evidence.spec.ts
```
