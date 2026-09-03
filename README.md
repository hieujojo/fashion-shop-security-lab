# TrendThreads — Web Security Testing Lab

> ⚠️ **DELIBERATELY VULNERABLE — EDUCATIONAL PURPOSES ONLY. DO NOT DEPLOY.**
> This repository contains an intentionally insecure web application for practicing
> web security testing. All data is 100% synthetic. Run locally only.

A fashion e-commerce web app (React + Node.js/Express + PostgreSQL) built as a
security testing playground for:

- **SQL Injection** (auth bypass + UNION data exfiltration)
- **Stored XSS** (via product reviews)
- **CSRF** (account email change)
- **Security Misconfiguration & Broken Auth** (default credentials, missing headers,
  insecure cookies, verbose errors, plaintext passwords, no rate limiting)

Each vulnerability is documented with reproduction steps, evidence and remediation
(before/after code) under `findings/` (in progress).

## Status

- **Phase 0 — Plan:** done. Detailed step-by-step build/exploit plan lives in
  [`agent/`](agent/WORKFLOW.md) + [`tasks/`](tasks/00-overview.md).
- **Phase 1 — App build:** coming next.
- Tools: OWASP ZAP · Burp Suite · Postman · browser DevTools.

## Project structure

```
agent/     # Development workflow docs (read agent/WORKFLOW.md first)
tasks/     # Step-by-step build + exploit runbooks (00-12)
docs/      # Guides (setup, rules, decisions) + reference
app/       # Source code (React client + Express server + PostgreSQL) — Phase 1
findings/  # Vulnerability reports — Phase 4
screenshots/ # Evidence — Phase 2-3
```

## License

MIT — but remember: the code is intentionally vulnerable. Never run it outside a
local lab environment.
