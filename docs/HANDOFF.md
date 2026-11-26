# WAKKATI — HANDOFF TO PROFILE 02

## Mission
Implement **only**: global tokens/base CSS, layout.js (header/footer/cart drawer), core cart/wishlist/whatsapp, and the **full homepage** (`index.html`) per blueprint below, using placeholder data/images. Read DESIGN-SYSTEM.md and PROJECT-ARCHITECTURE.md first. Concept: **THE THREAD** — a single gold stitching line connects every section.

## Homepage blueprint (Deliverable 03)
Order, top → bottom. Type tokens refer to DESIGN-SYSTEM §3. Reveal = M3/M4 unless stated.

### 0. Curtain (M1)
Full-screen emerald-900, centred logo-mark + wordmark in ivory. Splits open to reveal hero. Once per session. Skip link and focus remain accessible.

### 1. Header
Transparent, ivory logo/links over hero; switches to ivory bg with ink text after 80px. Mobile: menu · logo · bag.

### 2. Hero — "The Digital Atelier"
- Layout: 100svh. Desktop: full-bleed image/video right 60%, emerald-900 panel left 40% overlapping 80px (hairline gold edge). Mobile: full-bleed 4:5 photo, text anchored bottom over 8% scrim.
- Content: eyebrow "WAKKATI · MODERN WOMEN'S FASHION"; H1 Display XL "Dressed in *time*, stitched with care" (copy placeholder, client may revise); sub line (body) "Kurtis, ethnic and contemporary edits. Pan India delivery."; CTAs "Shop new arrivals" (on-dark primary) + "Shop the look" (text link).
- Composition: model offset right, headline overlaps image edge by ~10%; thread begins as needle-dot at the headline end and exits bottom into section 3.
- Image: hero-desktop/mobile; loop video desktop only if available.
- Animation: M1 end-state → H1 line reveal (stagger 80ms) → CTAs fade 300ms. Slow Ken-Burns 1→1.05 over 20s (disabled on mobile).
- Interaction: scroll-down cue (animated thread tick).

### 3. Trust marquee
Thin emerald strip, 56px, ivory small caps text: "NEW ARRIVALS WEEKLY · PAN INDIA DELIVERY · ORDER VIA WHATSAPP" separated by gold diamonds (taken from Instagram bio; add no other claims). M12.

### 4. Tape-Measure category nav ("Find your fit")
- Layout: ivory. H2 + a horizontal ruler graphic (cm ticks in hairline ink) spanning full width; four labels (Kurtis, Ethnic, Western, Co-ords) placed at major ticks as large Cormorant 56–96px.
- Interaction: hover label → ticks near it scale up; 3:4 preview image follows pointer (M5); click → `shop.html?cat=`. 
- Mobile: labels stacked large rows with image thumbnail 72×96 on right and tick marks left; tap goes to shop.
- Image: cat-*.webp.

### 5. New Arrivals Showroom
- Layout: paper bg. Heading left "New in the *atelier*" + "View all". Desktop: horizontal rail of hang-tag cards (4 visible, card 4:5, scroll-snap, drag + arrow buttons); a thin progress bar in gold. Mobile: 1.3 cards visible, swipe.
- Content: first 8 products with `tags` including "new" from `products.js`.
- Interaction: colour dots swap image (M6); heart; quick add (M8); card hover second image.
- Animation: cards stagger in (fade+rise 40px, 80ms).

### 6. Shop the Look (signature)
- Layout: emerald bg, 12-col. Desktop: look image 3:4 spans cols 2–6; right (cols 7–11) = title "Shop the *look*", look selector (01/02/03 as numbered thread knots), list of products in this look, total, "Add whole look to bag".
- Pins: numbered gold dots on image (percentage coordinates from `looks.js`). Hover/tap → tag-card (thumb, name, price, size select, add) + a thread line draws from pin to card (desktop). Switching looks: image wipe 700ms.
- Mobile: image full width, pins tap → bottom sheet; "Add whole look" sticky at bottom of section.
- Image: look-01…03.

### 7. Colour Fan — "Find your colour"
- Layout: ivory. A fan of 8–10 overlapping vertical swatch cards (fabric colour hexes pulled from product data, unique colours), each 120×360 desktop, rotated -24°…+24° around bottom-centre.
- Interaction: hover/tap a swatch lifts it and fans others; click filters a 4-product row below with matching products (cross-fade). "See all in {colour}" → `shop.html?color=`.
- Mobile: horizontal scroll-snap chips of colour circles (56px) + same product row.
- Fallback if <6 colours in data: render as simple row of dots.

### 8. Pinned Editorial Story — "A day in WAKKATI"
- Layout: ivory→emerald transition. Desktop: pinned 100vh, image left 2:3 (crossfades through 3 chapters), text right: chapter number (Cormorant italic 120px, gold outline), H2, 40-word paragraph (`TODO-CLIENT` copy), link "Shop this edit".
- Chapters (placeholder): Morning (kurtis), Afternoon (western), Evening (ethnic).
- Animation: M11 scrub; thread passes through chapter numbers.
- Mobile: no pin; three stacked blocks, image 4:5 then text, M4.

### 9. As Seen on Instagram
- Layout: paper bg. Heading "@wakkati2025"; 6-tile 4:5 grid (3 cols desktop ×2, 2 cols mobile) using client's selected clean posts, each links to Instagram. Follow CTA (secondary). No fake follower counts or testimonials.
- Animation: tiles unveil, hover scale 1.03.

### 10. WhatsApp Concierge
- Layout: full-width emerald-900 band, centred. H2 "Not sure what suits you? *Ask us.*" Body one line. Button on-dark "Chat on WhatsApp" (opens prefilled message). 
- Visual: thread loops into a small bow/knot around the button (SVG).

### 11. Footer — brand conclusion
- Layout: emerald-900. Top: newsletter-free; columns Shop / Help (policies) / Connect (Instagram, WhatsApp, email `TODO-CLIENT`). Bottom: giant WAKKATI wordmark (clamp 18vw) outline in gold at 40% opacity, thread stitches along baseline and wordmark fills (M10). Copyright line.
- Mobile: columns stack; wordmark 22vw.

## Cross-cutting requirements for Profile 02
1. Thread (M2) must start in hero, pass sections 3–11, and **end at the footer wordmark baseline**. One continuous SVG, built from section anchors (`data-thread-anchor`).
2. Cart drawer + toasts + header badge work on homepage (add from cards, looks).
3. All copy flagged `TODO-CLIENT` stays in `assets/js/config.js` or HTML comments, not hard-coded across files.
4. Use placeholder images (`sand` blocks with ratio labels) until real assets arrive; filenames must match the manifest exactly.
5. Lighthouse targets (mobile): Performance ≥ 85, Accessibility ≥ 95.
6. Do not add libraries beyond GSAP + ScrollTrigger. Do not write product copy, prices, fabrics or policies.

## Definition of done (Profile 02)
Homepage renders at 360, 768, 1280, 1536 widths; reduced-motion verified; keyboard path through header → hero CTA → cards → look pins → footer; localStorage cart persists across reload; WhatsApp link opens with correct prefilled order.

## Pipeline for later profiles (suggested)
03 Shop/Collections/filters · 04 Product page/gallery/quick view · 05 Cart page, about/contact/policies, SEO, QA, Cloudflare deploy.

## Open client inputs (needed before launch, none block Profile 02)
WhatsApp number · original uncompressed photos · product list with prices/sizes/fabric · policy wording · About copy · confirm usable Instagram posts.
