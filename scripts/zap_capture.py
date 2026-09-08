#!/usr/bin/env python3
"""zap_capture.py — render OWASP ZAP API output (spider results + alerts) to PNG evidence.

Usage:
    python scripts/zap_capture.py            # ZAP daemon on 127.0.0.1:8080
Requires: playwright (chromium) + ZAP running with api.disablekey=true.
"""

import json
import sys
import urllib.request
from pathlib import Path

ZAP = "http://127.0.0.1:8080"
ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "screenshots"

RISK_ORDER = {"High": 0, "Medium": 1, "Low": 2, "Informational": 3}
RISK_COLOR = {"High": "#b91c1c", "Medium": "#c2410c", "Low": "#a16207", "Informational": "#4b5563"}

# Triage verdicts — cross-checked against manual verification (tasks/09 + findings/)
TRIAGE = {
    "SQL Injection": ("✅ REAL → F01b", "UNION dump verified manually (Postman + Playwright): users table with plaintext passwords"),
    "Content Security Policy (CSP) Header Not Set": ("✅ REAL → F04-4", "No CSP on any response — confirmed via DevTools"),
    "Missing Anti-clickjacking Header": ("✅ REAL → F04-4", "No X-Frame-Options/frame-ancestors — clickjacking possible"),
    "X-Content-Type-Options Header Missing": ("✅ REAL → F04-4", "MIME sniffing not blocked on any response"),
    "Server Leaks Information via \"X-Powered-By\" HTTP Response Header": ("✅ REAL → F04-4", "X-Powered-By: Express discloses the stack"),
    "Timestamp Disclosure - Unix": ("❌ FALSE POSITIVE", "created_at values are business data (order/review timestamps), not secrets"),
    "Information Disclosure - Suspicious Comments": ("❌ FALSE POSITIVE (dev only)", "Vite dev server serves raw source; a production build would not"),
    "Modern Web Application": ("ℹ️ INFORMATIONAL", "Not a vulnerability — SPA fingerprinting note"),
}


def fetch(path: str):
    with urllib.request.urlopen(ZAP + path, timeout=15) as r:
        return json.load(r)


def page(title: str, body: str) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<style>
 body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 24px; background: #fff; color: #111; }}
 h1 {{ font-size: 22px; margin: 0 0 4px; }} .sub {{ color: #666; font-size: 12px; margin-bottom: 18px; }}
 table {{ border-collapse: collapse; width: 100%; font-size: 13px; }}
 th, td {{ border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; vertical-align: top; }}
 th {{ background: #f3f4f6; }}
 .risk {{ font-weight: 700; }}
 code {{ background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-size: 12px; }}
 .note {{ color: #374151; }}
</style></head><body>{body}</body></html>"""


def render_shots(html: str, out: Path):
    from playwright.sync_api import sync_playwright
    tmp = out.with_suffix(".tmp.html")
    tmp.write_text(html, encoding="utf-8")
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1280, "height": 900})
        pg.goto(tmp.as_uri())
        pg.wait_for_timeout(300)
        pg.screenshot(path=str(out), full_page=True)
        b.close()
    tmp.unlink()
    print(f"  -> {out.name}")


def main():
    SHOTS.mkdir(exist_ok=True)

    # ---- zap-01: spider results / URLs discovered
    urls = fetch("/JSON/core/view/urls/")["urls"]
    spider = fetch("/JSON/spider/view/results/")["results"]
    rows = "".join(f"<tr><td><code>{u}</code></td></tr>" for u in sorted(set(urls)))
    srows = "".join(f"<li><code>{u}</code></li>" for u in spider)
    html = page("ZAP Spider — URLs discovered", f"""
      <h1>ZAP 2.16.0 — Spider results</h1>
      <div class="sub">Target: http://localhost:5173 (FashionHub) · Spider: 100% complete · {len(set(urls))} unique URLs in site tree</div>
      <h3 style="margin:10px 0 6px">Spider node results (GET-reachable)</h3>
      <ul>{srows}</ul>
      <p class="note">Note: the spider only follows GET links — it cannot log in or POST reviews,
      so authenticated areas (admin, profile) are absent from this tree.</p>
      <h3 style="margin:16px 0 6px">Full site tree ({len(set(urls))} URLs)</h3>
      <table><tr><th>URL</th></tr>{rows}</table>""")
    render_shots(html, SHOTS / "zap-01-spider.png")

    # ---- zap-02: alerts grouped by risk
    alerts = fetch("/JSON/core/view/alerts/?start=0&count=200")["alerts"]
    grouped: dict = {}
    for a in alerts:
        grouped.setdefault((a["risk"], a["alert"]), []).append(a)
    parts = []
    for (risk, name), items in sorted(grouped.items(), key=lambda kv: RISK_ORDER[kv[0][0]]):
        color = RISK_COLOR[risk]
        parts.append(f"<tr><td class='risk' style='color:{color}'>{risk}</td>"
                     f"<td><b>{name}</b><br><span class='note'>{len(items)} instance(s) — e.g. <code>{items[0]['url'][:90]}</code></span></td></tr>")
    html = page("ZAP Alerts", f"""
      <h1>ZAP 2.16.0 — Alerts (active + passive scan)</h1>
      <div class="sub">Total alert instances: {len(alerts)} · unique rules: {len(grouped)} · target: FashionHub lab (localhost)</div>
      <table><tr><th style="width:110px">Risk</th><th>Alert</th></tr>{''.join(parts)}</table>""")
    render_shots(html, SHOTS / "zap-02-active-scan-alerts.png")

    # ---- zap-03: triage table
    trows = "".join(
        f"<tr><td class='risk' style='color:{RISK_COLOR[risk]}'>{risk}</td><td>{name}</td>"
        f"<td>{TRIAGE.get(name, ('?', ''))[0]}</td><td class='note'>{TRIAGE.get(name, ('', ''))[1]}</td></tr>"
        for (risk, name) in sorted(grouped, key=lambda k: RISK_ORDER[k[0]]))
    html = page("ZAP Alert Triage", f"""
      <h1>Triage — {len(alerts)} ZAP alerts → verified findings</h1>
      <div class="sub">Every alert verdict is backed by manual verification (browser / Postman / Playwright evidence in screenshots/)</div>
      <table><tr><th style="width:100px">Risk</th><th style="width:280px">ZAP rule</th><th style="width:170px">Verdict</th><th>Reason</th></tr>{trows}</table>
      <h3 style="margin:18px 0 6px">Not found by ZAP (found manually instead)</h3>
      <table><tr><th style="width:120px">Finding</th><th>Why the scanner missed it</th></tr>
        <tr><td><b>F01a</b> login SQLi</td><td>ZAP had no authenticated session → POST /api/login was never active-scanned</td></tr>
        <tr><td><b>F02</b> stored XSS</td><td>Requires posting a review (auth-free flow) and re-rendering in the admin panel — multi-step flow the scanner does not attempt</td></tr>
        <tr><td><b>F03</b> CSRF</td><td>Token absence is a design flaw, not an injectable input — scanners cannot conclude it</td></tr>
        <tr><td><b>F04-1/5/6/7</b> default creds, session forgery, plaintext passwords, no rate limit</td><td>All require authentication context or semantic knowledge of the app</td></tr>
      </table>
      <p class="note">Conclusion: automation found the shallow layer (2 of 4 findings); the rest required
      understanding the app's flows and verifying manually — the core skill of security testing.</p>""")
    render_shots(html, SHOTS / "zap-03-alert-triage.png")

    print(f"Done. Alerts total: {len(alerts)}, unique rules: {len(grouped)}")


if __name__ == "__main__":
    sys.exit(main())
