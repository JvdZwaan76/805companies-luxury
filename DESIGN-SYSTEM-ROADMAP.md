# 805 LifeGuard — Design System Improvements Roadmap

**Audit date:** May 4, 2026
**Auditor:** Post-migration design system review
**Scope:** All 12 production HTML pages + `css/luxury-theme.css` + `css/faq-enterprise.css`

This roadmap is organized as **prioritized phases**. Each phase ships value
independently — you can tackle Phase 1 in a half-day, Phase 2 over a week,
Phase 3 as time permits.

---

## TL;DR — What's good, what's not

**Current state is solid for a first-generation luxury theme.** The design
tokens are sensible, the typography pairs (Playfair Display + Inter) are
appropriate for the brand, touch targets meet ADA on key controls, and you
already have `prefers-reduced-motion` and `prefers-contrast` support.

**Three architectural gaps** are holding it back from "enterprise" grade:

1. **Inline style sprawl** — `contact.html` has 89 inline `style=""`
   attributes; `faq.html` has 112. Every one of them is a CSS rule that
   should live in a class and instead lives in HTML, which means it can't
   be themed, can't be overridden by media queries, and bloats every page
   load. This is the highest-impact thing to fix.

2. **Breakpoint inconsistency** — the main CSS uses `768px` 24 times,
   `769px` 14 times (a flip-flop pattern that should just be `min-width:
   768.01px` once for clarity), `480px` only 4 times, `1024px` only once.
   There's no formal breakpoint scale.

3. **Missing modern CSS features** — no `:focus-visible` styles, no dark
   mode, no CSS layers, no logical properties. These aren't blockers but
   they're table stakes for an "enterprise" classification in 2026.

The rest of this doc gives you the fix path.

---

## PHASE 1 — Inline style elimination (HIGH PRIORITY)

**Problem.** `contact.html` and `faq.html` were built with inline `style=""`
attributes instead of CSS classes. This breaks the design system contract:
when a token changes, those pages don't get the update.

**Quantification.**

| File | Inline `style=""` count | Estimated CSS size if extracted |
|------|------------------------:|--------------------------------:|
| contact.html | 89 | ~6 KB |
| faq.html | 112 | ~8 KB |
| testimonials.html | 9 | ~600 bytes |
| about.html | 7 | ~500 bytes |
| hoa.html | 7 | ~500 bytes |
| pool-cleaning.html | 7 | ~500 bytes |
| All others | ≤5 each | ~3 KB |

**Recommendation.** Extract repeated inline-style patterns into reusable
utility classes in `css/luxury-theme.css`. The most-repeated patterns I
saw on contact.html:

```css
/* Service option card pattern (repeated 6x in contact.html) */
.service-option-card {
    position: relative;
    border: 2px solid var(--color-border-primary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4);
    cursor: pointer;
    transition: var(--transition-fast);
    background: var(--color-white);
    min-height: 64px; /* mobile touch target */
}

.service-option-card:hover {
    border-color: var(--color-secondary);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -8px rgb(0 0 0 / 0.1);
}

.service-option-card.exclusive {
    border-color: var(--color-secondary);
    background: linear-gradient(135deg, rgba(184, 160, 130, 0.05), rgba(160, 135, 108, 0.08));
}

/* Hidden checkbox pattern */
.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Form label icon pattern */
.form-label-icon {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-weight: 600;
    color: var(--color-primary-darkest);
    margin-bottom: var(--spacing-2);
    font-size: 0.9375rem;
}
```

**Effort:** ~4 hours per page, low risk (no visual change, just refactor).
**Impact:** Cleaner HTML, smaller pages over the wire (gzip works much
better on repeated CSS than repeated inline attributes), single source of
truth for component styling.

---

## PHASE 2 — Formalize the breakpoint scale (MEDIUM PRIORITY)

**Problem.** The site uses `768px` heavily but mixes in `769px`, `480px`,
`992px`, `1024px`, `640px` ad-hoc. There's no codified scale.

**Recommendation.** Adopt a 5-tier mobile-first breakpoint scale and use it
everywhere:

```css
:root {
    --bp-xs:  480px;   /* Small phones — single column, larger touch */
    --bp-sm:  640px;   /* Large phones / portrait tablets */
    --bp-md:  768px;   /* Tablets / small laptops — current primary */
    --bp-lg: 1024px;   /* Laptops / desktops — multi-column starts */
    --bp-xl: 1280px;   /* Large desktops — max content width */
}
```

CSS custom properties can't be used inside `@media` queries directly, but
you can establish the scale as documented constants and use them
consistently:

```css
/* mobile-first: base styles target smallest screen, then progressively enhance */
.policy-layout {
    display: grid;
    grid-template-columns: 1fr; /* mobile: stacked */
    gap: var(--spacing-6);
}

@media (min-width: 768px) {  /* --bp-md */
    .policy-layout {
        grid-template-columns: 280px 1fr; /* tablet+: sidebar appears */
        gap: var(--spacing-12);
    }
}

@media (min-width: 1280px) { /* --bp-xl */
    .policy-layout {
        gap: var(--spacing-16);
    }
}
```

**Always prefer `min-width`** (mobile-first) over `max-width` (desktop-first).
The current CSS mixes both. Mobile-first is more cache-friendly because
mobile users (the majority) don't need to download desktop styles they'll
never use.

**Effort:** ~1 day audit + refactor across all CSS files.
**Impact:** Predictable responsive behavior, easier debugging, faster CSS.

---

## PHASE 3 — Modern CSS features (MEDIUM PRIORITY)

### 3.1 — Add `:focus-visible` styles (a11y)

Currently no `:focus-visible` rules. This means keyboard users see
inconsistent focus indicators across pages — and on some interactive
elements, none at all. WCAG 2.4.7 requires visible focus.

```css
/* Replace any :focus-only rules with :focus-visible for keyboard-only focus */
:focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 2px;
    border-radius: var(--radius-base);
}

/* Remove default outline only when :focus-visible isn't matched */
:focus:not(:focus-visible) {
    outline: none;
}

/* For dark backgrounds (overlay nav, hero) */
.nav-overlay :focus-visible,
.hero :focus-visible {
    outline-color: var(--color-secondary-light);
    outline-offset: 3px;
}
```

**Effort:** 1 hour. **Impact:** ADA compliance + better keyboard UX.

### 3.2 — Add print stylesheet refinement

The site has `@media print` already. Audit it and confirm:

- Navigation, footer portals, and CTAs hidden when printing
- Background carousels disabled (waste ink)
- Insurance, contact info, and dates visible
- Page breaks before each major section in privacy/terms

Add a small block to your print CSS:

```css
@media print {
    .header,
    .nav-overlay,
    .footer-portals,
    .breadcrumbs,
    .consultation-btn,
    .hero-buttons,
    .footer-bottom { display: none !important; }

    .policy-section {
        page-break-inside: avoid;
        page-break-after: auto;
    }

    .policy-section h2 {
        page-break-after: avoid;
    }

    a[href]::after {
        content: " (" attr(href) ")";
        font-size: 0.85em;
        color: #555;
    }
}
```

### 3.3 — Add CSS layers for predictable cascade

`@layer` lets you control specificity priority without `!important` battles.
Useful for the inline policy-page styles I added — they currently rely on
load order to override `luxury-theme.css`. Layers make this explicit:

```css
@layer reset, base, tokens, components, utilities, page-specific;

/* In luxury-theme.css */
@layer reset { /* ... */ }
@layer base { /* body, headings, links */ }
@layer tokens { :root { --color-primary: ...; } }
@layer components { .btn, .card, .hero, ... }
@layer utilities { .visually-hidden, .text-center, ... }

/* In page-specific inline styles */
@layer page-specific { .policy-hero { ... } }
```

Browser support: 95%+ in 2026, safe to use.

**Effort:** Half-day. **Impact:** Eliminates `!important` debt, makes the
cascade understandable.

### 3.4 — Add prefers-color-scheme dark mode (LOW PRIORITY for this brand)

The luxury aesthetic of 805 LifeGuard works best in light mode — the gold
accent on white is the brand. Dark mode is a nice-to-have, not a must.
**Skip unless analytics shows >20% of visitors using dark mode**.

If you do want it, the right pattern:

```css
:root {
    color-scheme: light dark;
    --color-bg-primary: #FFFFFF;
    --color-text-primary: #0F0F0F;
}

@media (prefers-color-scheme: dark) {
    :root {
        --color-bg-primary: #0F0F0F;
        --color-text-primary: #F5F2ED;
        --color-border-primary: #2A2A2A;
        /* secondary gold stays the same — it's the brand */
    }
}
```

---

## PHASE 4 — Mobile-first verification (HIGH PRIORITY for new pages)

**Problem.** Several pages have desktop-first thinking baked in. Symptoms
to check on each page at 375px (iPhone SE) viewport:

| Page | Specific things to verify on mobile |
|------|-------------------------------------|
| index.html | Hero carousel sizes correctly; CTAs stack vertically |
| services.html | Service cards stack to 1 column; no horizontal scroll |
| about.html | Founder bio image scales; quote callout doesn't overflow |
| contact.html | Form inputs are full-width; checkbox cards readable |
| faq.html | Accordion items expand correctly; search box is reachable |
| hoa.html | Tier-comparison cards stack; testimonials don't break |
| pool-cleaning.html | Service grid → single column; pricing-free CTAs visible |
| portfolio.html | Image grid → single column with proper aspect ratios |
| testimonials.html | Stars render; quotes don't overflow card edges |
| privacy.html / terms.html | TOC sidebar collapses above content; no horizontal scroll |
| insurance.html | Coverage cards stack; HOA section legible |

**The fix pattern** (apply to any page that breaks):

```css
/* Always start with mobile, then enhance */
.some-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
    /* base touch target padding */
    padding: var(--spacing-4);
}

@media (min-width: 768px) {
    .some-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: var(--spacing-6);
        padding: var(--spacing-8);
    }
}
```

**Tooling.** Use Chrome DevTools' device toolbar with these viewports:
- iPhone SE (375 × 667) — smallest active iPhone
- iPhone 14 Pro (393 × 852) — modern phone
- iPad Mini (768 × 1024) — small tablet
- iPad Pro (1024 × 1366) — large tablet
- Galaxy Fold (280 × 653) — narrowest realistic

If any of these horizontal-scroll, that's a P1 bug.

---

## PHASE 5 — Performance (LOW PRIORITY — already good)

Your current setup is performance-conscious:

- ✓ Critical CSS inlined per-page (instant first paint)
- ✓ `font-display: swap` via Google Fonts query
- ✓ Main CSS deferred via `preload` + `onload` swap
- ✓ Font Awesome deferred the same way
- ✓ Hero images preloaded
- ✓ `loading="lazy"` on below-the-fold images

**Marginal wins available:**

1. **Subset Google Fonts** — currently loading 6 weights of Playfair
   Display and 7 weights of Inter. Audit which weights are actually used
   in the rendered pages (probably 400/600/700) and trim the rest.
   ~30 KB savings.

2. **Self-host fonts** — Google Fonts CDN is fine but self-hosted with
   `Cache-Control: max-age=31536000, immutable` is faster on repeat
   visits. Use `google-webfonts-helper` to generate a self-host bundle.

3. **Preconnect to Cloudflare CDN** — already done. Good.

4. **Image responsive sizing** — your `<picture>` elements already serve
   WebP and multiple sizes. Excellent. Add `fetchpriority="high"` to
   the LCP hero image for an extra ~100ms LCP improvement.

   ```html
   <img src="hero-1920x1080.jpg"
        fetchpriority="high"
        loading="eager"
        decoding="async">
   ```

5. **Move the deferred `luxury-app.js` load earlier** — `requestIdleCallback`
   waits until the browser is idle. On slow phones that can be several
   seconds. Consider `setTimeout(loadMainScript, 100)` after the critical
   render path completes.

**Effort total:** Half-day. **Impact:** ~10–20% faster perceived load on
mobile.

---

## PHASE 6 — Token expansion (LOW PRIORITY)

Your token system covers colors, typography, spacing, radius, shadows.
Three additions that make the system more robust:

```css
:root {
    /* Existing tokens unchanged */

    /* NEW: Easing tokens */
    --ease-in:        cubic-bezier(0.4, 0, 1, 1);
    --ease-out:       cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
    --ease-elegant:   cubic-bezier(0.23, 1, 0.32, 1);  /* the one you use for logo entrance */

    /* NEW: Duration tokens */
    --duration-instant: 100ms;
    --duration-fast:    200ms;
    --duration-base:    300ms;
    --duration-slow:    500ms;
    --duration-deliberate: 900ms;

    /* NEW: Z-index scale (you have a few — formalize) */
    --z-base:        0;
    --z-dropdown:  100;
    --z-sticky:    200;
    --z-overlay:  1050;
    --z-modal:    1060;
    --z-header:   1070;
    --z-hamburger:1080;
    --z-toast:    1090;
    --z-tooltip:  1100;
}
```

Then `transition: all var(--duration-base) var(--ease-in-out)` is more
readable and consistent than the current ad-hoc cubic-beziers scattered
through the CSS.

---

## Anti-patterns to avoid going forward

These came up while auditing — pin them somewhere visible to whoever
edits the site next:

1. **Never use inline `style="..."` attributes for repeated patterns.**
   If a style appears more than once, it's a class.

2. **Never hardcode hex colors in HTML or component CSS** — always go
   through `var(--color-...)`. Found 36 raw hex colors used directly in
   the main CSS. Each is a small token violation; over time they
   compound into a maintenance burden.

3. **Never use `!important` to win specificity battles.** Use `@layer`
   or rewrite the selector. Audit any current `!important` rules and
   plan to refactor them.

4. **Never invent a new breakpoint mid-page.** Stick to the 5-tier scale
   (`480 / 640 / 768 / 1024 / 1280`).

5. **Never write `max-width` media queries unless the rule is
   genuinely about excluding desktop.** Default to mobile-first
   `min-width`.

6. **Never reference a CSS variable without a fallback in critical
   inline CSS.** Fallbacks are insurance against the deferred main CSS
   not loading: `color: var(--color-secondary, #B8A082);`.

7. **Never load the same font from two CDNs or two query strings.** The
   broken privacy/terms pages were doing this — caused FOUT and double
   download cost.

---

## Suggested timeline

If you want a clean, prioritized rollout:

| Week | Phase | Deliverable |
|------|-------|-------------|
| 1 | Phase 1 (contact.html) | All inline styles → utility classes |
| 2 | Phase 1 (faq.html) | All inline styles → utility classes |
| 3 | Phase 2 | Breakpoint scale codified |
| 4 | Phase 3.1 + 3.2 + 3.3 | `:focus-visible` + print + `@layer` |
| 5 | Phase 4 | Mobile-first audit on every page at 5 viewports |
| 6 | Phase 5 + 6 | Performance polish + token expansion |

Each phase is independently shippable. None of them require coordinated
deploys with other systems. All of them are reversible with `git revert`.

---

## What I'm NOT recommending

A few things might seem like obvious enterprise-grade additions but
aren't worth the effort for this site:

- **Tailwind / utility-first migration** — you have a custom design
  system that fits the brand. Tailwind would either bloat with custom
  config or fight the existing tokens.
- **Component library extraction (Stencil, Lit, Svelte)** — overkill for
  a 12-page marketing site. Plain CSS classes are the right tool.
- **CSS-in-JS** — adds runtime cost for no real benefit at this scale.
- **Build pipeline (Vite, Rollup, Parcel)** — your current Cloudflare
  Pages flow with hand-edited HTML works. Don't add complexity without
  a forcing function.
- **Storybook** — you have 12 pages and ~25 unique components. The
  overhead doesn't pay back. A simple `kitchen-sink.html` page that
  renders every component would do the same job.

The honest assessment: **your design system is already 80% of the way
there**. The remaining 20% is mostly hygiene (Phase 1) and modern CSS
features (Phase 3). It does not need a rewrite.
