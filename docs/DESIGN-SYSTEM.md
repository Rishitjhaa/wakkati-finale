# WAKKATI — DESIGN SYSTEM (Profile 01 → all profiles)

## 0. Assumptions (decided, not asked)
- Budget ₹10,000 → no stock-photo licences, no paid fonts/plugins. GSAP core + ScrollTrigger (free), Google Fonts (self-host WOFF2 for speed).
- Catalogue is empty: all product data is placeholder; never invent prices, fabrics, policies. Placeholders are marked `TODO-CLIENT`.
- Existing Instagram imagery is inconsistent (sale flyers, festival graphics, AI-looking model shots). The site uses **only clean model/product photos**, cropped to fixed ratios, with a unified emerald-tinted background treatment. No flyers/discount graphics on the site.
- Checkout = WhatsApp message. Number lives in `assets/js/config.js` (`TODO-CLIENT`).
- Reference principles (from brief labels, verify against videos): 01 cinematic reveal & scale contrast; 02 thumb-reach actions, sticky bottom bar; 03 colour-first browsing; 04 generous desktop whitespace, hover detail; 05 multi-product outfits with one-tap "add all".

## 1. Creative concepts (Deliverable 01)

| | A. THE THREAD (atelier) | B. EMERALD SALON (cinema) | C. LOOKBOOK FOLIO (magazine) |
|---|---|---|---|
| Idea | A gold stitching thread runs through the whole site, drawing as you scroll and "pinning" looks, tags and categories. Tailor's tape, hang tags, swatches. | Dark emerald runway: full-bleed video, curtain reveals, spotlight cursor. | Collage editorial: oversized serif type, overlapping photos, page-turn transitions. |
| Personality | Crafted, feminine, tactile | Dramatic, nightclub-luxury | Fashion-mag, loud |
| Brand fit | High: "Atelier" + kurtis/ethnic tailoring heritage + logo's leaf-W stitch-like linework | Medium: too dark for everyday kurtis, hurts colour-accurate product viewing | Medium: needs strong editorial photography the brand doesn't have yet |
| Uniqueness | High, ownable motif (thread) | Medium (common luxury trope) | Medium-high |
| Difficulty | Medium (SVG path + ScrollTrigger) | Medium-high (video weight) | High (layout fragility on mobile) |
| Performance | Excellent: SVG + images only | Poor on Indian mobile data | Medium |

**WINNER: A — THE THREAD.** It is the only concept that works with imperfect photography (the motif carries the identity, not the pictures), costs nothing in assets, runs fast on mid-range Android, and turns commerce moments (pinning a look, adding to cart) into one consistent story: *stitching an outfit together*.

**Signature motif rules:** one continuous 1.5px Champagne Gold thread, never more than one visible path per viewport, never over body text. A small needle-dot leads the line. Gold used only for thread, hairlines, focus rings and CTA hover. Max ~5% of any screen.

## 2. Colour
| Token | Hex | Use |
|---|---|---|
| --emerald-900 | #0C2A1D | Footer, curtain, deep sections (new) |
| --emerald | #123D2A | Brand primary, buttons, dark sections |
| --gold | #C8A96B | Thread, hairlines, accents on dark |
| --gold-ink | #7A5F2E | Gold text on ivory (contrast 5.3:1) |
| --ivory | #F5F0E6 | Default page background |
| --ink | #17221C | Body text on ivory |
| --rose | #B77C70 | Wishlist, sale-free highlights, tags (decorative only; not for small text) |
| --sand | #D8C8B0 | Cards, dividers, placeholders |
| --paper | #FBF8F2 | Raised surfaces/modals |
| --success | #2F7D55 / --error #A3392F | Feedback |
Rules: text on ivory = ink or emerald; text on emerald = ivory or gold. No gradients except one allowed 8% emerald→transparent scrim on photos for legibility. No beige-on-beige sections: alternate ivory / emerald / paper.

## 3. Typography
- Display: **Cormorant Garamond** 500, 600, italic 500 (self-host latin subset).
- UI/body: **DM Sans** 400, 500, 600.
- Italic Cormorant is the "voice" (one italic word per headline, e.g. *Atelier*).

| Role | Mobile | Desktop | Font/Weight | Tracking | Line-h |
|---|---|---|---|---|---|
| Display XL (hero) | 52px | clamp up to 128px | Cormorant 500 | -0.01em | 0.95 |
| H1 | 40 | 72 | Cormorant 500 | 0 | 1.0 |
| H2 | 32 | 52 | Cormorant 500 | 0 | 1.05 |
| H3 | 24 | 32 | Cormorant 600 | 0 | 1.15 |
| Eyebrow | 11 | 12 | DM Sans 600 uppercase | 0.22em | 1.3 |
| Body | 16 | 17 | DM Sans 400 | 0 | 1.6 |
| Small/meta | 13 | 14 | DM Sans 400 | 0.01em | 1.5 |
| Price | 16 | 18 | DM Sans 600 | 0 | 1 |
Use `clamp()` fluid sizes. Min body 16px on mobile. Devanagari not required v1.

## 4. Spacing, grid, ratios
- Base unit 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 144 (`--s-1`…`--s-10`).
- Section padding: 64px mobile / 144px desktop vertical.
- Grid: mobile 4 col, 16px gutter, 20px margin; tablet 8 col, 24px; desktop 12 col, 32px gutter, max width 1440px, 64px margin.
- Radius: 0 for photos (editorial), 999px for pills/dots, 4px for inputs. Hairlines 1px `rgba(23,34,28,.14)`.
- Image ratios: product card 4:5; product gallery 4:5 (zoom) + 1:1 detail; hero desktop 16:9, hero mobile 4:5; look image 3:4; category tile 3:4; editorial 2:3 and 16:10; swatch chip 1:1.

## 5. Breakpoints
`xs <480` · `sm 480` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. Mobile-first `min-width` queries only. Touch targets ≥ 44px.

## 6. Components (visual spec)
**Buttons** — Height 52 (mobile) / 56. Uppercase DM Sans 600 12px, 0.18em tracking.
- Primary: emerald fill, ivory text; hover: gold underline sweeps in (300ms), fill darkens to emerald-900.
- Secondary: 1px emerald border, transparent; hover fills emerald.
- On-dark: ivory fill, emerald text.
- Text link: underline is a 1px gold line that draws left→right on hover.
- States: focus-visible 2px gold ring + 2px ivory offset; disabled 40% opacity; loading = needle-dot pulsing.

**Navigation** — Desktop: 72px header, transparent over hero → ivory + hairline after 80px scroll. Left: Shop · Collections · About; centre: logo; right: Search (v2), Wishlist, Bag (count badge). Mobile: 60px header, logo centre, menu left, bag right; full-screen emerald menu with large Cormorant links; **sticky bottom bar on product page** (Add to bag + WhatsApp).

**Product card ("hang tag")** — 4:5 image, paper tag below with 1px hairline, a punched gold dot top-left of the tag. Shows name (Cormorant 22), price, up to 5 colour dots. Hover (desktop): second image crossfade 400ms, "Quick add" slides up. Wishlist heart top-right of image (rose when active). Mobile: no hover; tap = product page; heart + quick add visible.

**Modals/drawers** — Quick view (desktop modal 960px, mobile bottom sheet 92vh), cart drawer 440px right (mobile full-width bottom sheet). Backdrop emerald-900 @ 60%. Focus trap, ESC closes, scroll-lock, `aria-modal`.

**Forms** — Underline inputs (1px ink hairline, label floats), 4px radius for textarea, error text rose-dark + icon.

**Interaction states (all interactive)**: default → hover (desktop only, wrapped in `@media (hover:hover)`) → focus-visible → active (scale .98, 120ms) → disabled → loading. Out-of-stock: image 60% opacity, "Ask on WhatsApp" replaces Add.

## 7. Motion system (Deliverable 05)
Tokens: `--ease-out: cubic-bezier(.22,1,.36,1)` (GSAP `expo.out`/`power3.out`), `--ease-inout: cubic-bezier(.65,0,.35,1)` (`power3.inOut`). Durations: micro 120–200ms, UI 300–450ms, section 700–1100ms, hero 1400–1800ms. Animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`. Never animate layout.

| # | Name | Behaviour | Trigger | Duration/ease | Mobile / fallback |
|---|---|---|---|---|---|
| M1 | Curtain open | Two emerald halves with logo centre split horizontally via `clip-path`/translateX ±100%, hero scales 1.12→1 | Page load, once per session (`sessionStorage`) | 1400–1800ms, inout then out | Shortened to 900ms; skipped if reduced-motion or returning visitor |
| M2 | The Thread | Fixed-position SVG path (viewBox mapped to document height) draws via `stroke-dashoffset` scrubbed to scroll; needle-dot at head; path detours around hero text | ScrollTrigger scrub 0.6 | scrub | Mobile: thread runs only in left 12px gutter, simplified path; reduced-motion: fully drawn static |
| M3 | Line mask reveal | Headlines split by line; each line translateY 110%→0 inside overflow-hidden | ScrollTrigger start "top 85%", once | 800–1000ms, stagger 80ms, expo.out | Same, no split on >8 words; fade only |
| M4 | Image unveil | Photo `clip-path: inset(0 0 100% 0)`→full + inner scale 1.15→1 | Enter viewport, once | 900–1100ms, power3.out | Fade + 12px rise, 500ms |
| M5 | Tape nav | Horizontal ruler; tick under pointer enlarges, preview tile follows cursor with 0.15 lag | Hover/pointer move | 300ms follow | Becomes horizontal scroll-snap chips with tick marks; no cursor preview |
| M6 | Swatch wipe | Selecting colour wipes new image over old via `clip-path` circle from the dot's position | Click/tap swatch | 500–650ms, power3.inOut | Crossfade 300ms |
| M7 | Look pins | Pins pulse (scale 1→1.6 ring, 2s loop); active pin draws a thread line to the tag-card | Hover/tap pin | 350ms | Pins tap → bottom sheet card; no thread line |
| M8 | Thread-to-bag | On Add: product thumbnail follows a curved path to bag icon, bag badge ticks | Click Add | 700–900ms, power2.inOut | Thumbnail fade-fly 500ms; skip if low-power |
| M9 | Bag rail | Drawer opens; items drop in like hang tags with 4° swing settling | Open cart | 400ms + stagger 70ms, elastic.out(1,.6) subtle | Same, no swing |
| M10 | Footer stitch | Giant WAKKATI wordmark outline; thread stitches along its baseline then fills emerald→gold stroke | Footer 30% visible | 1600ms | Static wordmark, fade |
| M11 | Pinned story | Editorial section pins 3 chapters; image crossfades, text lines swap | ScrollTrigger pin + scrub | scrub | **No pin** on mobile: stacked chapters with M4 |
| M12 | Marquee | Slow text marquee (30–40s loop) | Always | linear | Pause when offscreen / reduced motion |

Global rules: honour `prefers-reduced-motion` (all become opacity-only ≤200ms, thread static). Use `gsap.matchMedia()`. Kill ScrollTriggers on pagehide. Smooth scroll library NOT used (native scroll for Android performance). Lazy-init animations only when section is within 1 viewport.
