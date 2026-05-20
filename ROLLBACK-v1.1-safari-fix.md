# Rollback Runbook: v1.1-safari-fix

**Tag:** `v1.1-safari-fix`
**Commit:** `706a1e7dc0913655f0d01be3dcc9faf0b8f1e9fa`
**Verified deploy:** 2026-05-20 15:51 PT (Cloudflare Pages `a4f83c61`)
**Status:** Known-good production state on `805lifeguard.com`

---

## What this snapshot represents

This tag marks the production state immediately after PR #12 was merged,
which fixed the Safari hero carousel rendering bug. Verified working on:

- iPhone Safari (real device, iOS 26.4.2, iPhone Pro viewport)
- iPad Safari (real device, iPad 11-inch viewport)
- macOS Safari (Safari 26.4 / WebKit 605.1.15)
- Chrome (desktop + iPhone emulation)

Hero carousel renders correctly across all 4 slides on all viewports.

### Architecture in this state

- `.carousel-slide` divs in `index.html` carry `data-bg-desktop`,
  `data-bg-tablet`, `data-bg-mobile` attributes pointing to the
  1920x1080, 1024x576, and 768x960 image variants respectively
- `CarouselController.updateSlideBackground` in `js/luxury-app.js` reads
  those attributes on init and writes `slide.style.backgroundImage`
  based on `Utils.getDeviceType()`
- `.carousel-slide` base CSS in `css/luxury-theme.css` consumes
  `--focal-point` per-slide for `background-position`
- Media-query-scoped `<link rel="preload">` tags in `<head>` preload only
  the matching viewport's slide-01 variant

### What is NOT in this snapshot

- The CSS-driven `.carousel-slide[data-slide="NN"] { background-image: ... }`
  rules from commit `db36f2f` (these caused the Safari bug and were
  removed in `ec50ced`)

---

## Rollback scenarios and runbooks

### Scenario A: A future commit breaks the hero, need to revert it cleanly

Best when: the breaking commit hasn't been merged to `main` yet, OR you
want a forward-only revert that preserves history.

```bash
cd ~/Documents/805companies-luxury

# Identify the bad commit
git log --oneline -10

# Revert it on staging first
git checkout staging
git pull origin staging
git revert <BAD_SHA>           # creates a new "Revert ..." commit
git push origin staging

# Wait for Cloudflare staging deploy (~90s)
# Verify on https://staging.805companies-luxury.pages.dev
# Then PR staging -> main and merge
```

Pros: clean git history, follows your normal workflow.
Cons: takes 5-10 minutes end to end.

### Scenario B: Production is broken RIGHT NOW, need to roll back fast

Best when: prod is on fire and you don't have time for the staging-PR
dance. Restores `main` to exactly the state in this tag.

```bash
cd ~/Documents/805companies-luxury

git checkout main
git pull origin main

# Reset main to the known-good tag
git reset --hard v1.1-safari-fix

# Force-push to origin/main
# WARNING: this rewrites history. All commits between v1.1-safari-fix
# and current HEAD will be removed from main. They are NOT lost (still
# in reflog and any branches that have them) but they're no longer on main.
git push origin main --force-with-lease
```

Cloudflare Pages will detect the new (rewound) HEAD on `main` and
redeploy within ~90 seconds. Production returns to the state in this tag.

Pros: fastest possible recovery, ~2 minutes total.
Cons: rewrites main history (use only when justified). Use
`--force-with-lease` not `--force` to avoid clobbering someone else's push.

After the rollback deploys, on staging:

```bash
git checkout staging
git pull origin staging
git reset --hard v1.1-safari-fix
git push origin staging --force-with-lease
```

So staging matches main again.

### Scenario C: Just need to redeploy this exact production build

Best when: Cloudflare deploy got corrupted or you want to redeploy the
exact bytes without changing git history.

In the Cloudflare Pages dashboard:

1. Open https://dash.cloudflare.com → Workers & Pages → 805companies-luxury
2. Click "Deployments" tab
3. Find the deployment from 2026-05-20 15:51 (commit `706a1e7`,
   preview URL `a4f83c61.805companies-luxury.pages.dev`)
4. Click the "..." menu → "Rollback to this deployment"
5. Confirm. Cloudflare promotes that deployment back to production
   without rebuilding from git

Pros: zero git changes, fastest deploy possible (seconds, not minutes).
Cons: doesn't help if the bug is in code that's now on main; only useful
if Cloudflare itself has the problem.

### Scenario D: Investigate without rolling back

If you just want to see what the code looked like at this snapshot
without touching production:

```bash
cd ~/Documents/805companies-luxury

# Create a throwaway branch from the tag
git checkout -b inspect/v1.1-safari-fix v1.1-safari-fix

# Look around, diff against current main, whatever
git diff main -- index.html css/luxury-theme.css js/luxury-app.js

# When done, switch back and delete
git checkout main
git branch -D inspect/v1.1-safari-fix
```

---

## Critical files in this snapshot

| File | Purpose | Key contents |
|---|---|---|
| `index.html` lines 415-418 | The four `.carousel-slide` divs with `data-bg-*` attributes | If `data-bg-desktop`/`tablet`/`mobile` go missing, hero will be grey |
| `css/luxury-theme.css` lines 1140-1145 | `.hero-carousel` mobile inset (`top: var(--header-navbar-height)`) | If removed, image clipped behind navbar on mobile |
| `css/luxury-theme.css` lines ~1164+ | `.hero-carousel` desktop inset | If removed, image clipped behind fixed header on desktop |
| `css/luxury-theme.css` lines ~1193+ | `.carousel-slide` base styles (position, opacity, transition, background-size, background-position via `--focal-point`) | If removed, slides won't paint at all |
| `js/luxury-app.js` lines 424-462 | `CarouselController.setupResponsiveBackgrounds` + `updateSlideBackground` | If broken or removed, no background-image gets set, hero stays grey |
| `images/home/hero-NN-*-{1920x1080,1024x576,768x960}.{jpg,webp}` | 24 image files (4 slides x 3 sizes x 2 formats) | If any go missing, that slide is grey at that viewport |

## What MUST NOT happen to this architecture

1. **Do not** add `.carousel-slide[data-slide="NN"] { background-image: ... }` CSS rules back. Safari doesn't apply them reliably. The bug we just fixed.
2. **Do not** remove the `data-bg-desktop/tablet/mobile` attributes from `.carousel-slide` divs. The JS depends on them.
3. **Do not** change `--focal-point` inline style values without verifying composition on mobile portrait (768x960 variant). Focal-point Y values are calibrated to keep the lifeguard's head visible below the navbar.
4. **Do not** move `.hero-carousel` rules in the cascade. The mobile override at `@media (max-width: 768px)` MUST come after the desktop default rule, otherwise specificity ties and the desktop rule wins on mobile.
5. **Do not** add `background-attachment: fixed` to `.carousel-slide` or `.hero`. iOS Safari has historical bugs with this property.

## How to verify a deploy is still healthy

After ANY change touching the hero, verify on real devices before
considering it shipped:

1. **iPhone Safari (real device, private window)**: `https://805lifeguard.com`
   - Hero renders with image (not grey box)
   - All 4 slides cycle correctly over ~30 seconds
   - Lifeguard composition visible below navbar (head not clipped)
2. **iPad Safari (real device, private window)**: same checks
3. **Mac Safari (private window)**: same checks
4. **Chrome (regression)**: same checks - should match what it always did

If any device shows a grey box: rollback per Scenario B above.

## Related history

- `db36f2f` (Sat May 16 2026): introduced the CSS-driven backgrounds approach
  that broke Safari. The Phase 1 perf commit. Partially reverted by `ec50ced`.
- `ec50ced` (Wed May 20 2026): the actual fix commit. Restored data-bg-*
  attributes and removed the per-slide CSS rules.
- PR #11: staging merge of `ec50ced`. Merge commit `914fc16`.
- PR #12: staging -> main promotion. Merge commit `706a1e7` (this tag).

## Contact / context

If something goes wrong and this runbook isn't enough, the full
diagnostic trail is in the PR descriptions of PRs #11 and #12, plus
in commit `ec50ced`'s extended commit message. The conversation that
produced this fix took ~2 hours and included USB-attached iPhone Safari
Web Inspector debugging to confirm the bug was browser-specific.

The underlying mystery — WHY Safari's CSSOM treated `.carousel-slide
[data-slide="NN"]` selectors as `computed background-image: none` while
Chrome treated them correctly — was never definitively isolated. The
fix sidesteps the question by using inline style, which Safari handles
reliably. Worth investigating in a calmer moment.
