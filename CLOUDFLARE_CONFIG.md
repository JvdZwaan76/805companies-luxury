📸 805lifeguard.com Configuration Snapshot
Date: May 3, 2026 — Post-migration, fully working state (after _redirects fix)

DNS Records
Type	Name	Content	Proxied	TTL
CNAME	805lifeguard.com	805companies-luxury.pages.dev	Yes	Auto
CNAME	www.805lifeguard.com	805companies-luxury.pages.dev	Yes	Auto
TXT	805lifeguard.com	google-site-verification=...	No	Auto
TXT	www.805lifeguard.com	33abced9c4369915	No	Auto
SSL/TLS Settings
Setting	Value
SSL Mode	Full (Strict)
Minimum TLS Version	1.2
TLS 1.3	On
Always Use HTTPS	On
Automatic HTTPS Rewrites	On
Opportunistic Encryption	On
Certificate	Universal (Let's Encrypt) — *.805lifeguard.com, 805lifeguard.com
Performance Settin*_
Setting	Value
Brotli	On
Early Hints	On
Always Online	On
Cache Level	Aggressive
Rocket Loader	Off
Auto Minify	Off (deprecated Aug 2024)
Pages Proje*_
Setting	Value
Project Name	805companies-luxury
Pages Subdomain	805companies-luxury.pages.dev
Production Branch	main
Pages Custom Domai*_
Domain	Status
805lifeguard.com	Active
www.805lifeguard.com	Active
admin.805companies.com	Active
client.805companies.com	Active
staff.805companies.com	Active
Zone In*_
Setting	Value
Zone Status	Active
Nameservers	julian.ns.cloudflare.com, tina.ns.cloudflare.com
Plan	Free
_redirects File (Working Version)
# =============================================================================
# SAFE _redirects - No query string rules (Pages doesn't support them)
# =============================================================================

# Important old WordPress clean URLs
/meet-the-team/      /about.html           301
/meet-the-team       /about.html           301
/privacy-policy/     /privacy.html         301
/privacy-policy      /privacy.html         301
/now-hiring/         /contact.html         301
/now-hiring          /contact.html         301
/shop/               /services.html        301
/shop                /services.html        301

# WooCommerce legacy paths
/cart/               /                     301
/cart                /                     301
/checkout/           /                     301
/checkout            /                     301
/my-account/         /                     301
/my-account          /                     301

# Block old WP infrastructure
/feed/               /                     301
/wp-json/*           /                     301
/wp-login.php        /                     301
/wp-admin/*          /                     301
/xmlrpc.php          /about.html           301
/author/*            /about.html           301
⚠️ Known Issue — Do NOT do this*
Cloudflare Pages _redirects does NOT support query string matching. Rules like /?page_id=2 are interpreted as just /, creating an infinite redirect loop. Use a Pages Function instead if you need query string redirects.