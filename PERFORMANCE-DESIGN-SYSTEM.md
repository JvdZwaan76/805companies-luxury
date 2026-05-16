# Performance Design System — Planning Document

**Status:** Planning / not yet implemented
**Audience:** Jasper (owner), future contributors, future-Claude in subsequent sessions
**Purpose:** Define a documented performance design system for 805 LifeGuard and franchise sites, then sequence the work to implement it
**Lifecycle:** This is a *workspace* document. Once the system is implemented across all pages, the durable conventions get promoted into `DESIGN-SYSTEM.md` and this file is archived.

---

## 1. The problem we're solving

### What "load shuffle" means

On a cold cache visit to `805lifeguard.com`, the visitor sees: blank page → page structure (headlines, buttons) → hero image pops in late → fonts re-render → layout settles. The pop-in of the hero image is the most visible artifact. On a Slow-4G profile this can take 20+ seconds; on a real connection it's a quick but jarring blink.

### What's actually happening (current state, observed)

From the network waterfall on production (Slow-4G, hard cache reset):

- **DOMContentLoaded:** 2.66s
- **Load complete:** 29.37s
- **Total transferred:** 5.9 MB
- **Total requests:** 47

Specific findings:

1. **Hero image variants over-load.** The JS preloads all three viewport variants (desktop, tablet, mobile) of slides 0–2, then all three variants of slide 3 on idle. That's 12 image downloads when 4 (one per slide, viewport-aware) would suffice.

2. **Double-format preload waste.** HTML preloads both `hero-01-...webp` AND `hero-01-...jpg`. The slide HTML uses the `.jpg`, so the WebP is downloaded but never displayed. Hence the persistent "preloaded but not used" console warning.

3. **Off-page images load on the homepage.** Service-card images, about-section images, HOA images, pool-cleaning images all load on the homepage even though they belong to other pages. Likely the homepage's DOM references these in preview cards or background images of below-fold sections, and Chrome eagerly fetches them.

4. **Resource ordering is wrong.** The LCP (largest contentful paint) image — slide 01 — competes for bandwidth with 30+ other resources. By the time it arrives, the user has been looking at an empty hero for ~3 seconds.

5. **No placeholder strategy.** The hero element has no image fallback (we removed it earlier for unrelated reasons). First paint is the gradient overlay on top of nothing.

### Why this matters at scale

This is a franchise template. Whatever performance shape the homepage has, every future area-code site inherits. Hot-fixing this site means hot-fixing N sites later. A documented system means franchise sites inherit good performance for free.

### Why this matters for *this* site

The audience is luxury — wealthy households evaluating a high-trust service. Slow, janky first impressions undermine "Excellence. Discretion. Peace of Mind." A site that takes 3 seconds to paint the hero is communicating something about competence and care.

---

## 2. Decisions locked in for this design system

These decisions framed the conventions below. They are not up for re-negotiation per-page or per-component.

| Decision | Choice | Rationale |
|---|---|---|
| Asset budget | **~1 MB transferred on first paint** (homepage) | Luxury-aggressive tier; matches Apple/Hermès |
| Browser floor | Last 2 versions of Chrome/Edge/Firefox/Safari + iOS Safari 15+ | Standard 2026 modern stack; audience is current-device |
| Image format ladder | **WebP + JPG (current), AVIF designed-in as future clean upgrade** | Pragmatic; AVIF adds build complexity not yet justified |
| Declarative vs JS-driven | **Decide per-convention** | Some JS may stay if it earns its keep |

---

## 3. Target state: the performance design system

Six named conventions. Each one is a documented contract that every page on the site follows. Together they replace the ad-hoc decisions scattered across the codebase today.

### Convention 1: Responsive image markup

**Rule:** Images that vary by viewport are declared with `<picture>` + `<source srcset>`, not via JavaScript-driven `data-bg-*` attributes.

**Why:** The browser is better at choosing the right variant than our JS is. `<picture>` evaluates `srcset` before any JS runs, kicks off the right fetch immediately, picks the right format based on browser support. JS-driven swaps run too late and force us to download multiple variants "just in case."

**Designed-in AVIF upgrade path:** the `<picture>` source order is `avif → webp → jpg`. Today we ship only the WebP and JPG sources. Adding AVIF later is a non-breaking change: regenerate hero files in AVIF, add a `<source type="image/avif">` ahead of the WebP source, deploy. No HTML structural change required of other pages.

**Trade-off:** the hero is a CSS background-image today (because of how the carousel composes slides with a gradient overlay). Replacing it with `<picture>` is a real refactor. We'll either (a) replace the carousel with a `<picture>`-based version, or (b) keep the background-image approach for the carousel specifically and document why. To be decided when we implement.

### Convention 2: Single LCP preload, viewport-aware

**Rule:** Each page declares exactly **one** `<link rel="preload">` for its LCP image. Uses `imagesrcset` so the browser picks the viewport-correct variant. Marked `fetchpriority="high"`.

**Why:** Multiple preloads compete for bandwidth. One preload, hinted as high-priority, gives the LCP image the head start it needs to be the first thing the user sees.

**What this replaces:** The current pattern of preloading multiple variants of multiple slides via both HTML and JS. After this convention, the JS does NOT preload the LCP image — that's the HTML's job. The JS only handles deferred preloads of below-fold images.

### Convention 3: Deferred preload for below-fold and next-views

**Rule:** Images that are not the LCP image — including subsequent carousel slides — preload via `requestIdleCallback` after the page is interactive, not during the initial paint contention.

**Why:** Carousel slides 02/03/04, service preview images, and other below-fold content can take their time. Loading them in parallel with the LCP image is what creates the shuffle.

**Implementation:** A single `deferredPreload(urlList)` utility, called once after the LCP image fires its `load` event. Uses `requestIdleCallback` (with `setTimeout` fallback) so it never blocks user interaction.

### Convention 4: Page-image colocation

**Rule:** Each page can only reference images from `/images/<page>/` and `/images/shared/`. Service-page imagery cannot leak into the homepage's DOM. About-page imagery cannot appear in homepage previews.

**Why:** This eliminates the entire class of "wait, why is `service-events-luxury-800x600.webp` loading on the homepage?" problems we just observed. The discipline is mechanical, not judgment-based: if it's in `/images/services/`, it loads on `/services`. Period.

**Enforcement:** A simple `npm run audit` (or shell script) that greps each page for image references and asserts they all live under the page's own folder or `/images/shared/`. Runs in CI as part of the deploy workflow.

**Migration impact:** Existing pages reference `home-luxury-estate-hero-*` etc. from `/images/home/` even on testimonials and insurance pages. This work has to wait until each of those pages gets its own image refresh — already on the deferred work list from prior session.

### Convention 5: LQIP (Low-Quality Image Placeholder)

**Rule:** Every hero or major image section has an instant-render placeholder so first paint never shows blank pixels behind the LCP image. The placeholder is a ~3-5 KB inline base64 blurred thumbnail set as `background-image` on the container, behind the real image. When the real image loads, it composites on top.

**Why:** Even on slow connections, the visitor sees *something* immediately — a blurry hint of the composition that resolves into the real image. This is what makes load shuffle feel like a smooth fade-in instead of a pop.

**Build-time generation:** part of the image build script. For each hero source, produce a 24px-wide blurred JPG, base64-encode it, write to a CSS file as a custom property (`--lqip-slide-01`).

**Trade-off:** adds ~5 KB inline per hero to the HTML/CSS payload. Worth it for the perceived performance win.

**Future enhancement:** swap base64 LQIP for dominant-color placeholder (single hex value, ~7 bytes) on slides where the blurred preview adds little.

### Convention 6: Asset budget enforcement

**Rule:** Each page type has a published transfer budget on first paint. CI fails if the budget is exceeded.

| Page type | Budget (first paint, gzipped) |
|---|---|
| Homepage | 1.0 MB |
| Content page (about, services, FAQ) | 800 KB |
| Form page (insurance, consultation) | 600 KB |
| Lightweight page (privacy, terms) | 300 KB |

**Why:** Without a budget, "just add one more image" becomes ten more images becomes 5.9 MB. A budget forces every addition to be a conscious choice: "what comes out to make room for what goes in?"

**Enforcement:** Lighthouse CI run on each deploy with budget assertions in `lighthouse-budgets.json`. Deploy blocks if exceeded.

---

## 4. How these conventions fit together

A new page on the site (say, future `/franchise/santa-barbara/`) is built as follows:

1. **Designer picks hero imagery** for that location. Sized to fit the 1 MB budget after WebP compression.
2. **Build script generates variants:** 768×960 mobile, 1024×576 tablet, 1920×1080 desktop, in both JPG and WebP. Plus a 24px LQIP.
3. **HTML declares the page following the conventions:**
   - One `<link rel="preload" imagesrcset=... fetchpriority="high">` for the LCP image
   - `<picture>` element for any responsive imagery
   - LQIP set as `background-image` on hero container
   - All image refs point to `/images/franchise-santa-barbara/`
4. **CI verifies:** budget passes, no off-page images, all variants exist.
5. **Page ships.** Inherits the perf characteristics of the design system by default.

The contributor doesn't need to invent any of this. They just follow the playbook.

---

## 5. Sequence of work

The work spans multiple sessions. Each session leaves the codebase in a working state and the design system more complete.

### Session 0 (this session) — JavaScript stability audit

The performance design system can't be built on top of a JS layer that's a house of cards. Before we change any preload code, we audit the JS that touches the hero/carousel and decide whether to stabilize-in-place or refactor.

**Goals:**

1. **Map all controllers in `luxury-app.js`.** Inventory every named controller (Animation, Navigation, Form, Carousel, Utils, etc.), what each owns, what each depends on, what calls them. Produce a dependency diagram (text-based, in the doc).
2. **Document the rendering contract of the hero/carousel.** For each function involved in the hero rendering path: what state does it expect to find, what state does it leave behind, who else reads/writes that state. Make implicit assumptions explicit.
3. **Identify fragile coupling.** Places where the code makes assumptions about timing, load order, DOM presence, or cross-controller state that are not enforced anywhere. These are the points where a "small" change can cause a "big" regression.
4. **Identify dead or duplicate code.** During audit, anything obviously unused or redundant gets flagged. We don't delete in this session (separate effort), just inventory.
5. **Make the stabilize-vs-refactor decision.** Two outcomes possible:
   - **Stabilize-in-place:** the JS has known fragilities but they're locatable and patchable. Session A proceeds with surgical changes guided by the contracts we documented.
   - **Refactor:** the JS is too fragile or too tangled to safely modify. Session A becomes a carousel rewrite (this absorbs what was originally Session E).

**Out of scope for Session 0:**

- Changing any JS code. Audit only.
- Performance optimization (no preload changes, no LQIP, nothing).
- Other controllers we don't need (form, navigation) get a light pass but aren't deeply audited unless they touch the hero path.

**Deliverables:**

- A new section in this document (Section 11, appended) titled "JS Stability Audit — Findings" containing the dependency map, the contracts, the fragility inventory, and the stabilize-vs-refactor recommendation.
- An updated Session A plan that reflects the decision.

**Success criteria for Session 0:**

- Every function in the hero rendering path has a documented contract.
- Every fragile coupling we identify is explicitly named with the failure mode it could produce.
- The stabilize-vs-refactor decision is made with stated rationale.
- No code changes have been made.

### Session A (after Session 0) — Foundation

Define the system, ship the homepage as the reference implementation, document everything.

1. **Audit current homepage load** in detail (we have the waterfall; verify with one more measurement).
2. **Define the conventions** in `DESIGN-SYSTEM.md` as the canonical reference.
3. **Implement on the homepage:**
   - Single viewport-aware preload (Convention 2)
   - JS deferred-preload utility, replace the per-variant preload chain (Convention 3)
   - LQIP for slide 01 (Convention 5)
   - Move the existing `data-bg-*` swap to use viewport-aware variant selection (no `<picture>` refactor yet — see "Out of scope" below)
4. **Audit and remove off-page image references** from the homepage DOM (Convention 4 — manual cleanup pass)
5. **Set up Lighthouse budget config** (Convention 6) but don't enforce in CI yet (just observability).
6. **Document in `DESIGN-SYSTEM.md`** with code examples from the homepage.
7. **Update build script** to generate LQIP placeholders.

### Session B — Migrate other pages

Apply the conventions to testimonials, insurance, services, about, etc. Each page gets:
- Its own image set under `/images/<page>/`
- Single LCP preload
- LQIP for its hero
- Removal of homepage image references

Probably 1-2 pages per session. The 30 orphaned `home-*` files get deleted after all pages are migrated.

### Session C — Enforcement

- Move Lighthouse budgets from observability to CI blocking
- Add the colocation audit script to CI
- Add documentation for "how to add a new page" with the playbook above

### Session D (optional, later) — AVIF upgrade

When the build-tooling-complexity cost feels worth paying:
- Add `avifenc` to build script
- Generate AVIF variants for all heroes
- Add `<source type="image/avif">` ahead of WebP sources in each page's hero
- Re-measure budgets — likely drops 30-40% across the board

### Session E (optional, later) — Carousel refactor

If we decide the carousel should use `<picture>` instead of CSS background-image:
- Refactor `.carousel-slide` from `<div>` with background-image to `<picture>`+`<img>`
- Move the gradient overlay to a separate layer (`::before` pseudo-element on the slide)
- Update `--focal-point` to apply to `object-position` on the `<img>` instead of `background-position` on the div
- Adjust JS to swap the `<picture>` sources on slide transition

### Session F (optional, later) — Font loading optimization

We didn't dig into fonts yet. Playfair Display + Inter loaded from Google Fonts via a preload-then-stylesheet pattern. Worth a session on subsetting, self-hosting, or moving to a system-font + brand-font hybrid.

---

## 6. Out of scope (explicitly)

These are real issues but are NOT part of this effort. Captured here so we don't scope-creep mid-session.

- **JavaScript bundle size / code-splitting.** `luxury-app.js` is monolithic. Worth a separate effort, but not what's causing the load shuffle.
- **Server-side rendering / static generation.** The site is already static HTML. No SSR work needed.
- **CDN configuration.** Cloudflare is already serving. Cache headers may need tuning but it's a separate concern from what the site SENDS in the first place.
- **Service worker / offline support.** Out of scope; not a luxury-site requirement.
- **Analytics overhead.** GTM + GA are loading. Some optimization possible but separate effort.
- **Third-party fonts.** Mentioned as Session F future work, but not this effort's focus.
- **The 11 pages that still reference old `home-*` images.** Already scheduled as "migrate per page" in Session B.
- **The carousel architecture itself.** Mentioned as Session E future work. The current JS-driven approach stays for now.

---

## 7. Success criteria for Session A

(Session A now begins only after Session 0's audit is complete and its stabilize-vs-refactor decision is made. The criteria below assume Session 0 has recommended stabilize-in-place; if Session 0 recommends refactor, Session A's plan and criteria will be rewritten accordingly.)

We'll know Session A is complete when:

1. Production homepage cold-load shows the hero image within ~500ms after CSS parse, not after 3 seconds
2. Network waterfall shows ~5 image downloads on first paint, not ~30
3. The "preloaded but not used" warning is gone from console
4. No off-page images (service, about, HOA, pool-cleaning images) load on the homepage
5. First-paint transfer is under 1.5 MB (won't hit 1.0 MB target until AVIF in Session D, but should be close)
6. `DESIGN-SYSTEM.md` has a new "Performance" section that explains all six conventions with code examples from the homepage
7. The LQIP placeholder is visible (briefly, on cold load) instead of a blank hero

---

## 8. Open questions to resolve before implementation

These are things I (or future-Claude) need from Jasper before starting Session A implementation:

1. **Carousel approach for this session:** keep CSS background-image, just optimize its loading (recommended), or refactor to `<picture>` (more work, possibly cleaner)?
2. **LQIP generation:** OK to add LQIP generation to the existing `build-carousel-images.sh`? It'll add ~5 seconds per slide to the build.
3. **Lighthouse CI:** OK to add `@lhci/cli` as a dev dependency and wire into the deploy workflow as observability (no blocking yet)?
4. **Image audit script:** prefer bash, Node, or Python for the colocation check? (My recommendation: bash, since the project doesn't currently have a Node toolchain.)

---

## 9. Risk / what could go wrong

- **Carousel JS swap logic is fragile.** When we change preloading, we might accidentally break the slide rotation. Mitigation: test thoroughly on staging before merging.
- **LQIP base64 inlines bloat HTML.** Each LQIP is ~3-5 KB. Four slides = ~20 KB added to inline CSS. Worth it, but worth tracking.
- **Cloudflare edge caching.** We hit this last time. Mitigation: documented purge step in deploy checklist.
- **Budget regression.** Once budgets are documented, every future addition risks blowing them. Mitigation: Session C wires CI enforcement so regressions surface immediately.

---

## Appendix A: Current state quick reference

For reference during implementation. Captured at start of Session A.

- HTML hero preloads (lines 164-165): WebP + JPG (waste)
- JS preloadImages(): 9 critical (3 slides × 3 variants), 3 remaining (slide 4 × 3 variants)
- `.hero` element: no background image (gradient only) — needs LQIP
- `.carousel-slide` element: `background-image: url(.jpg)` set inline with `--focal-point` custom property
- Image folder: `/images/home/` (4 hero slides × 3 variants × 2 formats = 24 active files + 30 orphaned old files)
- Build script: `~/Documents/805lifeguard-Carousel-Images-2026/build-carousel-images.sh`

---

## 10. Session 0 — JavaScript Stability Audit (findings)

Audit conducted against `js/luxury-app.js` (2137 lines), `index.html` (1109 lines), and the boot pathway from HTML script tag to first carousel paint.

### 10.1 Controller inventory

`luxury-app.js` is an IIFE that defines and instantiates the following controllers, exported via `window.app`:

| Controller | Lines | What it owns |
|---|---|---|
| `CONFIG` (object) | 11–96 | Magic numbers, breakpoints, timings, header heights, page-specific settings |
| `Utils` (object) | 98–262 | `debounce`, `throttle`, device-type detection, `preloadImage`, logging, viewport checks, page-type checks |
| `WebPDetectionService` | 266–300 | Async feature detection. Loads a 1×2 px base64 WebP, sets `html.webp` or `html.no-webp` class |
| `CarouselController` | 303–668 | Hero carousel: rotation, preload, responsive variant swap, touch, intersection observer, autoplay |
| `NavigationController` | 671–1216 | Header behavior, mobile nav overlay, logo entrance animation, scroll-driven logo scaling, page-specific nav |
| `AnimationController` | 1218–1457 | Scroll-triggered animations, hover effects, hero text fade-in (200ms after init), staggered card reveals |
| `FormHandler` | 1459–1620 | Form validation, phone formatting, URL-param prefill, contact-form handlers |
| `SmoothScrollController` | 1622–1717 | Anchor-link smooth-scroll behavior |
| `ContactUpdater` | 1719–1786 | Updates phone numbers, email addresses, portal links from `CONFIG` |
| `LuxuryApp` | 1789–1965 | Top-level orchestrator that owns all the above and sequences their instantiation |

Plus an **inline script in `index.html` (lines 952–1036)** that runs *before* `luxury-app.js` loads. It owns initial mobile-nav binding and logo entrance. This is a critical-path duplicate of behavior that `NavigationController` also handles.

### 10.2 Boot sequence (the actual order of events)

```
1.  HTML parser hits the inline <script> at line ~960
    -> defines initMobileNav() and initLogoEntrance()
    -> binds DOMContentLoaded listener (or runs immediately if doc already parsed)
    -> when DOM ready: initMobileNav() + initLogoEntrance() run

2.  HTML parser hits the deferred-script-loader at line 1040
    -> schedules loadMainScript() via requestIdleCallback
       (or 500ms setTimeout fallback)

3.  requestIdleCallback fires at some unpredictable time later
    -> creates <script src="/js/luxury-app.js" async>
    -> appends to <head>

4.  luxury-app.js downloads and executes
    -> IIFE runs immediately
    -> `new LuxuryApp()` at line 2110
       -> LuxuryApp constructor instantiates WebPDetectionService
       -> calls this.init()
          -> if doc still loading: bind DOMContentLoaded
             (won't trigger; doc has long been loaded by now)
          -> else: this.initializeApp() runs immediately

5.  initializeApp() runs
    -> awaits webpService.detect() (async, ~10ms)
       -> sets html.webp / html.no-webp class
    -> then synchronously:
       new NavigationController()   <-- duplicates inline-script mobile nav and logo entrance!
       new FormHandler()
       new SmoothScrollController()
       new ContactUpdater()
       if (#heroCarousel exists):
           new CarouselController(heroCarousel)
              -> init():
                 removeAllNavigationElements()
                 preloadImages()           <-- 9 images (3 slides × 3 variants)
                 setupResponsiveBackgrounds() -> updateSlideBackground() per slide
                 setupEventListeners()
                 setupIntersectionObserver()
                 startAutoPlay()
                 handleResize()
    -> 200ms later: new AnimationController()
       -> setupHeroAnimations() animates .hero-title etc. with another 600ms initial delay

6.  9 preload promises resolve in parallel
    -> preloadRemainingImages() fires (2-second delayed setTimeout inside)
       -> 3 more images load (slide 4 × 3 variants)
```

### 10.3 Hero / carousel rendering path — function contracts

This is the focus of the audit. For each function in the path, the contract:

**`CarouselController` constructor (line 303)**

- **Expects:** a DOM element (passed by caller) that contains `.carousel-slide` children.
- **Produces:** instance with `slides` NodeList, `currentSlide=0`, `totalSlides`, `currentDeviceType` cached at construction time. Calls `this.init()` immediately.
- **Fragile coupling:** caches `currentDeviceType` from `window.innerWidth` AT CONSTRUCTION TIME. If the viewport changes between construction and any later check, this cached value is stale until `handleResize()` runs.

**`init()` (line 320)**

- **Expects:** `this.slides.length > 0`. Otherwise logs warn and returns silently.
- **Produces:** fully initialized carousel: slides have backgrounds, listeners bound, autoplay running.
- **Order matters:** `preloadImages()` is called BEFORE `setupResponsiveBackgrounds()`. The preloads kick off but don't block — `setupResponsiveBackgrounds()` runs immediately and sets `slide.style.backgroundImage` based on viewport. The "preload" is effectively a separate cache-warming operation, NOT what loads the initial image.

**`preloadImages()` (line 364)**

- **Expects:** `this.slides` populated.
- **Produces:** kicks off `Promise.allSettled` for 9 image fetches (slides 0-2, each × 3 variants). On settled, calls `preloadRemainingImages()`.
- **Fragility:**
  - Does NOT discriminate by current viewport. Loads desktop variant on mobile, mobile variant on desktop, ALL variants of ALL three slides simultaneously.
  - Failure of an image (404, network) doesn't break anything because `allSettled` catches it, but it does log a warn.
  - Outcome of preload is decoupled from what's actually displayed. The slide's background-image is set by `setupResponsiveBackgrounds()` regardless of whether preload completed.

**`setupResponsiveBackgrounds()` (line 424)** and **`updateSlideBackground(slide)` (line 431)**

- **Expects:** each slide has `data-bg-desktop`, `data-bg-tablet`, `data-bg-mobile` attributes (HTML already provides these).
- **Produces:** sets `slide.style.backgroundImage = 'url(X)'` where X is the viewport-appropriate variant.
- **Critical detail:** This is what ACTUALLY drives image loading on first paint. The browser fetches the image when the slide's computed `background-image` URL changes.
- **Idempotent:** checks `currentBg !== newBg` before writing. Won't trigger a re-fetch if URL is unchanged.
- **Fragility:**
  - The slide's *inline* `style="background-image: url(...1920x1080.jpg)"` already sets a URL in the HTML. On mobile, `setupResponsiveBackgrounds()` overwrites it with the mobile variant. **This means mobile users always fetch the desktop image first (because HTML sets it), then fetch the mobile image (because JS overrides it)**. Two fetches per slide on first paint on mobile. This is a major perf bug, separate from the preload issue.

**`goToSlide(index, direction)` (line 580)**

- **Expects:** valid index, not currently transitioning.
- **Produces:** swaps `.active` class. CSS transition handles the fade. Fires `carouselSlideChange` event.
- **Note:** Does NOT call `updateSlideBackground` for the new slide. The slide's background was set at `setupResponsiveBackgrounds()` time during init. If the image hasn't loaded yet, the slide reveals blank until the browser finishes fetching.
- **Fragility:** assumes all slide backgrounds are pre-set. If a future change makes `setupResponsiveBackgrounds()` lazy, slide transitions will show blank slides.

**`handleResize()` (line 571)**

- **Expects:** debounced via `Utils.debounce` (150ms default).
- **Produces:** if device type bucket changed, re-runs `setupResponsiveBackgrounds()` for all slides.
- **Fragility:** when device type changes, ALL slides get a new background URL → ALL slides immediately fetch the new variant. On a desktop user dragging the window narrow to mobile, this triggers 4 fresh image fetches even though only 1 slide is visible.

**`startAutoPlay()` (line 627)**

- **Expects:** `this.isPlaying && this.totalSlides > 1`.
- **Produces:** `setInterval` calling `nextSlide()` every 8000ms.
- **Cleanup:** `stopAutoPlay()` clears the interval. Note: `destroy()` is wired and would be called if anyone called it — but `LuxuryApp` never calls it.

### 10.4 Fragility inventory

Concrete fragile couplings, with failure modes:

| # | Location | Fragility | Failure mode |
|---|---|---|---|
| F1 | `index.html` + `NavigationController` | Inline script in HTML duplicates `initMobileNav()` and `initLogoEntrance()` that `NavigationController` *also* implements | Both register click listeners on `#menuToggle`. Either both fire (double-toggle) or one stomps the other depending on event timing. Visible bug today? Probably masked by browser dedup or rapid execution. Not investigated further. |
| F2 | `CarouselController` constructor | `currentDeviceType` cached at construction, only updated in `handleResize()` | If viewport changes between construction and any pre-resize event check, stale value. Low impact in practice (construction-to-first-event is <100ms). |
| F3 | `updateSlideBackground` | HTML inline `style="background-image"` is overwritten by JS on non-desktop viewports | Double-fetch on first paint on mobile/tablet. ~500KB wasted bandwidth per mobile visit. This is a real, currently-shipping bug. |
| F4 | `preloadImages` | Loads all variants regardless of viewport | ~5 MB wasted bandwidth. We already knew this; reaffirmed here. |
| F5 | `goToSlide` | No image-readiness check before swapping `.active` | If next slide's image hasn't loaded (e.g., slow network, deferred preload), the swap shows blank for however long it takes to fetch. Currently masked because all variants are eagerly preloaded — fixing F4 might expose F5. |
| F6 | `setupResponsiveBackgrounds` | Runs once at init only | If a slide's image swap fails silently, that slide is permanently broken with no retry. |
| F7 | Whole boot chain | App init is gated behind `requestIdleCallback` -> async script load -> WebP detection promise | Carousel can't initialize until all of: idle callback fires, network fetches `luxury-app.js`, executes, awaits WebP detect. On slow networks this is several seconds AFTER DOMContentLoaded. The slide rotation can't start until then either. |
| F8 | `AnimationController.setupHeroAnimations` | Sets `.hero-title` opacity to 0, then fades in 600ms+ later | If `AnimationController` is created (200ms after `LuxuryApp.initializeApp`) but never runs (script error, etc.), `.hero-title` stays invisible forever. The hero text vanishes. |
| F9 | `WebPDetectionService` | App initialization gated behind WebP detect | If the base64 decode hangs (extremely unlikely but theoretically possible), nothing initializes. Single point of failure for the entire app boot. |
| F10 | `IntersectionObserver` in `setupIntersectionObserver` | Pauses autoplay when carousel scrolls out of view | Reasonable behavior, but the pause/resume logic in `resumeAutoPlay` re-checks `Utils.isInViewport` AND `document.hidden`. If either check is stricter than expected, autoplay might not resume after scroll-back. |

### 10.5 Dead / duplicate code inventory

Not removed in this session, flagged for future cleanup:

- **D1:** Inline script `initMobileNav()` and `initLogoEntrance()` in `index.html` duplicate `NavigationController` methods. Likely a "fast-path" optimization for first-paint nav interactivity, but it makes the codebase harder to reason about.
- **D2:** `CarouselController.removeAllNavigationElements()` removes DOM elements that don't exist in the current HTML (`.carousel-indicators`, `.carousel-controls`, etc.). The carousel was originally a different design and these are vestigial.
- **D3:** `CONFIG.SERVICES` and `CONFIG.TESTIMONIALS` are only used on services/testimonials pages but live in the homepage's JS bundle.
- **D4:** `Utils.log` has development-mode gating but is called unconditionally throughout — every log is a function call even in prod.
- **D5:** `LuxuryApp.initializeFallback` is wired but never invoked from the catch block of `initializeApp` because the try/catch wraps the *synchronous* part of `initializeApp`, which only calls `webpService.detect().then(...)`. Any error inside the `.then` callback is unhandled. The fallback path is effectively dead code.

### 10.6 Stabilize-vs-refactor decision

**Recommendation: stabilize-in-place for Session A. Defer carousel refactor to Session E as originally planned.**

Reasoning:

1. **The architecture is sound where it counts.** The boot sequence is reasonable. Controllers have clear responsibilities. Cleanup paths exist (even if not always invoked). The carousel's slide-rotation logic is straightforward `.active` class swapping; not fragile in itself.

2. **The fragilities are localized.** F3 (HTML-then-JS double-fetch on mobile) is the most impactful bug, and it's a 5-line fix in `updateSlideBackground`. F4 (loads all variants) is also localized in `preloadImages`. F7 (delayed boot) requires touching the HTML's deferred-script-loader, not the controllers themselves. None of these require an architectural rewrite.

3. **The carousel-to-`<picture>` refactor is real work.** Replacing `background-image` on `<div>` with `<picture><img>` means: rewriting the gradient overlay layer, updating CSS for `object-fit`/`object-position` instead of `background-size`/`background-position`, updating `--focal-point` to apply to `object-position`, updating all JS that manipulates `slide.style.backgroundImage`. A whole afternoon's work, and risks new bugs. Not justified for the perf wins we can get without it.

4. **The duplicate inline-script behavior (F1, D1) is annoying but stable.** Working around it is cheaper than fixing it in this effort. Flag for cleanup in a future "code hygiene" session.

**Confidence: high.** The audit revealed nothing that suggests the code is unsalvageable. The performance issues are well-localized.

### 10.7 Implications for Session A — updated plan

Session A as originally planned remains viable. Specific updates based on the audit:

**Must-fix in Session A (these are bugs the perf design system surfaces):**

- **Fix F3** (double-fetch on mobile/tablet): when slide HTML is rendered, the inline `style="background-image: url(...desktop.jpg)"` should be removed. JS will set the appropriate variant via `setupResponsiveBackgrounds()`. This means HTML serves the markup, JS controls the image. **Or alternatively:** keep HTML inline style, but have HTML use `imagesrcset`-style logic so the right variant is in HTML from the start. Decide during implementation; both viable.

- **Fix F4** (preload all variants): rewrite `preloadImages()` to be viewport-aware. Pick ONE variant per slide. Only preload slide 0 immediately; defer 1, 2, 3 to `requestIdleCallback`.

- **Update HTML preload hints:** match what the JS will actually load. Drop the JPG+WebP double preload.

**Should-address but lower-priority:**

- **Mitigate F7** (boot chain delay): the `requestIdleCallback`-wrapped script loader pushes `luxury-app.js` past first paint. For the LCP image, this is mostly fine because the HTML inline-style on slide 1 (active) paints immediately. But it means `setupResponsiveBackgrounds()` doesn't run until late, so the mobile variant swap from F3 happens late, causing a visible "image swap" effect on mobile. Removing F3 (by stripping HTML inline style) reorders this — JS will be late to set the bg, so we need to either preload from HTML or accept the late paint. **This is the key design decision for Session A.**

- **Add image-readiness check in `goToSlide`** (F5): when we move from "preload everything" to "lazy-load slides 2-4", `goToSlide` may try to swap to a slide whose image hasn't arrived. Either preload-on-demand inside `goToSlide`, or accept a brief blank during slide transition.

**Out of scope for Session A (defer):**

- F1/D1 (inline-script duplication): cleanup task, not a bug today.
- F2 (cached device type at construction): minor, not worth fixing.
- F6 (no retry on swap failure): unlikely failure mode.
- F8 (hero text fade dependency on AnimationController): consider in Session F.
- F9 (WebP detect as boot dependency): consider in Session F.
- F10 (IntersectionObserver autoplay resume): not a perf issue.
- D2-D5: cleanup tasks for a separate effort.

**Critical decision for Session A implementation:**

Where does the initial slide-1 image URL come from? Three options:

1. **HTML inline-style with the desktop variant (current).** JS overwrites with mobile/tablet variant if needed. Causes F3 double-fetch on non-desktop. Worst for perf.
2. **HTML inline-style with NO background-image. JS sets it.** Slide-1 is invisible until `luxury-app.js` runs (~hundreds of ms after DOMContentLoaded on cold cache). Visible "pop-in" on first paint.
3. **HTML `<link rel="preload" imagesrcset=...>` for the responsive variant. HTML inline-style references whichever variant matches viewport at parse time (using `<picture>` or CSS media-query).** Best perf. Requires either refactoring `.carousel-slide` from `<div>` to `<picture>` (the Session E refactor), or using CSS media queries to set `background-image` per viewport.

**Recommended: option 3 via CSS media queries.** Each slide gets `background-image` set in a `<style>` block at the top of `index.html`, with `@media (max-width: 768px)` overrides. The `<link rel="preload">` for slide 1 uses `imagesrcset` to hint the browser. JS only runs to handle slide rotation (changing `.active` class), never to swap variants — that's CSS's job.

This is a meaningful structural change for Session A but avoids the full carousel refactor. The benefit: F3 disappears entirely, F4 reduces to just preloading the right variant for the active slide.

If this feels like too much to take on in Session A, fall back to option 2 with mitigations (LQIP placeholder so the "pop-in" isn't visible).

---

### 10.8 Decision locked: Option 3 (CSS-driven responsive backgrounds)

**Decided by Jasper at end of Session 0.**

The slide backgrounds become a CSS responsibility. HTML declares the slides as empty `<div class="carousel-slide">` elements (no inline `style="background-image"`). A `<style>` block (or external CSS) defines per-slide `background-image` rules with viewport-targeted media queries. The carousel JS handles only `.active` class rotation, no image URL manipulation.

This means:

- **F3 (double-fetch on mobile/tablet) is eliminated.** The browser picks the right variant at CSS parse time. No JS swap happens, ever.
- **F4 (preload all variants) reduces to a much simpler problem.** We only need to preload slide 1's correct variant for the user's viewport. We use `<link rel="preload">` with `imagesrcset` for that.
- **F6 (`setupResponsiveBackgrounds` runs only at init) becomes moot.** That function gets removed; the CSS handles variants reactively via media queries.
- **`updateSlideBackground` is removed.** No JS swap.
- **`handleResize` simplifies.** It no longer needs to re-run the swap on device-type change — CSS handles it automatically.

The architectural payoff is bigger than just performance: it cleanly separates concerns. CSS owns "how does this look at this viewport"; JS owns "which slide is active right now". That's the right boundary.

### 10.9 Session A implementation plan (sequenced)

With Option 3 locked in, here's the concrete sequence for Session A. Each step is small, reviewable, and leaves the site in a working state.

**Phase 1: Foundation refactor (CSS takes over image variants)**

1. **Add an internal CSS block (or external stylesheet section) for slide backgrounds.** For each of the 4 slides, define rules like:
   ```css
   .carousel-slide[data-slide="01"] { background-image: url('/images/home/hero-01-...-1920x1080.jpg'); }
   @media (max-width: 1024px) { .carousel-slide[data-slide="01"] { background-image: url('...-1024x576.jpg'); } }
   @media (max-width: 768px)  { .carousel-slide[data-slide="01"] { background-image: url('...-768x960.jpg'); } }
   ```
   Use a `data-slide="NN"` attribute as the selector to avoid coupling to the existing `data-bg-*` attributes (which we're removing).

2. **Strip inline `style="background-image: url(...)"` from each `.carousel-slide` in HTML.** Keep `--focal-point` inline (that's a per-slide design value, not an image-source value). Remove `data-bg-desktop`, `data-bg-tablet`, `data-bg-mobile`. Add `data-slide="01"` through `data-slide="04"`.

3. **Update HTML preload.** Replace the current dual JPG+WebP preload with a single `<link rel="preload">` using `imagesrcset` so the browser picks the right variant. Drop the WebP preload entirely (slides still load JPG since CSS references JPG; AVIF/WebP routing is Session D work).

4. **Verify locally on staging.** All 4 slides render at all 3 viewport sizes. Rotation still works. Hard-refresh on mobile, tablet, desktop. Verify no double-fetch in Network tab (each slide → exactly one image request).

**Phase 2: JS cleanup (remove the now-redundant code)**

5. **In `CarouselController`, remove `setupResponsiveBackgrounds()`, `updateSlideBackground()`, and the `currentDeviceType` field.** Remove the call sites in `init()` and `handleResize()`. `handleResize()` becomes a no-op or gets deleted.

6. **In `CarouselController.preloadImages()`, simplify to a viewport-aware single-slide preload, then trigger deferred preload of remaining slides via `requestIdleCallback`.** The JS no longer needs to figure out variants — it just reads each slide's currently-applied background-image via `getComputedStyle` if a preload is needed, or skips preload entirely since the HTML preload + CSS already cover the LCP slide.

   *Open question for implementation: do we even need JS preloading of slides 2-4? Browsers will fetch their backgrounds when CSS resolves them, which happens on initial CSS parse — meaning slides 2-4 backgrounds start fetching as soon as the CSS is parsed. The JS preload may be redundant. To be measured.*

7. **Verify on staging.** Same checks as Phase 1, plus: console should show ONLY the slide-rotation logs, no "preloaded variant" warnings, no "preloaded but not used" warnings.

**Phase 3: LQIP placeholder (Convention 5)**

8. **Generate LQIP for slide 1.** Update `build-carousel-images.sh` to emit a tiny base64-encoded blurred placeholder for the active slide:
   ```bash
   magick "source.jpg" -resize "24x" -blur 0x2 -quality 30 - | base64
   ```
   Output goes into a CSS custom property like `--lqip-slide-01: url("data:image/jpeg;base64,...")`.

9. **Apply LQIP to slide 1's `.carousel-slide` as a `background-image` layer BEHIND the real image.** When the real image loads, it composites on top. Visitors see the blur immediately, real image fades in.

10. **Verify on staging.** Cold cache + slow connection: visitor should see blurred slide 1 within ~50ms of first paint, real image within ~500ms.

**Phase 4: Page-image colocation cleanup (Convention 4)**

11. **Audit homepage DOM for off-page image references.** All the `service-*`, `about-founder-*`, `hoa-*`, `pool-cleaning-*` images we saw in the waterfall. Find where they're referenced.

12. **Decide per-image:** (a) it's actually used in a homepage preview component → leave it but lazy-load with `loading="lazy"`, OR (b) it's not visible/used → remove the reference.

13. **Verify on staging.** Network waterfall should show <10 image requests on cold-cache homepage load.

**Phase 5: Documentation**

14. **Update `DESIGN-SYSTEM.md`** with a "Performance" section that documents the six conventions, with code examples drawn from the homepage as the reference implementation.

15. **Update `STAGING-WORKFLOW.md`** with the Cloudflare cache purge step that bit us earlier.

16. **Commit, push to staging, verify, PR to main, deploy.**

**Phase 6: Observability (no enforcement yet)**

17. **Add Lighthouse CI as a workflow that reports but doesn't block.** Establishes baseline numbers. Convention 6 enforcement is Session C work.

---

### Estimated session A duration

Phases 1-2 are the core perf work (~60% of the session). Phase 3 adds polish (~20%). Phase 4 is mechanical cleanup (~10%). Phases 5-6 are documentation and observability (~10%).

Total: one focused working session. Multiple checkpoints with staging verification between phases.

---

*End of Session 0 audit and Session A planning. Awaiting Jasper's go-ahead to begin Session A Phase 1.*
