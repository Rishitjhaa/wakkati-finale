# WAKKATI — PROFILE EXECUTION PLAN (binding engineering contract)

Governs Profiles 02, 03, 04, 05. Read together with `docs/DESIGN-SYSTEM.md`, `docs/PROJECT-ARCHITECTURE.md`, `docs/HANDOFF.md`. Those three files are **frozen**: no profile edits them.

## 0. Precedence and amendments
Where this plan and `HANDOFF.md` differ, **this plan wins**. Amendments:
1. Profile 02 builds **no cart logic, no wishlist logic, no cart drawer**. HANDOFF cross-cutting item 2 and the cart/WhatsApp lines of its Definition of Done move to Profile 04 and 05.
2. Pipeline in HANDOFF ("03 Shop · 04 Product/gallery · 05 Cart/static/QA") is replaced by §1 below.
3. Homepage "Add" actions only **dispatch events** (§4). Nothing is added to a bag until Profile 04 ships.
4. Cart storage stays exactly as in PROJECT-ARCHITECTURE: `wakkati.cart.v1` = array of `{id,color,size,qty}`.
5. Tech is fixed: HTML5, CSS3, vanilla JS (ES modules), GSAP + ScrollTrigger (self-hosted). No framework, backend, database, payment gateway, build step, or npm runtime dependency. Hosting: Cloudflare Pages, no build command. Checkout: WhatsApp.

## 1. Profile scopes (one lane each)

| Profile | Lane | Delivers | Explicitly NOT |
|---|---|---|---|
| **02** | Foundation + Homepage | Tokens, base/layout CSS, shared JS namespace/events/utils/routes, read-only catalogue helpers, **seed data**, layout (header/footer/menu/toast), ProductCard, full `index.html` (all 12 blueprint sections incl. thread, curtain, tape nav, new arrivals, Shop the Look, colour fan, story, Instagram grid, WhatsApp band, footer), page template, vendor/fonts/icons/placeholders | Product page, cart logic, cart drawer, wishlist logic, shop/collections pages, filters, policies |
| **03** | Catalogue | Final product/collection/look data (24 placeholder products), `shop.html`, `collections.html`, `collection.html`, filter/sort/pagination, data validator | Homepage edits, cart or wishlist logic, product page, global styles |
| **04** | Product + Commerce | `product.html`, gallery, size/qty UI, quick view, cart core (`cart.js`), wishlist core, cart drawer (+ Saved tab), `cart.html`, WhatsApp order builder, recently viewed, Product JSON-LD | Global styles, catalogue/data/filters, homepage layout, redesigns |
| **05** | Integration + QA | About, Contact, 4 policy pages, 404, robots/sitemap/_headers, SEO meta pass, link audit, defect patches (§9), QA report, deploy guide, final ZIP | Rewrites, restyling, refactors, new features, new components |

Each profile works only in its lane. If a task isn't listed for you, it isn't yours.

## 2. File ownership
Paths are relative to `wakkati/`. **Own** = may create and edit. Others may only *read/import* it.

### Profile 02 owns
- `index.html`
- `assets/css/`: `tokens.css`, `base.css`, `layout.css`, `components/{button,site-header,mobile-menu,site-footer,product-card,marquee,tape-nav,look-viewer,colour-fan,story,insta-grid,concierge,toast,dialog}.css`, `pages/home.css`
- `assets/js/config.js`; `core/{wk.js,catalog.js,dialog.js}`; `motion/{gsap-init.js,thread.js,curtain.js,reveal.js}`; `components/{layout.js,header.js,product-card.js,tape-nav.js,swatches.js,look-viewer.js,toast.js}`; `pages/home.js`; `vendor/*`
- `assets/fonts/*`, `assets/icons/sprite.svg`, `assets/img/brand/*`, `assets/img/ui/ph-*.svg` (placeholders), any placeholder images it generates under `assets/img/*`
- `docs/PAGE-TEMPLATE.html`, `docs/BUILD-LOG.md` (creates), `docs/CHECKSUMS.txt`
- **Seed data** (creates only): `assets/js/data/{products,collections,looks}.js` — 12 products, 4 collections, 3 looks. Ownership transfers to Profile 03 at handoff.

### Profile 03 owns
- `shop.html`, `collections.html`, `collection.html`
- `assets/css/components/{filter-bar,collection-tile,pagination}.css`, `pages/{shop,collections}.css`
- `assets/js/components/{filter-bar.js,collection-tile.js}`, `core/catalog-filter.js`, `pages/{shop,collections,collection}.js`
- `assets/js/data/{products,collections,looks}.js` (expand/own; schema in §5 is frozen)
- `tools/validate-data.mjs`

### Profile 04 owns
- `product.html`, `cart.html`
- `assets/css/components/{gallery,size-selector,qty-stepper,accordion,cart-drawer,cart-line,quick-view,sticky-buy-bar}.css`, `pages/{product,cart}.css`
- `assets/js/core/{cart.js,wishlist.js,whatsapp.js}`; `components/{cart-drawer.js,quick-view.js,gallery.js,size-selector.js,qty-stepper.js,accordion.js,recently-viewed.js}`; `pages/{product,cart}.js`

### Profile 05 owns
- `about.html`, `contact.html`, `shipping-policy.html`, `returns-policy.html`, `privacy-policy.html`, `terms.html`, `404.html`
- `assets/css/pages/{about,static}.css`, `assets/js/pages/{about,contact}.js`
- `robots.txt`, `sitemap.xml`, `_headers`, `_redirects` (optional)
- `docs/README.md`, `docs/QA-REPORT.md`, `docs/DEPLOY-CLOUDFLARE.md`
- Patch rights over others' files: **only §9**.

### Frozen for everyone
The three original docs, this plan, and `docs/PAGE-TEMPLATE.html` (except Profile 02 when creating it). Anything not owned by you: **do not edit, rename, move, or delete.** `BUILD-LOG.md` is append-only for all profiles.

### Change requests
If you need a change in another lane: do not edit it. Append to `docs/BUILD-LOG.md` a `CHANGE-REQUEST` entry (file, exact change, reason). Profile 05 resolves these.

## 3. Naming conventions
**CSS**
- Plain BEM, no framework: `.block`, `.block__element`, `.block--modifier`. One block per file in `components/`, filename = block name (`product-card.css` → `.product-card`).
- States: `.is-open`, `.is-active`, `.is-loading`, `.is-disabled`, `.has-items`. Utilities: `.u-visually-hidden`, `.u-stack`, `.u-container` (defined only in `layout.css`).
- Page scope: `<body class="page-home">`; page CSS selectors start with `.page-<name>`.
- Layers declared once in `base.css`: `@layer tokens, base, layout, components, pages, utilities;` every file wraps rules in its layer.
- Only `tokens.css` defines colours/spacing/type/motion variables (`--emerald`, `--s-4`, `--ease-out`, `--dur-ui`…). No hex values anywhere else. No `!important`.
- Hover rules inside `@media (hover:hover)`. Mobile-first `min-width` queries only, at 480/768/1024/1280/1536.

**HTML**
- Root-mounted components: `data-component="product-card"`; JS hooks `data-js="add"`; never select by styling class from JS.
- Motion hooks: `data-reveal="lines|image|fade"`, `data-thread-anchor`.
- Mount points (exact IDs, in every page): `#wk-header`, `#wk-footer`, `#wk-cart-root`, `#wk-toast-root`, `<main id="main">`.
- Every page is created from `docs/PAGE-TEMPLATE.html` (head meta, skip link, mount points, script order).

**JS**
- ES modules, named exports, no default exports, no globals except `window.WK`. File = kebab-case. Functions camelCase, constants UPPER_SNAKE.
- Each component exports `init(root = document)`; idempotent (guard with `root.dataset.wkInit`).
- One component = one file. **Before creating anything, grep `assets/js/components` and `core`; extend by import, never duplicate.**
- Script order (every page): GSAP and ScrollTrigger as `defer` scripts from `/assets/js/vendor/`, then `<script type="module" src="/assets/js/pages/<page>.js">`. Each page entry first runs `import '../components/layout.js'`.

## 4. Shared JavaScript contracts

### 4.1 Namespace (`core/wk.js`, Profile 02) — exposes `window.WK`
| Export | Signature / behaviour |
|---|---|
| `emit(name, detail)` / `on(name, fn)` | Thin wrappers over `document.dispatchEvent(new CustomEvent(...))` |
| `qs`, `qsa` | Query helpers |
| `storage` | `get(key, fallback)`, `set(key, value)`; try/catch; in-memory fallback if localStorage blocked |
| `formatPrice(n)` | `"₹1,299"`; `null` → `"Price on request"` |
| `imgPath(folder, file)` | → `/assets/img/<folder>/<file>` |
| `slugify(str)` | kebab-case |
| `prefersReducedMotion()` | boolean |
| `routes` | §7 builders |
| `config` | contents of `config.js` |
Later modules attach themselves: `WK.cart` (P04), `WK.wishlist` (P04). Consumers must optional-chain (`WK.cart?.count?.() ?? 0`).

### 4.2 Events (all on `document`; `detail` exact shapes)
| Event | detail | Fired by → handled by |
|---|---|---|
| `wk:cart:add` | `{id, color, size, qty, source}` (`color`=colour slug, `size` may be `null`) | cards/look/product page → `cart.js` |
| `wk:cart:add-many` | `{items:[{id,color,size,qty}], source}` | Shop the Look → `cart.js` |
| `wk:cart:open` | `{tab:"bag"\|"saved"}` | header → `cart-drawer.js` |
| `wk:cart:changed` | `{count, subtotal}` (`subtotal` = number or `null` if any line is unpriced) | `cart.js` → header badge, drawer |
| `wk:wishlist:toggle` | `{id}` | cards → `wishlist.js` |
| `wk:wishlist:changed` | `{ids:[...]}` | `wishlist.js` → cards, header |
| `wk:quickview:open` | `{id}` | cards → `quick-view.js` |
| `wk:toast` | `{message, type:"info"\|"success"\|"error"}` | anyone → `toast.js` |
| `wk:menu:toggle` | `{open:boolean}` | header → mobile menu |

### 4.3 Catalogue helpers (`core/catalog.js`, Profile 02, read-only over data)
`getAll()`, `getById(id)`, `getByTag(tag, limit)`, `getByCategory(cat)`, `getColors()` → unique `[{slug,name,hex}]`, `findVariant(product, colorSlug)` (falls back to first colour), `getCollections()`, `getCollection(slug)`, `getLooks()`, `getLook(id)`. Profile 03 adds filter/sort **in a new file** `core/catalog-filter.js`: `filterProducts({cat,color,sort,page,perPage})` → `{items,total,pages}`.

### 4.4 Components
| Module | Owner | Export |
|---|---|---|
| `components/product-card.js` | 02 | `renderProductCard(product, {colorSlug, variant:"rail"\|"grid"}) → HTMLElement`; used unchanged by 02, 03, 04 (related/recent) |
| `components/swatches.js` | 02 | `initSwatches(root, {onChange})` (also used by 04) |
| `components/layout.js` | 02 | `init()` injects header/footer/menu/toast; lazily `import()`s `cart-drawer.js` and `quick-view.js` with `.catch(()=>{})`. If quick view fails to load, `wk:quickview:open` falls back to `location.href = routes.product(id)` |
| `core/cart.js` | 04 | `getItems()`, `add(item)`, `addMany(items)`, `setQty(key,qty)`, `remove(key)`, `clear()`, `count()`, `subtotal()`, `lineKey(item)` = `"<id>\|<color>\|<size ?? 'na'>"`. Listens to `wk:cart:add(-many)`; emits `wk:cart:changed`; merges same `lineKey`; qty clamped 1–10 |
| `core/wishlist.js` | 04 | `has(id)`, `toggle(id)`, `all()` |
| `core/whatsapp.js` | 04 | `buildOrderMessage(items)`, `orderUrl(items)`, `enquiryUrl(text)`; number from `WK.config.whatsappNumber` |
| `components/filter-bar.js` | 03 | `init(root)`; reads/writes URL params §7 |

Cart lines store **no prices or names** — they are looked up from the catalogue at render time (price `null` → "Price on request"; unsized line prints "Size: to confirm on WhatsApp").

## 5. Data schemas (frozen; defined in PROJECT-ARCHITECTURE, restated precisely)

**Product** (`data/products.js` → `export const PRODUCTS = [...]`)
```
id           "WK-001"            /^WK-\d{3}$/, unique
slug         "kurti-01"          kebab, unique
name         string              (placeholder names marked "(placeholder)")
category     "kurtis"|"ethnic"|"western"|"coords"
collection   [slug]              existing collection slugs
price        number|null         TODO-CLIENT; never invent
compareAt    number|null
colors       [{ name, slug, hex, images:[filename...] }]   ≥1 colour, ≥1 image
sizes        ["S","M","L","XL"]  TODO-CLIENT
tags         ["new","bestseller"]
description  string ("" allowed)
care         string ("" allowed)
inStock      boolean
order        number              display order, ascending
placeholder  true                present on all seed/placeholder products
```
**Collection:** `{ slug, title, blurb, cover }` (`cover` = filename in `collections/`).
**Look:** `{ id:"look-01", title, image:"look-01.webp", pins:[{ x:0–100, y:0–100, productId, colorSlug }] }` (pins reference existing product ids).
**Cart** (`localStorage["wakkati.cart.v1"]`): `[{ id, color, size|null, qty }]`. **Wishlist** (`wakkati.wishlist.v1`): `["WK-001", ...]`. Never change keys or shape; if a change is unavoidable, bump to `.v2` and write a migration in `cart.js`.
**Seed volumes:** Profile 02 → 12 products (≥3 per category, ≥4 tagged `new`, ≥6 distinct colours across data), 4 collections, 3 looks (3–4 pins each). Profile 03 → exactly 24 products (≥4 per category, ≥8 with ≥2 colours), same collections/looks; all `price: null`.

## 6. Image path conventions (match asset manifest exactly)
All paths root-absolute under `/assets/img/`. Always built with `WK.imgPath()`.
| Asset | Path / filename |
|---|---|
| Brand | `brand/logo-primary.svg`, `logo-mark.svg`, `favicon-32/180/512.png`, `og-share.jpg` |
| Hero | `hero/hero-desktop.webp` (2400×1350), `hero-mobile.webp` (1200×1500), optional `hero-loop.mp4` |
| Categories | `categories/cat-kurtis.webp`, `cat-ethnic.webp`, `cat-western.webp`, `cat-coords.webp` |
| Products | `products/wk-001-<colorslug>-<n>.webp` (1200×1500) and `…-<n>-480.webp` (480×600 thumb); `products/wk-001-detail.webp` (1200×1200) |
| Looks | `looks/look-01.webp` … `look-03.webp` |
| Editorial | `editorial/ed-01…03.webp`, `ed-wide.webp` |
| Collections | `collections/col-<slug>.webp` |
| UI | `ui/texture-linen.webp`, `ui/thread-empty-cart.svg`, `ui/ph-4x5.svg`, `ph-3x4.svg`, `ph-2x3.svg`, `ph-16x9.svg` (placeholders, added by P02) |
Rules: every `<img>` has `width`, `height`, `alt` (`"<name> in <colour name>"`), `loading="lazy"` below fold (hero image: `fetchpriority="high"`, no lazy), `srcset` 480w/1200w for products, and `onerror` swapping to the matching `ph-*.svg`. Real photographs are not required to ship; missing files must degrade to placeholders.

## 7. Navigation and routing
Static site, root-absolute links with `.html` (Cloudflare Pages serves clean URLs automatically; canonical tags use clean URLs). All links in JS go through `WK.routes`:
| Builder | Output |
|---|---|
| `routes.home()` | `/index.html` |
| `routes.shop({cat,color,sort,page})` | `/shop.html?cat=kurtis&color=emerald&sort=new&page=2` |
| `routes.collections()` / `routes.collection(slug)` | `/collections.html` / `/collection.html?slug=<slug>` |
| `routes.product(id, colorSlug?)` | `/product.html?id=WK-001&color=<slug>` |
| `routes.cart()` | `/cart.html` |
| `routes.page(name)` | `/about.html`, `/contact.html`, `/shipping-policy.html`, `/returns-policy.html`, `/privacy-policy.html`, `/terms.html` |
Params: `cat` ∈ category enum; `color` = colour slug; `sort` ∈ `new|price-asc|price-desc` (default `new`); `page` ≥1 (24 per page). Invalid/unknown param → ignore, never throw; unknown product id → "Product not found" state with link to shop. Hash is for in-page anchors only (`#main`, `#new-arrivals`). Header nav: Shop · Collections · About · Contact; icons: Saved (opens drawer tab "saved"), Bag (opens drawer). Footer links to all policies. Header/footer markup is generated only by `layout.js` (single source).

## 8. ZIP handover protocol
**Names:** deliverable ZIP is `wakkati-p0N.zip` (N = the profile that produced it), single top-level folder `wakkati/`. Profile 02 receives no ZIP (starts from the three docs + this plan, creating `wakkati/`). The user uploads the previous ZIP to the next profile.

**On receipt (Profiles 03, 04, 05):**
```
ls /mnt/user-data/uploads
mkdir -p /home/claude/work && cd /home/claude/work
unzip -q /mnt/user-data/uploads/wakkati-p0<N-1>.zip && cd wakkati
sha256sum -c docs/CHECKSUMS.txt | grep -v ': OK'   # must print nothing; if it does, report and stop
cp docs/CHECKSUMS.txt docs/CHECKSUMS.prev.txt
tail -40 docs/BUILD-LOG.md                           # read last profile's notes and change requests
```
If the ZIP is missing, wrong, or checksums fail → stop and tell the user exactly what is wrong. Do not rebuild missing work. Read only: the three docs, this plan, `BUILD-LOG.md`, and files in your own lane plus the shared modules you import. Do not read or re-audit the whole repository.

**Before delivering:**
1. Ownership check: `sha256sum -c docs/CHECKSUMS.prev.txt 2>/dev/null | grep -v ': OK'` lists every file you changed/deleted/missing; each must be in your ownership list (§2). Revert any that are not. New files must be in your list too.
2. JS syntax check each file you touched (`node --check` on a temp `.mjs` copy) when node exists; otherwise note "unchecked" in the log.
3. Append your section to `docs/BUILD-LOG.md` (§10 template).
4. Regenerate: `find . -type f ! -name CHECKSUMS.txt ! -name CHECKSUMS.prev.txt ! -path './.git/*' -print0 | sort -z | xargs -0 sha256sum > docs/CHECKSUMS.txt`; delete `CHECKSUMS.prev.txt`.
5. `cd .. && zip -qr /mnt/user-data/outputs/wakkati-p0N.zip wakkati` and `present_files` that ZIP only.
6. Final chat message ≤ 150 words: files added/changed, what was verified, what was not, open change requests.

**If usage runs low:** stop at a clean file boundary. Never ship half-edited files. Mark the log `STATUS: INCOMPLETE` with an exact remaining-task checklist and still deliver the ZIP.

## 9. Integration rules
1. **One owner per file.** Edit nothing outside your list. Cross-lane needs → `CHANGE-REQUEST` in the log.
2. **No duplicates:** no second header/footer/card/modal/toast/drawer, no second copy of data, utilities, or constants. Import the shared module. A new file with the same responsibility as an existing one is a defect.
3. **Contracts are frozen:** event names/shapes (§4.2), module exports (§4), schemas (§5), routes (§7), ID mount points (§3). Additive optional fields only; changing a signature requires a change request resolved by Profile 05.
4. **No cross-lane styling:** use tokens and existing component classes; new CSS goes in a new file in your lane; never override another block's selectors.
5. **Graceful absence:** code must work when later modules don't exist yet (optional chaining, `.catch` on dynamic import). Not-yet-built routes simply 404 until delivered.
6. **Dependencies:** no CDN scripts, no new libraries, no inline `<style>`/`<script>` except JSON-LD and the page-template boot lines. GSAP animates only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`; always honour reduced motion via `gsap.matchMedia()`.
7. **No invention of business content:** prices, fabrics, policies, testimonials, counts → `TODO-CLIENT` placeholders in data/config.
8. **Profile 05 patch rights:** may fix verified defects in any file only if (a) logged in `QA-REPORT.md` with reproduction, (b) change ≤ 20 lines, (c) no renames, restyles or refactors. Anything larger goes to the "Known issues" list for the client/owner.

## 10. Required deliverables per profile (stop only when all are done)
BUILD-LOG template (append): `## Profile 0N — STATUS: COMPLETE|INCOMPLETE` · files created · files modified · contracts used · verified · not verified · change requests · remaining.

**Profile 02**
- [ ] Every file in its §2 list exists; `docs/PAGE-TEMPLATE.html` created
- [ ] `index.html` implements all 12 sections (0–11) of HANDOFF blueprint with placeholder imagery; thread runs hero → footer
- [ ] Header badge, menu, footer, toast work; add/heart/quick-add/add-look only emit events
- [ ] Seed data meets §5 volumes and validates against schema by inspection
- [ ] Verified at 360/768/1280/1536 and with reduced motion; log lists anything unverified
- [ ] ZIP `wakkati-p02.zip` + checksums + log

**Profile 03**
- [ ] 24-product data; collections and looks intact and consistent
- [ ] `shop.html` filters (category, colour, sort), URL-param sync, pagination via "Load more" at 24/page, empty-result state
- [ ] `collections.html` and `collection.html?slug=` including unknown-slug state
- [ ] Cards rendered only through `renderProductCard`; `tools/validate-data.mjs` passes (or manual validation logged)
- [ ] `wakkati-p03.zip` + checksums + log

**Profile 04**
- [ ] `cart.js`, `wishlist.js`, `whatsapp.js` implementing §4; persistence across reload; same-line merge; qty clamp; corrupt-storage recovery
- [ ] Cart drawer (Bag + Saved tabs) mounts in `#wk-cart-root` via lazy import; M8/M9 motion with reduced-motion fallback
- [ ] `product.html`: gallery (swipe + zoom/full-screen), colour via `swatches.js`, size, qty, Add, "Order on WhatsApp", accordions, related, recently viewed, mobile sticky bar, Product JSON-LD; not-found state
- [ ] `quick-view.js` (modal desktop / sheet mobile), `cart.html` with empty state
- [ ] Priced and unpriced (`null`) paths both verified; WhatsApp message format exactly per PROJECT-ARCHITECTURE
- [ ] `wakkati-p04.zip` + checksums + log

**Profile 05**
- [ ] All its §2 files; pages built from `PAGE-TEMPLATE.html` using existing components/classes only
- [ ] Contact form composes a WhatsApp message via `enquiryUrl`; no backend
- [ ] Link audit: every internal href/src resolves; every page has title, meta description, canonical, one H1, OG tags
- [ ] `sitemap.xml`, `robots.txt`, `_headers` (long cache for `/assets/*`, security headers)
- [ ] Integration test pass against §11; defects patched per §9.8 or listed
- [ ] `QA-REPORT.md`, `README.md` (VS Code/Live Server run notes, how to add a product), `DEPLOY-CLOUDFLARE.md` (Git connect, no build command, output dir `/`)
- [ ] `wakkati-p05.zip` (final release) + checksums + log

## 11. Final acceptance criteria (whole website)
**Functional**
1. All 14 pages exist and load with no console errors: home, shop, collections, collection, product, cart, about, contact, 4 policies, 404.
2. Add to bag from card quick view, product page and Shop the Look; cart persists across reloads and tabs; qty/remove work; badge always correct.
3. "Send order on WhatsApp" opens `wa.me` with the exact itemised message; unpriced items show "Price on request"; empty cart cannot send.
4. Shop filters/sort/pagination reflect in the URL and survive reload and back/forward.
5. Wishlist hearts persist and stay in sync across all cards and the Saved tab.
6. Unknown product id / collection slug / URL param degrades gracefully; `404.html` served for unknown paths.
7. Site works with `localStorage` blocked (in-memory fallback, no crash).
**Design & motion**
8. Colours/type/spacing come from tokens only; no gradients beyond the permitted scrim; gold ≤ ~5% of any view.
9. Thread motif, curtain, tape nav, colour fan, Shop the Look, bag rail and footer stitch behave per DESIGN-SYSTEM §7, with the specified mobile fallbacks.
10. `prefers-reduced-motion` yields opacity-only motion and a static thread.
**Engineering**
11. No frameworks, build step, backend, database, payment gateway, or external runtime requests except Google Fonts if not self-hosted (self-hosting is required).
12. No duplicate components or data; every file has a single owner per §2; checksum chain intact across ZIPs.
13. All data validates against §5; no invented prices, fabrics, policies or testimonials; every `TODO-CLIENT` is findable via `grep -r TODO-CLIENT`.
**Quality**
14. Responsive and usable at 360, 768, 1280, 1536 widths; no horizontal scroll; touch targets ≥ 44px.
15. Accessibility: skip link, landmarks, keyboard-operable everything, focus trap + ESC on dialogs, visible focus, `aria-live` toasts, alt text, AA contrast.
16. Performance (mobile, placeholder or real assets): home initial transfer ≤ 1.2 MB, JS ≤ 120 KB gz, LCP image ≤ 150 KB, CLS < 0.1; Lighthouse Performance ≥ 85, Accessibility ≥ 95 where measurable (otherwise logged as unmeasured).
17. Deployable: unzip → push to Git → Cloudflare Pages with no build command works; budget stays within ₹10,000 (domain/hosting free tier; no paid services).
18. `docs/QA-REPORT.md` lists every criterion above as PASS / FAIL / NOT VERIFIED with notes; no FAIL left in functional items 1–7.
