# 805lifeguard.com — Backlog

Living document. Top of list = highest priority. Edit freely; this is the source of truth, not the continuation doc.

Last updated: 2026-06-15

---

## Current state

- **Production**: live with v1.5.0 cache-header fix (PR #39, 2026-06-15) on top of the backlog-docs + Worker-fix records (PRs #36/#37) and the 2026-06-14 image de-dup + Yelp CTA fix (PR #35). `/css/*` and `/js/*` now serve `public, max-age=3600, must-revalidate`; images + fonts remain `immutable`.
- **Branches**: `main` and `staging` synced to origin.
- **Rollback anchor**: tag `pre-update-2026-06-14` on origin/main (pre-dates all June work).
- **[VERIFY] v1.4.2 status**: badge-unification + testimonials-hero work (PR #27) was merged to main at `7087cf9` and has remained live through all subsequent June deploys. Treat as live unless a specific regression surfaces.

---

## Top priority

### 1. v1.5.0 — Cache & asset infrastructure  [SHIPPED 2026-06-15]

**DONE (Option A).** `_headers` now caps `/css/*` and `/js/*` at `public, max-age=3600, must-revalidate` (matching the cookie-consent files). Images + fonts deliberately left `immutable` (content genuinely stable). Verified live on staging (DevTools) and production (curl): css/js return 3600 must-revalidate, images still immutable. Closes the May 24 stale-edge failure mode. Shipped via feat/v1.5.0-cache-headers -> PR #38 (staging) -> PR #39 (production).

**One-time purge learning**: after the deploy, production `/js/luxury-app.js` kept serving the OLD `immutable` header (`cf-cache-status: HIT`, `age ~74h`) because an edge node still held a copy cached under the prior 1-year/immutable contract. Fixed with a Custom Purge (Cloudflare -> 805lifeguard.com -> Caching -> Configuration -> Purge Cache -> Custom Purge -> apex + www URLs). After purge it re-cached correctly (`age 0`, new header). **Takeaway**: when changing a Cache-Control directive on a file previously marked `immutable`, existing edge copies won't flip until they age out OR are manually purged. Moot for future css/js content changes (must-revalidate now forces freshness), but relevant if you ever tighten caching on an immutable asset again.

**Optional follow-ups (NOT blocking, separate items):**
- Add a Cloudflare cache-purge step to `.github/workflows/deploy.yml` as an automated safety net (needs `CLOUDFLARE_API_TOKEN` secret). Would have auto-resolved the purge above.
- Document the cache/asset contract in `DESIGN-SYSTEM.md` (see item #2).

<details><summary>Original analysis (kept for reference)</summary>

**Why this is blocking**: `_headers` ships `cache-control: public, max-age=31536000, immutable` for `/css/*` and `/js/*` against unversioned filenames. The `immutable` directive is a contract that the content at a URL will never change — true for content-hashed paths (`luxury-theme.7087cf9.css`), false for unversioned paths. Mismatch caused the May 24 production breakage: new HTML referencing `.reviews-showcase` was served against edge-cached v1.4 CSS with no `.reviews-showcase` rule, producing unstyled markup on `805lifeguard.com`. Will recur on any future CSS/JS change until fixed.

**Scope**:
- Decision: Option A (unversioned paths + short TTLs, e.g., `max-age=300, must-revalidate`) or Option B (content-hashed filenames + long TTLs + build step to update HTML refs). A is pragmatic; B is the proper long-term answer.
- Update `_headers` to match the chosen strategy
- If B: add build step (likely in `deploy.yml` or a pre-commit hook) to hash filenames and rewrite HTML references
- Add Cloudflare cache purge to `.github/workflows/deploy.yml` as a safety net (requires `CLOUDFLARE_API_TOKEN` as GitHub secret)
- Document the cache/asset contract in `DESIGN-SYSTEM.md`
- After infrastructure is fixed and verified: re-promote v1.4.2 if still needed, then tag and create GitHub Release
- Ship as `v1.5.0` (minor bump, infrastructure contract change)
- FIRST: re-verify the `_headers` issue still exists at `bfefe30` — the repo has moved since May 24.

</details>

---

## High priority

### 2. DESIGN-SYSTEM.md updates
- Document "homepage hero is intentionally bare" (no badge) as a sanctioned design-system variant
- Document legal-doc hero variant (privacy/terms: badge → h1 no `.hero-title` class → subtitle → `.last-updated`)
- After v1.5.0 ships: document the cache/asset contract

### 3. contact.html hero audit
Investigate why contact.html doesn't use the canonical `.hero-content` structure. Decide: align it with the 5-element canonical pattern, or document as a third sanctioned variant.

### 4. Reviews API CORS — Worker allowlist [RESOLVED 2026-06-15]
- DONE: added `https://staging.805companies-luxury.pages.dev` to the Worker's `allowedOrigins`. Staging now fetches live reviews; the 7 CORS console errors are gone (verified on staging 2026-06-15).
- Production (`805lifeguard.com`) was already allowlisted and working.
- Remaining (optional, low priority): the stale `luxury.805companies.com` origin is still in the list (harmless, left in place); per-deploy Pages preview URLs (`<hash>.805companies-luxury.pages.dev`) are still not covered because the check is exact-match, not wildcard — only the stable `staging.` alias is allowlisted.

---

## Medium priority

### 5. Instruction detail-gallery image still duplicated
The Instruction gallery primary still reuses `service-swim-lessons-private-800x600` — the same de-dup issue fixed for Lifeguarding + Events on 2026-06-14. Blocked on a real 1-on-1 swim-lesson photo (none in the June batch). Swap when one is captured.

### 6. Stale comment cleanup pass
- `<!-- Enhanced Hero Section with Live Reviews Integration -->` at testimonials.html line ~459 — now stale, reviews integration no longer in hero
- CSS comment "Enhanced Reviews Integration in Hero - PRESERVED DESIGN SYSTEM" before `.reviews-integration` rule — stale post-v1.4.2

### 7. Orphan asset cleanup
- ~24 unreferenced `.webp` files in `/images/about/` + `/images/testimonials/` — design system standardized JPG-only in v1.3
- Legacy `testimonials-hero-{1600x1200,800x600}.jpg` — no live references post-v1.4

### 8. Stray test files
`images/services/test` and `images/hero/carousel/test` — 1-byte leftovers. Remove in a cleanup commit someday.

### 9. Carousel double-fetch race (v1.3.2 candidate)
Slide 4/5 race condition between `updateSlideBackground` and `preloadRemainingImages`.

### 10. Viewport-aware variants for service tiles (v1.3.3 candidate)
`pool-cleaning-hero-1920x1080.webp` loads on mobile when it shouldn't.

---

## Low priority

### 11. AWS Lightsail WordPress decommission
Snapshot already taken May 23, 2026. Confirm it exists, then schedule teardown for a calm weekday.

### 12. Google Analytics dual-tag documentation
Document that `G-4XMS9BPWGV` + `G-F75463BEKM` dual-tag setup is intentional.

### 13. PageSpeed Insights deep-dive session
Full PSI audit on prod homepage + testimonials + about (mobile + desktop). Categorize findings: actionable wins / unclear / won't-fix.

### 13.1 Hero-carousel layout shift (CLS)
Homepage CLS measured ~0.51 ("poor") in a local DevTools Performance run on 2026-06-15 (cold load, network cache disabled). LCP was fine (1.26s, "good"); the problem is layout shift, not load speed. Worst cluster = the hero carousel ("12 shifts", LCP element `div.carousel-slide.active`). **Pre-existing — NOT caused by the v1.5.0 cache work** (cache directives don't affect layout); surfaced during v1.5.0 post-ship testing. Likely cause: the hero/carousel container doesn't reserve layout space before slide images load/transition, so content jumps. Likely fix: set explicit dimensions / `aspect-ratio` on the carousel container (and/or width+height on slide images) so the box is reserved before paint. IMPORTANT: this was a single synthetic local measurement — verify against real-user field data (Chrome UX Report / PageSpeed Insights field data) before investing, since lab CLS on a cold carousel load overstates what real visitors see. Tackle as part of, or just before, item #13.

### 14. Inline CSS audit across all pages
Consolidate `.hero`, `.hero-buttons`, button CSS forks into `luxury-theme.css`.

### 15. Cloudflare modernization bundle
- Rename repo `805companies-luxury` → `805lifeguard` (umbrella branding artifact from earlier project structure)
- Migrate `cloudflare/pages-action@v1` → `cloudflare/wrangler-action@v3`
- Address `productionBranch` deprecation
- Tighten `directory: ./` asset scope
- CI hardening: `permissions: contents: read` in `deploy.yml`
- (Cache purge step from v1.5.0 may land here instead — TBD based on scope)

### 16. BACKUP-LOCATIONS.txt — fix + document the two-account split
Backups live across TWO Google accounts:
- `agiajasper@gmail.com` (locally mounted): dated folders `805lifeguard-backups-YYYYMMDD` (e.g. the May 14 set)
- `me.com` account (NOT mounted locally): flat version-named zips in `My Drive / 805companies-luxury-backups/` — THIS is the canonical folder (holds v1.3 / v1.3.1 / v1.4 / 2026-06-14 image-dedup-yelp-fix zips)
Update BACKUP-LOCATIONS.txt in the canonical folder to record BOTH locations so the gmail-account backups aren't invisible. Browser edit — me.com isn't mounted on this Mac.

---

## Reviews API Worker (reference — IMPORTANT, no Git backup)

The live reviews API is a Cloudflare Worker, NOT in any Git repo:
- **Name:** `805-lifeguard-reviews-api`  •  **URL:** `https://805-lifeguard-reviews-api.jaspervdz.workers.dev`
- **Account:** Cloudflare `Jaspervdz@me.com` (subdomain `jaspervdz.workers.dev`)
- **Edit:** Cloudflare dashboard → Workers & Pages → `805-lifeguard-reviews-api` → **Edit code** → Deploy. Source is dashboard-only (no Git connection), edited inline.
- **Local source copies** (the only off-Cloudflare backups) live in `~/Documents/805LifeGuard-Migration-Documents/`:
  - `805-lifeguard-reviews-api-BACKUP-v07b7bb2e-2026-06-15.js` (pre-2026-06-15 state)
  - `805-lifeguard-reviews-api-UPDATED-2026-06-15.js` (current deployed state)
- **Rollback:** Cloudflare dashboard version dropdown → roll back to a prior version, OR paste a backup `.js` file into Edit code and Deploy.
- **How it works:** Google reviews are LIVE from Google Places API (returns real `total_ratings`). Yelp is MANUAL — `review_count` is a hardcoded number in the Worker (cost/quality control; Yelp API doesn't expose counts freely). To update the Yelp count: change `review_count` in `handleYelpReviewsManual`, plus the two matching values in `handleCombinedReviews` (keep all three in sync), then Deploy.
- **Caution:** the Worker has NO staging environment — Deploy goes straight to production. Verify with `curl .../api/yelp-reviews/805-lifeguard-thousand-oaks` immediately after.

---

## Workflow conventions (reference)

- Branch flow: `feat/<name>` → `staging` → `main`, all via PRs (`gh pr create`)
- Edit pattern: "verify-find-string" — Python heredocs with `assert html.count(old_chunk) == 1` before `.replace()`
- After main merge: tag, GitHub Release, Drive backup zip
- Canonical backups: `me.com` → My Drive → `805companies-luxury-backups/` (flat version-named zips). Secondary dated backups under `agiajasper@gmail.com`.
- Feature branches preserved (not deleted) until prod-verified
- PR merge method: regular merge commit (NOT squash) — preserves staging integration history
- Direct push to main blocked by branch protection; Cloudflare Pages check must pass before merge

---

## Recent ship log

- **2026-06-15**: Fixed stale Yelp review count on /testimonials. Root cause: the `805-lifeguard-reviews-api` Cloudflare Worker hardcoded `review_count: 8`. Updated to 24 (3 spots) + added staging CORS origin in the same deploy. Verified live on staging + production (Yelp card shows "24+", staging CORS errors gone). Worker source backed up locally (see Reviews API Worker section). NOTE: Worker edit is NOT in this repo's git history — it's a Cloudflare-only deploy.

- **2026-06-14**: PR #35 merged → prod `bfefe30` (Deploy #512). Services image de-dup (Lifeguarding + Events detail galleries → real on-site photos) + Yelp CTA fix (review buttons → `/biz/` business page). Verified live. Backup `805companies-luxury-image-dedup-yelp-fix.zip` (93 MB) in Drive.
- **2026-05-27 (approx)**: CCPA/CPRA cookie-consent banner + Consent Mode v2 feature shipped (cookie-consent.css/js, apply_consent_patches.py, +46 lines/page).
- **2026-05-24**: PR #27 merged to main (v1.4.1 + v1.4.2 bundled), deployed as `a5844862`, **rolled back same evening** due to cache infrastructure issue. Production reverted to v1.4 (`97f9c1ab`). Diagnosis logged; v1.5.0 cache work required before re-promotion.
- **2026-05-23 evening**: v1.4 testimonials carousel design-system migration shipped (PR #24, tag `v1.4-testimonials-carousel`).
