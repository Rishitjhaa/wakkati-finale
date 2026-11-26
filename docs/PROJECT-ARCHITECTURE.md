# WAKKATI — PROJECT ARCHITECTURE

## 1. Page architecture (Deliverable 04)
| Page | File | Purpose & contents |
|---|---|---|
| Home | `index.html` | Brand story + discovery. See HANDOFF.md §Homepage blueprint |
| Shop | `shop.html` | Grid 2-col mobile / 4-col desktop (4:5 cards). Sticky filter bar: category chips (Kurtis, Ethnic, Western, Co-ords — from data), colour swatch filter, sort (New, Price low/high). Filters via JS on static data; URL params `?cat=kurtis&color=emerald`. 24 items then "Load more". |
| Collections | `collections.html` (index) + `collection.html?slug=` | Index: large editorial tiles per collection. Detail: collection intro (title, line of copy), then filtered grid. |
| Product | `product.html?id=WK-001` | Gallery (swipe on mobile, thumbs + zoom on desktop), name, price, colour swatches, size selector, quantity, Add to bag, "Order on WhatsApp", details accordions (description, fabric & care `TODO-CLIENT`, delivery), "Complete the look" (related), recently viewed. Sticky bottom bar on mobile. JSON-LD Product schema. |
| Cart | `cart.html` + drawer | Line items (qty, remove), note field, subtotal (no shipping calc), "Send order on WhatsApp". Empty state with thread illustration + CTA. |
| About | `about.html` | Brand story (copy `TODO-CLIENT`), three values, atelier imagery, Instagram CTA. |
| Contact | `contact.html` | WhatsApp primary, Instagram DM, email, simple form → opens WhatsApp prefilled. No backend. |
| Policies | `shipping-policy.html`, `returns-policy.html`, `privacy-policy.html`, `terms.html` | Plain templates, copy `TODO-CLIENT`; do not invent terms. |
| 404 | `404.html` | Broken-thread illustration, links home/shop. |

Nav: Shop · Collections · About · Contact. Footer: policies, Instagram, WhatsApp, "Pan India delivery" (from Instagram bio).

## 2. Data model (static)
`assets/js/data/products.js` exports array. Schema:
```
{ id:"WK-001", slug, name, category:"kurtis|ethnic|western|coords",
  collection:["slug"], price:null|number /*TODO-CLIENT*/, compareAt:null,
  colors:[{name,hex,images:["wk-001-emerald-1.webp",...]}],
  sizes:["S","M","L","XL"] /*TODO-CLIENT*/, tags:["new","bestseller"],
  description:"", care:"", inStock:true, order:1 }
```
`looks.js`: `{ id, title, image, pins:[{x%,y%,productId}] }`. `collections.js`: `{slug,title,blurb,cover}`.
Cart: `localStorage["wakkati.cart.v1"]` = `[{id,color,size,qty}]`. Wishlist: `wakkati.wishlist.v1` = `[id]`. Always try/catch; fall back to memory.
WhatsApp message: "Hi WAKKATI! I'd like to order:\n1) Name — Colour, Size ×Qty — ₹Price\n…\nTotal: ₹X". Encode with `encodeURIComponent`, open `https://wa.me/<number>?text=`. Prices missing → line shows "Price on request".

## 3. Component system (Deliverable 06)
| Component | Files | Responsibility |
|---|---|---|
| Layout | `components/layout.js` | Injects header, footer, cart drawer, toast into every page from one template (no build step). `<noscript>` fallback links. |
| Header | `header.js`, `header.css` | Scroll state, mobile menu, badge counts |
| Thread | `motion/thread.js` | Generates/handles SVG path, ScrollTrigger scrub, mobile simplification |
| Curtain | `motion/curtain.js` | M1 and session gate |
| Reveal | `motion/reveal.js` | M3/M4 via `data-reveal="lines|image|fade"` attributes |
| ProductCard | `product-card.js` | Renders hang-tag card from product object; wishlist toggle; quick add |
| TapeNav | `tape-nav.js` | Category ruler (M5) |
| Swatches | `swatches.js` | Colour dots, image wipe (M6), emits `colorchange` |
| LookViewer | `look-viewer.js` | Pins, tag-card/bottom sheet, "Add whole look" |
| Gallery | `gallery.js` | Swipe (scroll-snap), thumbs, zoom-on-hover/pinch fallback to full-screen viewer |
| QuickView | `quick-view.js` | Modal/bottom sheet |
| CartDrawer | `cart-drawer.js` | Render, qty, remove, M8/M9, WhatsApp send |
| Store | `core/cart.js`, `wishlist.js` | State + events (`cart:change`) |
| Toast | `toast.js` | Non-blocking confirmations, `aria-live=polite` |
| Dialog util | `core/dialog.js` | Focus trap, scroll lock, ESC |

Conventions: BEM class names (`.card__title`), CSS custom properties from `tokens.css`, ES modules (`<script type="module">`), no globals except `window.WK` config. Components are functions `init(root)` that query `[data-component="name"]`.

## 4. Folder structure (Deliverable 08)
```
wakkati/
├─ index.html shop.html collections.html collection.html product.html
├─ cart.html about.html contact.html 404.html
├─ shipping-policy.html returns-policy.html privacy-policy.html terms.html
├─ robots.txt  sitemap.xml  _headers  (cache: assets/* immutable 1y)
├─ docs/ DESIGN-SYSTEM.md PROJECT-ARCHITECTURE.md HANDOFF.md
└─ assets/
   ├─ css/ tokens.css base.css layout.css components/*.css pages/*.css
   ├─ js/
   │  ├─ config.js            (WhatsApp number, brand strings)
   │  ├─ data/ products.js looks.js collections.js
   │  ├─ core/ cart.js wishlist.js whatsapp.js dialog.js utils.js
   │  ├─ motion/ gsap-init.js thread.js curtain.js reveal.js
   │  ├─ components/ (see table)
   │  ├─ pages/ home.js shop.js collection.js product.js cart.js
   │  └─ vendor/ gsap.min.js ScrollTrigger.min.js (self-hosted)
   ├─ fonts/ cormorant-garamond-*.woff2  dm-sans-*.woff2
   ├─ icons/ sprite.svg
   └─ img/ brand/ hero/ categories/ products/ looks/ editorial/ ui/
```
Performance budget: homepage ≤ 1.2MB initial transfer (excluding lazy), LCP image ≤ 150KB, JS ≤ 120KB gz, fonts ≤ 80KB. WebP (AVIF optional), `srcset` 480/800/1200, `loading="lazy"` below fold, explicit `width/height` to prevent CLS. Cloudflare Pages: connect Git, no build command, output dir `/`.
SEO/Accessibility: one H1/page, alt text on all images, skip link, contrast AA, visible focus, semantic landmarks.

## 5. Asset manifest (Deliverable 07)
Source: client's own Instagram originals (request uncompressed files), plus one optional low-cost shoot. Treat as minimum; replace as shoots occur.

| Filename | Ratio / size (px) | Used in |
|---|---|---|
| brand/logo-primary.svg | vector (trace from logo) | Header, curtain, footer |
| brand/logo-mark.svg | 1:1 vector (leaf-W) | Favicon, loader, thread start |
| brand/favicon-32/180/512.png | 1:1 | Browser/PWA |
| brand/og-share.jpg | 1.91:1 1200×630 | Social share |
| hero/hero-desktop.webp | 16:9 2400×1350 | Home hero (model, clean background, subject right third) |
| hero/hero-mobile.webp | 4:5 1200×1500 | Home hero mobile |
| hero/hero-loop.mp4 (optional) | 16:9 1280×720, ≤1.5MB, 6s, muted | Hero (desktop only; poster = hero-desktop) |
| categories/cat-kurtis.webp, cat-ethnic.webp, cat-western.webp, cat-coords.webp | 3:4 900×1200 | Tape nav previews, collections |
| products/wk-XXX-{color}-{n}.webp (n=1..4) | 4:5 1200×1500 + thumb 480×600 | Cards, gallery. 50–100 products × ≥2 images |
| products/wk-XXX-detail.webp | 1:1 1200×1200 | Gallery fabric/detail |
| looks/look-01…03.webp | 3:4 1500×2000 | Shop the Look (full outfit, full-length) |
| editorial/ed-01…03.webp | 2:3 1200×1800 | Pinned story chapters |
| editorial/ed-wide.webp | 16:10 2000×1250 | About, collection banner |
| collections/col-{slug}.webp | 3:4 900×1200 | Collections index |
| ui/texture-linen.webp | 600×600 tile, ≤30KB | Paper surface (subtle) |
| ui/thread-empty-cart.svg | vector | Empty cart/404 |
| icons/sprite.svg | 24px stroke 1.5 | bag, heart, menu, close, arrow, whatsapp, instagram, plus, minus, truck, ruler, filter |
Photo direction: natural light, full-length plus waist-up, neutral/ivory/emerald backdrop, no text or price overlays, consistent crop, colour-accurate.
