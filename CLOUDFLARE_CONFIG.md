# 🛡️ 805lifeguard.com — Cloudflare Configuration Snapshot

> **Purpose:** Emergency reference document. If the site becomes unresponsive, use this document to verify and restore the exact working Cloudflare configuration.
>
> **Last verified working:** May 3, 2026 — Post AWS→Cloudflare migration, fully operational.
>
> **Maintainer:** Jasper van der Zwaan / 805 Lifeguard LLC

---

## ⚠️ Critical Rules — Read Before Making Any Changes

1. **Never add a Cloudflare Redirect Rule for www→root.** Cloudflare Pages manages this internally. A separate redirect rule creates an `ERR_TOO_MANY_REDIRECTS` loop.
2. **Never remove `www.805lifeguard.com` from Pages Custom Domains** without simultaneously ensuring the www CNAME DNS record is also removed. Mismatches cause `ERR_NAME_NOT_RESOLVED`.
3. **Always check Pages Custom Domains BEFORE creating any redirect rule.** The Pages project manages its own internal redirect between root and www.
4. **SSL must remain on Full (Strict).** Changing to Flexible causes redirect loops.
5. **Do not add a wildcard `*` A or CNAME record** pointing to the old EC2 IP (`34.213.2.106`). That server no longer exists.

---

## 📋 DNS Records

> Location: Cloudflare → 805lifeguard.com → DNS → Records

| Type  | Name                  | Content                              | Proxied | TTL  |
|-------|-----------------------|--------------------------------------|---------|------|
| CNAME | `805lifeguard.com`    | `805companies-luxury.pages.dev`      | ✅ Yes  | Auto |
| CNAME | `www.805lifeguard.com`| `805companies-luxury.pages.dev`      | ✅ Yes  | Auto |
| TXT   | `805lifeguard.com`    | `google-site-verification=_Utiy8mSPuxn82MAHil_ANOFHcauqcPIqgfHMHHriBU` | ❌ No | Auto |
| TXT   | `www.805lifeguard.com`| `33abced9c4369915`                   | ❌ No   | Auto |

**Nameservers (do not change):**
- `julian.ns.cloudflare.com`
- `tina.ns.cloudflare.com`

### ❌ Records That Must NOT Exist
| Type | Name | Reason |
|------|------|--------|
| A    | `*`  | Wildcard pointing to old EC2 — causes traffic to route to dead server |
| TXT  | `_acme-challenge` (any) | Stale SSL challenge tokens from AWS era — deleted May 3, 2026 |
| Any redirect rule | www→root | Creates loop with Pages internal redirect |

---

## 🔒 SSL/TLS Settings

> Location: Cloudflare → 805lifeguard.com → SSL/TLS → Overview

| Setting                    | Value              |
|----------------------------|--------------------|
| **SSL Mode**               | **Full (Strict)**  |
| Minimum TLS Version        | 1.2                |
| TLS 1.3                    | On                 |
| Always Use HTTPS           | On                 |
| Automatic HTTPS Rewrites   | On                 |
| Opportunistic Encryption   | On                 |
| Certificate Type           | Universal (Let's Encrypt, ECDSA) |
| Certificate Coverage       | `805lifeguard.com`, `*.805lifeguard.com` |
| Certificate Expiry         | 2026-07-31 (auto-renews) |

> ⚠️ **Full (Strict) is mandatory.** Any other mode (Flexible, Full) will cause redirect loops with Cloudflare Pages.

---

## ⚡ Performance Settings

> Location: Cloudflare → 805lifeguard.com → Speed / Caching

| Setting           | Value                          |
|-------------------|--------------------------------|
| Brotli            | On                             |
| Early Hints       | On                             |
| Always Online     | On                             |
| Cache Level       | Aggressive                     |
| Rocket Loader     | Off                            |
| Auto Minify       | Off (deprecated August 2024)   |

---

## 📄 Cloudflare Pages Project

> Location: Cloudflare → Workers & Pages → 805companies-luxury

| Setting            | Value                                  |
|--------------------|----------------------------------------|
| Project Name       | `805companies-luxury`                  |
| Pages Subdomain    | `805companies-luxury.pages.dev`        |
| Production Branch  | `main`                                 |
| Build Command      | *(none — static site)*                 |
| Output Directory   | *(root)*                               |

### Pages Custom Domains

> Location: Workers & Pages → 805companies-luxury → Custom Domains

| Domain                      | Status   |
|-----------------------------|----------|
| `805lifeguard.com`          | ✅ Active |
| `www.805lifeguard.com`      | ✅ Active |
| `admin.805companies.com`    | ✅ Active |
| `client.805companies.com`   | ✅ Active |
| `staff.805companies.com`    | ✅ Active |

> ⚠️ **Both `805lifeguard.com` AND `www.805lifeguard.com` must be listed here.** Pages uses these to manage the canonical redirect internally. If `www` is missing, visitors get `ERR_NAME_NOT_RESOLVED` or `Error 1016`.

---

## 📁 _redirects File

> Location: Root of GitHub repo (`/_redirects`) — deployed automatically by Cloudflare Pages

The `_redirects` file handles legacy WordPress URL redirects from the old site. Key rules:

- All `?page_id=` WordPress URLs → redirected to equivalent new pages (301)
- WooCommerce product/cart/checkout URLs → redirected to `/services.html` or `/` (301)
- WordPress admin/feed/xmlrpc paths → redirected to `/` (301)
- **No catch-all `/?*` wildcard** — intentionally removed; caused homepage redirect loop

> ⚠️ Do NOT add any rule that redirects `/` or `/*` back to `www` or to itself.

---

## 🚨 Emergency Recovery Checklist

If the site becomes unresponsive, check in this exact order:

### Step 1 — Identify the error type
| Error | Likely Cause |
|-------|-------------|
| `ERR_TOO_MANY_REDIRECTS` | A redirect rule conflicts with Pages internal redirect |
| `ERR_NAME_NOT_RESOLVED` | DNS CNAME missing or Pages Custom Domain missing |
| `Error 1016 — Origin DNS error` | Pages Custom Domain registered but DNS CNAME missing |
| `521 — Web server is down` | Pages project offline or deployment failed |
| `526 — Invalid SSL certificate` | SSL mode changed away from Full (Strict) |

### Step 2 — ERR_TOO_MANY_REDIRECTS recovery
1. Go to Rules → Redirect Rules → disable or delete any www→root rule
2. Go to Caching → Configuration → Purge Everything
3. Wait 60 seconds and test in a fresh incognito window
4. If still looping: check Pages Custom Domains — both root and www must be listed

### Step 3 — ERR_NAME_NOT_RESOLVED / Error 1016 recovery
1. Check DNS Records — confirm `www CNAME → 805companies-luxury.pages.dev` exists and is Proxied
2. Check Pages Custom Domains — confirm `www.805lifeguard.com` is listed as Active
3. If DNS exists but Pages entry missing: Workers & Pages → 805companies-luxury → Custom Domains → Set up a custom domain → enter `www.805lifeguard.com`
4. If DNS missing: Add record → Type CNAME → Name `www` → Content `805companies-luxury.pages.dev` → Proxied → Save

### Step 4 — Rollback a bad Pages deployment
1. Workers & Pages → 805companies-luxury → Deployments
2. Find the last known-good deployment in the list
3. Click ⋯ → Rollback to this deployment
4. Purge Everything in Caching after rollback

---

## 🗂️ Zone Info

| Setting      | Value                     |
|--------------|---------------------------|
| Zone         | `805lifeguard.com`        |
| Zone Status  | Active                    |
| Plan         | Free                      |
| Account      | `jaspervdz@me.com`        |
| Nameservers  | `julian.ns.cloudflare.com`, `tina.ns.cloudflare.com` |

---

## 📝 Change Log

| Date | Change | Made By | Result |
|------|--------|---------|--------|
| 2026-05-03 | AWS→Cloudflare migration complete | Jasper / Claude | ✅ Site live |
| 2026-05-03 | Deleted 4 stale `_acme-challenge` TXT records | Jasper / Claude | ✅ DNS cleaned |
| 2026-05-03 | Attempted www→root Redirect Rule | Claude | ❌ Caused ERR_TOO_MANY_REDIRECTS — rule deleted |
| 2026-05-03 | Removed `www.805lifeguard.com` from Pages Custom Domains during recovery | Jasper / Claude | ⚠️ Caused Error 1016 on www |
| 2026-05-03 | Re-added `www.805lifeguard.com` to Pages Custom Domains | Jasper / Claude | ✅ www restored |
| 2026-05-03 | Configuration snapshot created and stored in GitHub | Jasper / Claude | ✅ This document |

---

*Document stored at: `/CLOUDFLARE_CONFIG.md` in the 805lifeguard GitHub repo root*
*Next review date: 2026-08-01 (before SSL certificate expiry)*
