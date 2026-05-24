#!/usr/bin/env python3
"""
805 LifeGuard — CCPA/CPRA consent patcher
Applies three changes to every page in PAGES:
  1. Inserts Consent Mode v2 default-deny snippet immediately AFTER <head>
     and BEFORE the existing GTM <script> block.
  2. Adds the cookie-consent CSS preload + noscript fallback and the JS
     deferred-load tag in <head>.
  3. Adds two new buttons to the footer .legal-links block:
       - Privacy Preferences
       - Do Not Sell or Share My Personal Information
Idempotent: running multiple times is safe (each insertion checks for a marker).
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    'about.html', 'careers.html', 'contact.html', 'faq.html', 'hoa.html',
    'index.html', 'insurance.html', 'pool-cleaning.html', 'portfolio.html',
    'privacy.html', 'services.html', 'terms.html', 'testimonials.html',
]

# -----------------------------------------------------------------
# 1. CONSENT MODE V2 SNIPPET — inserted BEFORE GTM
# -----------------------------------------------------------------
CONSENT_MODE_SNIPPET = """<!-- Google Consent Mode v2 — Default Deny (must load BEFORE GTM/GA) -->
<script>
(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  // Default-deny per CCPA/CPRA opt-out model + GDPR baseline.
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  // Apply stored consent or GPC signal early so GTM fires correctly.
  try {
    var gpc = (navigator.globalPrivacyControl === true);
    var raw = localStorage.getItem('805_consent_v1');
    var c = raw ? JSON.parse(raw) : null;
    if (gpc) {
      gtag('consent', 'update', {
        'ad_storage':'denied','ad_user_data':'denied',
        'ad_personalization':'denied','analytics_storage':'denied'
      });
    } else if (c && c.version === '1.0.0') {
      gtag('consent', 'update', {
        'ad_storage':         c.advertising ? 'granted' : 'denied',
        'ad_user_data':       c.advertising ? 'granted' : 'denied',
        'ad_personalization': c.advertising ? 'granted' : 'denied',
        'analytics_storage':  c.analytics   ? 'granted' : 'denied'
      });
    }
  } catch(e) { /* fail-safe: default-deny stays in effect */ }
})();
</script>
<!-- End Google Consent Mode v2 -->
"""

CONSENT_MODE_MARKER = 'Google Consent Mode v2'
GTM_OPEN_MARKER = '<!-- Google Tag Manager -->'

# -----------------------------------------------------------------
# 2. CSS + JS LOAD TAGS — added inside <head>, after the main stylesheet
# -----------------------------------------------------------------
CC_HEAD_BLOCK = """
    <!-- Cookie Consent (CCPA/CPRA) — self-hosted -->
    <link rel="preload" href="/css/cookie-consent.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/cookie-consent.css"></noscript>
    <script src="/js/cookie-consent.js" defer></script>
    <!-- End Cookie Consent -->
"""

CC_HEAD_MARKER = '/css/cookie-consent.css'
# Insert AFTER this line of the existing main CSS block
CC_HEAD_ANCHOR = '<noscript><link rel="stylesheet" href="/css/luxury-theme.css"></noscript>'

# -----------------------------------------------------------------
# 3. FOOTER LINKS — added inside <div class="legal-links">
# -----------------------------------------------------------------
CC_FOOTER_LINKS = """                            <button type="button" class="cc-footer-trigger" onclick="return openPrivacyPreferences();" aria-label="Open privacy preferences">Privacy Preferences</button>
                            <button type="button" class="cc-footer-trigger" onclick="return doNotSellMyInfo();" aria-label="Do Not Sell or Share My Personal Information">Do Not Sell or Share My Personal Information</button>
"""

CC_FOOTER_MARKER = 'cc-footer-trigger'
LEGAL_LINKS_OPEN = '<div class="legal-links">'
LEGAL_LINKS_CLOSE = '</div>'


def patch_one(path: Path) -> dict:
    text = path.read_text(encoding='utf-8')
    original = text
    changes = {'consent_mode': False, 'cc_head': False, 'cc_footer': False}

    # ---- 1. Consent Mode snippet ----
    if CONSENT_MODE_MARKER not in text:
        if GTM_OPEN_MARKER in text:
            text = text.replace(
                GTM_OPEN_MARKER,
                CONSENT_MODE_SNIPPET + GTM_OPEN_MARKER,
                1
            )
            changes['consent_mode'] = True
        else:
            raise RuntimeError(f"GTM marker not found in {path.name}")

    # ---- 2. CSS + JS in <head> ----
    if CC_HEAD_MARKER not in text:
        if CC_HEAD_ANCHOR in text:
            text = text.replace(
                CC_HEAD_ANCHOR,
                CC_HEAD_ANCHOR + CC_HEAD_BLOCK,
                1
            )
            changes['cc_head'] = True
        else:
            raise RuntimeError(f"luxury-theme.css anchor not found in {path.name}")

    # ---- 3. Footer legal-links additions ----
    if CC_FOOTER_MARKER not in text:
        # Find the legal-links div block and insert before its closing </div>
        pattern = re.compile(
            r'(<div class="legal-links">)(.*?)(\n\s*</div>)',
            flags=re.DOTALL
        )

        def repl(m):
            opener, inner, closer = m.group(1), m.group(2), m.group(3)
            return opener + inner + '\n' + CC_FOOTER_LINKS.rstrip('\n') + closer

        new_text, n = pattern.subn(repl, text, count=1)
        if n == 1:
            text = new_text
            changes['cc_footer'] = True
        else:
            raise RuntimeError(f"legal-links block not found in {path.name}")

    if text != original:
        path.write_text(text, encoding='utf-8')

    return changes


def main():
    results = []
    failures = []
    for name in PAGES:
        p = ROOT / name
        if not p.exists():
            failures.append((name, 'file not found'))
            continue
        try:
            ch = patch_one(p)
            results.append((name, ch))
        except Exception as e:
            failures.append((name, str(e)))

    print(f"Patched {len(results)} file(s):")
    print(f"{'file':<24} consent_mode  cc_head  cc_footer")
    print("-" * 60)
    for name, ch in results:
        print(f"{name:<24} {str(ch['consent_mode']):<13} {str(ch['cc_head']):<8} {str(ch['cc_footer'])}")

    if failures:
        print(f"\n{len(failures)} failure(s):")
        for name, err in failures:
            print(f"  {name}: {err}")
        sys.exit(1)


if __name__ == '__main__':
    main()
