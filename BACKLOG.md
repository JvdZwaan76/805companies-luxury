# 805lifeguard.com — Backlog

Living document. Top of list = highest priority. Edit freely; this is the source of truth, not the continuation doc.

Last updated: 2026-05-24

---

## Current state

- **Production**: serving v1.4 (Cloudflare Pages deployment `97f9c1ab`, from PR #24).
- **Repository `main`**: at commit `7087cf9` — contains merged but **not currently deployed** work from v1.4.1 (badge unification) and v1.4.2 (testimonials hero architectural extraction).
- **Blocker for v1.4.2 promotion**: cache infrastructure bug (see top-priority item below). Re-promoting v1.4.2 via Cloudflare Pages without fixing this first will reproduce the May 24 failure.

---

## Top priority

### 1. v1.5.0 — Cache & asset infrastructure (design-system layer)

**Why this is blocking**: `_headers` ships `cache-control: public, max-age=31536000, immutable` for `/css/*` and `/js/*` against unversioned filenames. The `immutable` directive is a contract that the content at a URL will never change — true for content-hashed paths (`luxury-theme.7087cf9.css`), false for unversioned paths. Mismatch caused the May 24 production breakage: new HTML referencing `.reviews-showcase` was served against edge-cached v1.4 CSS with no `.reviews-showcase` rule, producing unstyled markup on `805lifeguard.com`. Will recur on any future CSS/JS change until fixed.

**Scope**:
- Decision: Option A (unversioned paths + short TTLs, e.g., `max-age=300, must-revalidate`) or Option B (content-hashed filenames + long TTLs + build step to update HTML refs). A is pragmatic; B is the proper long-term answer.
- Update `_headers` to match the chosen strategy
- If B: add build step (likely in `deploy.yml` or a pre-commit hook) to hash filenames and rewrite HTML references
- Add Cloudflare cache purge to `.github/workflows/deploy.yml` as a safety net (requires `CLOUDFLARE_API_TOKEN` as GitHub secret)
- Document the cache/asset contract in `DESIGN-SYSTEM.md`
- After infrastructure is fixed and verified: re-promote v1.4.2 (already on main at 7087cf9) via Cloudflare Pages dashboard, then tag `v1.4.2-testimonials-hero-architecture` and create GitHub Release
- Ship as `v1.5.0` (minor bump, infrastructure contract change)

---

## High priority

### 2. DESIGN-SYSTEM.md updates
- Document "homepage hero is intentionally bare" (no badge) as a sanctioned design-system variant
- Document legal-doc hero variant (privacy/terms: badge → h1 no `.hero-title` class → subtitle → `.last-updated`)
- After v1.5.0 ships: document the cache/asset contract

### 3. contact.html hero audit
Investigate why contact.html doesn't use the canonical `.hero-content` structure. Decide: align it with the 5-element canonical pattern, or document as a third sanctioned variant.

### 4. Reviews API CORS — Worker allowlist update
- Worker source location currently UNKNOWN — find it first
- Update CORS allowlist on `805-lifeguard-reviews-api.jaspervdz.workers.dev`:
  - Add `*.805companies-luxury.pages.dev` (currently blocked — causes staging preview to show fallback testimonials instead of real reviews, hindering staging visual verification)
  - Remove stale `luxury.805companies.com`
- Production (`805lifeguard.com`) is already allowlisted and working correctly

---

## Medium priority

### 5. Stale comment cleanup pass
- `<!-- Enhanced Hero Section with Live Reviews Integration -->` at testimonials.html line 459 — now stale, reviews integration no longer in hero
- CSS comment "Enhanced Reviews Integration in Hero - PRESERVED DESIGN SYSTEM" before `.reviews-integration` rule — stale post-v1.4.2

### 6. Orphan asset cleanup
- ~24 unreferenced `.webp` files in `/images/about/` + `/images/testimonials/` — design system standardized JPG-only in v1.3
- Legacy `testimonials-hero-{1600x1200,800x600}.jpg` — no live references post-v1.4

### 7. Carousel double-fetch race (v1.3.2 candidate)
Slide 4/5 race condition between `updateSlideBackground` and `preloadRemainingImages`.

### 8. Viewport-aware variants for service tiles (v1.3.3 candidate)

### 9. Cloudflare modernization bundle
- Rename repo `805companies-luxury` → `805lifeguard`
- Migrate `cloudflare/pages-action@v1` → `cloudflare/wrangler-action@v3`
- Address `productionBranch` deprecation
- Tighten `directory: ./` asset scope
- CI hardening: `permissions: contents: read` in `deploy.yml`
- (Cache purge step from v1.5.0 may end up landing here instead of v1.5.0 — TBD based on scope)

---

## Low priority

### 10. AWS Lightsail WordPress decommission
Snapshot already taken May 23, 2026.

### 11. Google Analytics dual-tag documentation
Document that `G-4XMS9BPWGV` + `G-F75463BEKM` dual-tag setup is intentional.

### 12. PageSpeed Insights deep-dive session
Full PSI audit on prod homepage + testimonials + about (mobile + desktop). Categorize findings: actionable wins / unclear / won't-fix.

### 13. Inline CSS audit across all pages
Consolidate `.hero`, `.hero-buttons`, button CSS forks into `luxury-theme.css`.

### 14. Repo rename
`805companies-luxury` → `805lifeguard` (umbrella branding artifact from earlier project structure). Bundled into Cloudflare modernization (#9) for consolidated migration.

---

## Workflow conventions (reference)

- Branch flow: `feat/<name>` → `staging` → `main`, all via PRs (`gh pr create`)
- Edit pattern: "verify-find-string" — Python heredocs with `assert html.count(old_chunk) == 1` before `.replace()`
- After main merge: tag, GitHub Release, Drive backup zip
- Backups: drive.google.com → My Drive → 805companies-luxury-backups, under `agiajasper@gmail.com`
- Feature branches preserved (not deleted) until prod-verified
- PR merge method: regular merge commit (NOT squash) — preserves staging integration history

---

## Recent ship log

- **2026-05-24**: PR #27 merged to main (v1.4.1 + v1.4.2 bundled), deployed as `a5844862`, **rolled back same evening** due to cache infrastructure issue. Production reverted to v1.4 (`97f9c1ab`). Diagnosis logged; v1.5.0 cache work required before re-promotion.
- **2026-05-23 evening**: v1.4 testimonials carousel design-system migration shipped (PR #24, tag `v1.4-testimonials-carousel`).
