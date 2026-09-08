# F02 — Stored XSS (Reviews → Admin Panel)

| | |
|---|---|
| **ID** | F02 |
| **Severity** | High |
| **OWASP** | A03:2021 — Injection |
| **Location** | `POST /api/products/:id/reviews` (no sanitization) → `app/client/src/components/ReviewList.tsx` and `app/client/src/pages/Admin.tsx` (`dangerouslySetInnerHTML`) |
| **Status** | Verified (automated + manual) |

## Description

Review content is stored raw and rendered as raw HTML via `dangerouslySetInnerHTML`
in two places: the product page review list and the admin panel. Anyone can post a
review (no login required, per design D8), so an attacker can plant a payload that
executes in every visitor's browser — including the admin reviewing content.

```tsx
<div className="review-content text-gray-800"
     dangerouslySetInnerHTML={{ __html: r.content }} />
```

## How to reproduce

1. Post the payload as a review (no authentication needed):

```http
POST /api/products/1/reviews
Content-Type: application/json

{"author":"mallory","rating":5,"content":"<img src=x onerror=\"alert(document.cookie)\">"}
```

Response `201` — the payload is stored **raw** (verified: response body contains
`onerror` unescaped).

2. Open `http://localhost:5173/products/1` — the payload renders and executes for
   any visitor.

3. Open `http://localhost:5173/admin` as admin — the same payload executes in the
   admin panel. Because the session cookie is **not** `HttpOnly` (F04-2), script can
   read it: `alert(document.cookie)` shows `session=1` (admin id).

## Impact

- Session theft: `document.cookie` readable → attacker replays admin session (F04 chain).
- Full account takeover via keylogging/DOM manipulation.
- Persistent: fires for every visitor until manually removed.

## Remediation

```tsx
// BEFORE (vulnerable)
<div dangerouslySetInnerHTML={{ __html: r.content }} />

// AFTER — render as plain text
<div>{r.content}</div>
```

If rich text is genuinely required: sanitize server-side on input **and**
client-side on render with DOMPurify, with an allowlist of tags. Defense in depth:
set the session cookie `HttpOnly` (see F04) so XSS cannot steal it.
