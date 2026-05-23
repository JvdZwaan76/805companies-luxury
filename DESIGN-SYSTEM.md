# 805 LifeGuard Luxury — Design System Conventions

This document captures project-specific design system conventions that
aren't obvious from reading the CSS or HTML alone. It's not a generic
CSS reference; it's the set of decisions that, if not documented, would
cause inconsistency as the codebase grows across pages and future
franchise sites.

## Hero carousel focal points

### The problem

The hero `.carousel-slide` element renders its image via `background-size:
cover`, which scales the image to fill the slide area and crops whatever
doesn't fit. By default, the crop is anchored to `center center`, which
works only when the image's primary subject is centered. Off-center
compositions (e.g. luxury sunset estate with the lifeguard upper-left)
get the subject clipped at certain viewport ratios.

### The convention

Each carousel slide declares its **focal point** as a CSS custom property
inline on the slide element:

```html
<div class="carousel-slide"
     style="background-image: url('/images/home/hero-01-...jpg'); --focal-point: 30% 20%;"
     data-bg-desktop="..."
     data-bg-tablet="..."
     data-bg-mobile="..."
     aria-label="...">
</div>
```

The CSS resolves `background-position` from this variable:

```css
.carousel-slide {
    background-position: var(--focal-point, center);
    /* ... */
}
```

The fallback `center` means slides without `--focal-point` render
identically to before — the convention is opt-in, not retroactive.

### Choosing values

`--focal-point: X% Y%`

- **X (horizontal):** percentage from left. `0%` = anchor at left edge,
  `50%` = center, `100%` = anchor at right edge.
- **Y (vertical):** percentage from top. `0%` = anchor at top edge,
  `50%` = center, `100%` = anchor at bottom edge.

The percentage means: align that point of the **image** with that point
of the **viewport**. So `--focal-point: 30% 35%` anchors the image such
that the point 30% from the image's left edge and 35% from its top edge
sits at the same percentages of the viewport. The crop happens around
that anchor.

**Workflow for choosing values:**

1. Open the source image in Preview at the rendered viewport's aspect
   ratio (1920x1080 for desktop hero, 768x960 for mobile hero).
2. Identify where the primary subject's recognizable feature (face,
   logo, focal element) sits in the image as X% and Y%.
3. Use those percentages as `--focal-point`.
4. Verify in browser on multiple viewport heights — the value should
   keep the subject visible across the full range of likely screens.

### Current values (homepage)

| Slide | File | Focal point | Subject |
|---|---|---|---|
| 01 | hero-01-sunset-estate-supervision | `30% 20%` | Lifeguard upper-left, sunset upper-half |
| 02 | hero-02-poolside-coverage | `40% 30%` | Lifeguard center-left, ocean horizon middle |
| 03 | hero-03-underwater-instruction | `50% 50%` | Swimmer centered (default; included for clarity) |
| 04 | hero-04-hoa-lap-pool-coverage | `65% 45%` | Lifeguard right side, slightly above vertical center |

### Current values (about page)

| Slide | File | Focal point | Subject |
|---|---|---|---|
| 01 | about-01-team-hero | `50% 30%` | Coach + 2 medal kids, faces in upper third |
| 02 | about-02-founder-story | `center` (default) | Coach + young swimmer, action centered |
| 03 | about-03-certifications | `30% 50%` | Beach lifeguard standing left-of-center |
| 04 | about-04-company-mission | `55% 30%` | Beach guard profile, face in upper third |
| 05 | about-05-excellence-track-record | `center` (default) | 3 medal students + coach, group centered |

### Current values (testimonials page)

| Slide | File | Focal point | Subject |
|---|---|---|---|
| 01 | testimonials-01-instructor-stars-stripes-medal | `center` (default) | Instructor + boy with medal in stars-stripes trunks, centered |
| 02 | testimonials-02-hoa-guard-on-duty | `70% 50%` | HOA guard with rescue tube, right side of frame |
| 03 | testimonials-03-instructor-goggles-safety-fence | `50% 35%` | Instructor + boy in goggles with medal, faces in upper third |
| 04 | testimonials-04-instructor-blonde-poolside-medal | `center` (default) | Instructor + blonde boy with medal, sunny SoCal pool centered |

### Migration plan for other pages

9 other HTML files share the `.carousel-slide` selector:

- careers.html, faq.html, hoa.html, insurance.html,
  pool-cleaning.html, portfolio.html, privacy.html, services.html,
  terms.html

These currently use the `center` fallback (no `--focal-point` set) and
render identically to pre-convention behaviour. When each page's hero
imagery is refreshed with page-specific photography, add explicit
`--focal-point` values to each slide following this convention and
update this document's table.

### When NOT to use a focal point

Don't add `--focal-point` to slides whose subject is centered or that
fill the frame edge-to-edge (e.g. patterns, abstract textures). The
fallback `center` is correct for those.

### Why the carousel is inset from the navbar

The `.header` element is `position: fixed; top: 0` with a total height of
`--header-total-height` (132px desktop, `--header-navbar-height` 88px on
mobile where the contact top-bar is hidden). The `.hero` element starts
at the top of the document — its top 132px would normally be occluded
by the fixed header.

Earlier versions of `.hero-carousel` were `position: absolute; top: 0;
height: 100%`, which meant the slide image painted across the full hero
area including the zone behind the navbar. Focal-point Y values had
to compensate for the occluded zone, making the system unintuitive.

Current pattern:

```css
.hero-carousel {
    position: absolute;
    top: var(--header-total-height);   /* desktop: 132px */
    left: 0;
    right: 0;
    bottom: 0;
}

@media (max-width: 768px) {
    .hero-carousel {
        top: var(--header-navbar-height); /* mobile: 88px */
    }
}
```

This insets the carousel so the image paints only in the visible area
below the navbar. `--focal-point` values now map directly to what the
visitor sees, with no occluded-zone math.

### Why `.hero` has no background-image fallback

Older versions of `.hero` carried a hardcoded `background-image:
url('hero-01-...')` so first paint had an image before the carousel
JS hydrated. That created two problems once the navbar inset above
was applied:

1. **Mobile bleed:** the gap between the navbar bottom (88px) and the
   carousel top (88px) is zero — but if `.hero` painted slide-01 from
   y=0, you'd see a sliver of slide-01 above any active slide that
   wasn't slide-01.
2. **Layered redundancy:** the carousel hydrates on initial paint, so
   the static image is masked within a few hundred milliseconds anyway
   — no real benefit, only architectural noise.

`.hero` now carries only the dark gradient overlay used to keep the
white headline readable across all four slides. The carousel handles
all slide imagery.

### Future: portrait variants and per-viewport focal points

Currently, the same `--focal-point` is used regardless of which
viewport variant (desktop 1920x1080, tablet 1024x576, mobile 768x960)
is rendered. This works because each variant is cropped at build time
to put the subject in roughly the same relative position. If a future
design needs viewport-specific focal points (e.g. very different mobile
composition), extend the convention with `--focal-point-desktop`,
`--focal-point-tablet`, `--focal-point-mobile` and resolve them in
media queries. Do not introduce JS for this — keep it declarative.

---

## Other conventions (placeholder)

This file is the home for project-specific conventions as they emerge.
Future entries might cover: typography scale, spacing tokens, image
optimization budgets, animation timing tokens, etc. Add them here
rather than scattering decisions across the codebase.
